import Sidebar from '@/components/layout/Sidebar';
import DashboardDbLoader from '@/components/layout/DashboardDbLoader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardDbLoader>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </DashboardDbLoader>
  );
}
