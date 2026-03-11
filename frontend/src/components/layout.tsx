import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Button } from "./ui/button";

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/rooms", label: "Rooms" },
  { path: "/reservations", label: "Reservations" },
  { path: "/pool", label: "Pool" },
  { path: "/maintenance", label: "Maintenance" },
  { path: "/inventory", label: "Inventory" },
  { path: "/feedback", label: "Feedback" },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
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
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
