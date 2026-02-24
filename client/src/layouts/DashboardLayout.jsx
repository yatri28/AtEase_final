import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ role, children }) {
  return (
    <div className="
      flex min-h-screen
      bg-gradient-to-br
      from-gray-50 to-teal-50
      dark:from-gray-900 dark:to-gray-800
      text-gray-900 dark:text-gray-100
    ">
      <Sidebar role={role} />

      <main className="flex-1 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}