import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, history, anomalyContext } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Kunci API GEMINI_API_KEY belum dikonfigurasi di file .env server.' },
        { status: 500 }
      );
    }

    // 1. Definisikan System Instruction dan Konteks Anomali 5W1H
    const systemPrompt = `
Anda adalah asisten audit forensik keuangan virtual bertenaga Gemini yang bertugas membantu seorang auditor BPK RI / Inspektorat.
Tugas Anda adalah menjawab pertanyaan auditor mengenai anomali anggaran yang sedang dibuka secara profesional, rinci, dan berfokus pada data.

Berikut adalah konteks anomali yang sedang dibuka:
- Nama Institusi: ${anomalyContext.nama_institusi}
- Jenjang Pendidikan: ${anomalyContext.jenjang}
- Tipe Anomali: ${anomalyContext.tipe_anomali}
- Tingkat Keparahan: ${anomalyContext.tingkat_keparahan}
- Status Tindak Lanjut: ${anomalyContext.status}
- Periode Transaksi: ${anomalyContext.bulan} / 2026
- Potensi Selisih/Kerugian: Rp ${anomalyContext.nominal_selisih}
- Tanggal Temuan: ${anomalyContext.tanggal_ditemukan}

Detail Kasus (5W1H):
- What (Temuan): ${anomalyContext.audit_what || anomalyContext.tipe_anomali}
- Why (Alasan): ${anomalyContext.audit_why || anomalyContext.keterangan}
- Where (Lokasi): ${anomalyContext.audit_where}
- When (Waktu): ${anomalyContext.audit_when}
- Who (Pihak Terkait): ${anomalyContext.audit_who}
- How (Saran Tindak Lanjuti): ${anomalyContext.audit_how}

Aturan Penulisan Jawaban Anda:
1. Selalu jawab dalam Bahasa Indonesia yang formal, taktis, dan berciri khas laporan audit keuangan negara.
2. Jawab pertanyaan berdasarkan fakta yang diberikan di atas. Jangan mengarang nama orang atau nama PT di luar yang tercantum pada field 'Who' atau 'Where' di atas.
3. Jika ditanya bagaimana solusi (How), jelaskan langkah-langkah rekomendasi audit yang logis dan aman (misalnya: penangguhan anggaran, klarifikasi formal, audit fisik lapangan / stock opname, atau pembetulan pajak).
4. Jika ditanya hal umum tentang prosedur audit, Anda boleh memberikan penjelasan edukatif singkat tentang cara mengaudit kasus serupa.
5. Jaga jawaban tetap padat, jelas, dan berorientasi pada penyelesaian kasus.
`;

    // 2. Susun histori percakapan ke dalam prompt tunggal untuk model
    let fullPrompt = `${systemPrompt}\n\nRiwayat Percakapan Sebelumnya:\n`;
    
    // Saring riwayat (abaikan pesan selamat datang bawaan untuk menghemat token & memfokuskan model)
    const filteredHistory = history.filter((msg: any) => msg.id !== 'welcome');
    
    filteredHistory.forEach((msg: any) => {
      const role = msg.sender === 'user' ? 'Auditor' : 'Asisten Gemini';
      fullPrompt += `${role}: ${msg.text}\n`;
    });
    
    fullPrompt += `Auditor: ${message}\nAsisten Gemini:`;

    // 3. Panggil API REST Google Gemini 1.5 Flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Gagal memanggil API Gemini: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada respon dari model AI.';

    return NextResponse.json({ text: aiResponseText });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan internal pada API Route.' },
      { status: 500 }
    );
  }
}
