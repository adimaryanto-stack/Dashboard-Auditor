import { supabase } from '@/lib/supabase';

/**
 * Recalculates and updates the parent Kabupaten/Kota and Provinsi rollups in both
 * the Zustand store and Supabase when an school (institusi_pendidikan) is updated.
 */
export async function rollupInstitusiChange(
  dbData: any,
  setDbData: (data: any) => void,
  institusiId: string,
  updates?: { nominal_alokasi?: number; realisasi_total?: number }
) {
  if (!dbData) return;

  // 1. Update the target school in dbData
  const updatedDbInst = dbData.institusi_pendidikan.map((inst: any) => {
    if (inst.id === institusiId) {
      const nominal = updates?.nominal_alokasi !== undefined ? updates.nominal_alokasi : Number(inst.nominal_alokasi);
      const real = updates?.realisasi_total !== undefined ? updates.realisasi_total : Number(inst.realisasi_total);
      return {
        ...inst,
        nominal_alokasi: nominal,
        realisasi_total: real,
        selisih: nominal - real,
        persentase_penyerapan: nominal > 0 ? (real / nominal) * 100 : 0,
        updated_at: new Date().toISOString()
      };
    }
    return inst;
  });

  const targetSchool = updatedDbInst.find((i: any) => i.id === institusiId);
  if (!targetSchool) return;

  const kabkotaId = targetSchool.kabupaten_kota_id;

  // 2. Recalculate rollup for parent Kabupaten/Kota
  const kabkotaSchools = updatedDbInst.filter((inst: any) => inst.kabupaten_kota_id === kabkotaId);
  const newKabNominal = kabkotaSchools.reduce((s: number, inst: any) => s + Number(inst.nominal_alokasi), 0);
  const newKabRealisasi = kabkotaSchools.reduce((s: number, inst: any) => s + Number(inst.realisasi_total), 0);

  const updatedDbAlokasiKab = dbData.alokasi_kabupaten_kota.map((akk: any) => {
    if (akk.kabupaten_kota_id === kabkotaId) {
      return {
        ...akk,
        nominal_alokasi: newKabNominal,
        realisasi_total: newKabRealisasi,
        selisih: newKabNominal - newKabRealisasi,
        persentase_penyerapan: newKabNominal > 0 ? (newKabRealisasi / newKabNominal) * 100 : 0,
        updated_at: new Date().toISOString()
      };
    }
    return akk;
  });

  const targetKab = updatedDbAlokasiKab.find((akk: any) => akk.kabupaten_kota_id === kabkotaId);
  const provId = targetKab?.alokasi_provinsi_id;

  // 3. Recalculate rollup for parent Province
  let updatedDbAlokasiProv = dbData.alokasi_provinsi;
  if (provId) {
    const provinceKabkotaList = updatedDbAlokasiKab.filter((akk: any) => akk.alokasi_provinsi_id === provId);
    const newProvNominal = provinceKabkotaList.reduce((s: number, k: any) => s + Number(k.nominal_alokasi), 0);
    const newProvRealisasi = provinceKabkotaList.reduce((s: number, k: any) => s + Number(k.realisasi_total), 0);

    updatedDbAlokasiProv = dbData.alokasi_provinsi.map((ap: any) => {
      if (ap.id === provId) {
        return {
          ...ap,
          nominal_alokasi: newProvNominal,
          realisasi_total: newProvRealisasi,
          selisih: newProvNominal - newProvRealisasi,
          persentase_penyerapan: newProvNominal > 0 ? (newProvRealisasi / newProvNominal) * 100 : 0,
          updated_at: new Date().toISOString()
        };
      }
      return ap;
    });
  }

  // 4. Update Zustand store
  setDbData({
    ...dbData,
    institusi_pendidikan: updatedDbInst,
    alokasi_kabupaten_kota: updatedDbAlokasiKab,
    alokasi_provinsi: updatedDbAlokasiProv
  });

  // 5. Update Supabase
  try {
    // A. Update School
    if (updates) {
      const { error: instErr } = await supabase
        .from('institusi_pendidikan')
        .update({
          nominal_alokasi: targetSchool.nominal_alokasi,
          realisasi_total: targetSchool.realisasi_total,
          selisih: targetSchool.selisih,
          persentase_penyerapan: targetSchool.persentase_penyerapan,
          updated_at: targetSchool.updated_at
        })
        .eq('id', institusiId);
      if (instErr) throw instErr;
    }

    // B. Update Kabkota
    if (targetKab) {
      const { error: kabErr } = await supabase
        .from('alokasi_kabupaten_kota')
        .update({
          nominal_alokasi: targetKab.nominal_alokasi,
          realisasi_total: targetKab.realisasi_total,
          selisih: targetKab.selisih,
          persentase_penyerapan: targetKab.persentase_penyerapan,
          updated_at: targetKab.updated_at
        })
        .eq('kabupaten_kota_id', kabkotaId);
      if (kabErr) throw kabErr;
    }

    // C. Update Province
    if (provId) {
      const targetProv = updatedDbAlokasiProv.find((ap: any) => ap.id === provId);
      if (targetProv) {
        const { error: provErr } = await supabase
          .from('alokasi_provinsi')
          .update({
            nominal_alokasi: targetProv.nominal_alokasi,
            realisasi_total: targetProv.realisasi_total,
            selisih: targetProv.selisih,
            persentase_penyerapan: targetProv.persentase_penyerapan,
            updated_at: targetProv.updated_at
          })
          .eq('id', provId);
        if (provErr) throw provErr;
      }
    }
  } catch (err: any) {
    console.error('Error during Supabase rollup synchronization:', err.message);
  }
}

/**
 * Recalculates and updates the parent Provinsi rollup in both the Zustand store
 * and Supabase when a Kabupaten/Kota (alokasi_kabupaten_kota) is updated.
 */
export async function rollupKabKotaChange(
  dbData: any,
  setDbData: (data: any) => void,
  alokasiKabKotaId: string,
  updates?: { nominal_alokasi?: number; realisasi_total?: number }
) {
  if (!dbData) return;

  // 1. Update target Kabupaten/Kota in dbData
  const updatedDbAlokasiKab = dbData.alokasi_kabupaten_kota.map((akk: any) => {
    if (akk.id === alokasiKabKotaId) {
      const nominal = updates?.nominal_alokasi !== undefined ? updates.nominal_alokasi : Number(akk.nominal_alokasi);
      const real = updates?.realisasi_total !== undefined ? updates.realisasi_total : Number(akk.realisasi_total);
      return {
        ...akk,
        nominal_alokasi: nominal,
        realisasi_total: real,
        selisih: nominal - real,
        persentase_penyerapan: nominal > 0 ? (real / nominal) * 100 : 0,
        updated_at: new Date().toISOString()
      };
    }
    return akk;
  });

  const targetKab = updatedDbAlokasiKab.find((akk: any) => akk.id === alokasiKabKotaId);
  if (!targetKab) return;

  const provId = targetKab.alokasi_provinsi_id;

  // 2. Recalculate rollup for parent Province
  const provinceKabkotaList = updatedDbAlokasiKab.filter((akk: any) => akk.alokasi_provinsi_id === provId);
  const newProvNominal = provinceKabkotaList.reduce((s: number, k: any) => s + Number(k.nominal_alokasi), 0);
  const newProvRealisasi = provinceKabkotaList.reduce((s: number, k: any) => s + Number(k.realisasi_total), 0);

  const updatedDbAlokasiProv = dbData.alokasi_provinsi.map((ap: any) => {
    if (ap.id === provId) {
      return {
        ...ap,
        nominal_alokasi: newProvNominal,
        realisasi_total: newProvRealisasi,
        selisih: newProvNominal - newProvRealisasi,
        persentase_penyerapan: newProvNominal > 0 ? (newProvRealisasi / newProvNominal) * 100 : 0,
        updated_at: new Date().toISOString()
      };
    }
    return ap;
  });

  // 3. Update Zustand store
  setDbData({
    ...dbData,
    alokasi_kabupaten_kota: updatedDbAlokasiKab,
    alokasi_provinsi: updatedDbAlokasiProv
  });

  // 4. Update Supabase
  try {
    if (updates) {
      const { error: kabErr } = await supabase
        .from('alokasi_kabupaten_kota')
        .update({
          nominal_alokasi: targetKab.nominal_alokasi,
          realisasi_total: targetKab.realisasi_total,
          selisih: targetKab.selisih,
          persentase_penyerapan: targetKab.persentase_penyerapan,
          updated_at: targetKab.updated_at
        })
        .eq('id', alokasiKabKotaId);
      if (kabErr) throw kabErr;
    }

    const targetProv = updatedDbAlokasiProv.find((ap: any) => ap.id === provId);
    if (targetProv) {
      const { error: provErr } = await supabase
        .from('alokasi_provinsi')
        .update({
          nominal_alokasi: targetProv.nominal_alokasi,
          realisasi_total: targetProv.realisasi_total,
          selisih: targetProv.selisih,
          persentase_penyerapan: targetProv.persentase_penyerapan,
          updated_at: targetProv.updated_at
        })
        .eq('id', provId);
      if (provErr) throw provErr;
    }
  } catch (err: any) {
    console.error('Error during Supabase kabkota rollup synchronization:', err.message);
  }
}
