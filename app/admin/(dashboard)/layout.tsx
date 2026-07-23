import Sidebar from "../components/Sidebar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-raise lg:flex">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden p-5 sm:p-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
