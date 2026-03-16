import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/rooms", label: "Rooms" },
  { path: "/reservations", label: "Reservations" },
  { path: "/pool", label: "Pool" },
  { path: "/maintenance", label: "Maintenance" },
  { path: "/inventory", label: "Inventory" },
  { path: "/feedback", label: "Feedback" },
  { path: "/addons", label: "Add-ons" },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-bold">Resort Management</h1>
          <p className="text-sm text-gray-400">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                location.pathname === item.path
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Button
            variant="ghost"
            className="w-full text-gray-300 hover:text-white"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-gray-900 text-white">
          <h1 className="text-lg font-bold">Resort Management</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
