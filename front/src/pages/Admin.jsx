import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  CreditCard,
  TrendingUp,
  Megaphone,
  Star,
  Settings,
  LogOut,
  Plus,
  Search,
  MoreHorizontal,
  X,
} from "lucide-react";

// --- Shared UI Components ---

const StatCard = ({ title, value, subtext, trend }) => (
  <div className="bg-barber-gray p-6 border border-white/5 rounded-none">
    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
      {title}
    </h3>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div
      className={`text-xs font-medium ${trend === "up" ? "text-green-500" : "text-gray-500"}`}
    >
      {subtext}
    </div>
  </div>
);

// Updated SectionHeader to handle clicks
const SectionHeader = ({ title, actionLabel, onAction }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
      {title}
    </h2>
    <div className="flex gap-3">
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-barber-gold hover:bg-yellow-600 text-black px-4 py-2 text-sm font-bold uppercase tracking-wide flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {actionLabel}
        </button>
      )}
    </div>
  </div>
);

const Table = ({ headers, children }) => (
  <div className="overflow-x-auto bg-barber-gray border border-white/5">
    <table className="w-full text-left">
      <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-6 py-4 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5 text-sm text-gray-300">
        {children}
      </tbody>
    </table>
  </div>
);

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-barber-gray border border-white/10 w-full max-w-md p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wide">
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
};

// --- Feature Modules ---

const DashboardHome = () => (
  <div className="space-y-8">
    <SectionHeader title="Dashboard Overview" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Today's Revenue"
        value="£450"
        subtext="+12% from last week"
        trend="up"
      />
      <StatCard title="Appointments" value="18" subtext="4 slots remaining" />
      <StatCard
        title="No-Show Rate"
        value="2.1%"
        subtext="Low risk"
        trend="up"
      />
      <StatCard
        title="Avg. Ticket"
        value="£32.50"
        subtext="Target: £30.00"
        trend="up"
      />
    </div>
  </div>
);

const Bookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <SectionHeader title="Bookings" />
      <div className="bg-barber-gray p-6 border border-white/5">
        <h3 className="text-white font-bold mb-4 uppercase text-sm">
          Upcoming Appointments
        </h3>
        {bookings.length === 0 && (
          <p className="text-gray-500">No bookings found.</p>
        )}
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="mb-4 pb-4 border-b border-white/5 last:border-0"
          >
            <div className="text-barber-gold font-bold">
              {new Date(booking.appointment_date).toLocaleDateString()} @{" "}
              {booking.start_time}
            </div>
            <div className="text-white">{booking.customer_name}</div>
            <div className="text-gray-500 text-xs">
              {booking.service_name} • {booking.staff_name || "Any Staff"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState(null);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      const data = res.ok ? await res.json() : [];
      setStaff(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setStaff([]);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSaveStaff = async (e) => {
    e.preventDefault();

    if (!newName) return;

    try {
      const url = isEditing ? `/api/staff/${currentStaffId}` : "/api/staff";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: newName }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save staff");
      }

      setNewName("");
      setIsModalOpen(false);
      setIsEditing(false);
      setCurrentStaffId(null);

      fetchStaff();
    } catch (err) {
      console.error(err);
      alert("Error saving staff: " + err.message);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?"))
      return;

    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete staff");
      }

      fetchStaff();
    } catch (err) {
      console.error(err);
      alert("Error deleting staff: " + err.message);
    }
  };

  const openAddModal = () => {
    setNewName("");
    setIsEditing(false);
    setCurrentStaffId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setNewName(member.full_name);
    setIsEditing(true);
    setCurrentStaffId(member.id);
    setIsModalOpen(true);
  };

  return (
    <div>
      <SectionHeader
        title="Staff Management"
        actionLabel="Add Staff"
        onAction={openAddModal}
      />

      {/* Modal Popup */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit Barber" : "Add New Barber"}
      >
        <form onSubmit={handleSaveStaff} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs uppercase mb-1">
              Barber Name
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-black border border-white/20 text-white p-3 focus:border-barber-gold outline-none"
              placeholder="e.g. Marcus"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-barber-gold text-black font-bold uppercase py-3 hover:bg-white transition-colors"
          >
            {isEditing ? "Update Barber" : "Save Barber"}
          </button>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div
            key={member.id}
            className="bg-barber-gray p-6 border border-white/5 group hover:border-barber-gold/50 transition-colors flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-xl font-bold text-barber-gold">
                {member.full_name ? member.full_name[0] : "?"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {member.full_name}
                </h3>
                <p className="text-gray-500 text-xs uppercase tracking-wide">
                  Barber
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => openEditModal(member)}
                className="text-gray-400 hover:text-white text-xs uppercase"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteStaff(member.id)}
                className="text-red-500 hover:text-red-400 text-xs uppercase"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {staff.length === 0 && (
          <div className="text-gray-500 col-span-full">
            No staff members found.
          </div>
        )}
      </div>
    </div>
  );
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [newService, setNewService] = useState({
    name: "",
    category: "Hair",
    description: "",
    duration_minutes: "30",
    price: "",
  });

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = res.ok ? await res.json() : [];
      setServices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setServices([]);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing
        ? `/api/services/${currentServiceId}`
        : "/api/services";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save service");
      }

      setNewService({
        name: "",
        category: "Hair",
        description: "",
        duration_minutes: "30",
        price: "",
      });
      setIsModalOpen(false);
      setIsEditing(false);
      setCurrentServiceId(null);
      fetchServices();
    } catch (err) {
      console.error(err);
      alert("Error saving service: " + err.message);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete service");
      }
      fetchServices();
    } catch (err) {
      console.error(err);
      alert("Error deleting service: " + err.message);
    }
  };

  const openAddModal = () => {
    setNewService({
      name: "",
      category: "Hair",
      description: "",
      duration_minutes: "30",
      price: "",
    });
    setIsEditing(false);
    setCurrentServiceId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setNewService({
      name: service.name,
      category: service.category,
      description: service.description,
      duration_minutes: service.duration_minutes,
      price: service.price,
    });
    setIsEditing(true);
    setCurrentServiceId(service.id);
    setIsModalOpen(true);
  };

  return (
    <div>
      <SectionHeader
        title="Service Menu"
        actionLabel="Add Service"
        onAction={openAddModal}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit Service" : "Add New Service"}
      >
        <form onSubmit={handleSaveService} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs uppercase mb-1">
              Service Name
            </label>
            <input
              type="text"
              required
              value={newService.name}
              onChange={(e) =>
                setNewService({ ...newService, name: e.target.value })
              }
              className="w-full bg-black border border-white/20 text-white p-3 focus:border-barber-gold outline-none"
              placeholder="e.g. Skin Fade"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs uppercase mb-1">
                Category
              </label>
              <select
                value={newService.category}
                onChange={(e) =>
                  setNewService({ ...newService, category: e.target.value })
                }
                className="w-full bg-black border border-white/20 text-white p-3 focus:border-barber-gold outline-none"
              >
                <option value="Hair">Hair</option>
                <option value="Beard">Beard</option>
                <option value="Package">Package</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs uppercase mb-1">
                Price (£)
              </label>
              <input
                type="number"
                required
                value={newService.price}
                onChange={(e) =>
                  setNewService({ ...newService, price: e.target.value })
                }
                className="w-full bg-black border border-white/20 text-white p-3 focus:border-barber-gold outline-none"
                placeholder="25.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs uppercase mb-1">
                Duration (Min)
              </label>
              <input
                type="number"
                required
                value={newService.duration_minutes}
                onChange={(e) =>
                  setNewService({
                    ...newService,
                    duration_minutes: e.target.value,
                  })
                }
                className="w-full bg-black border border-white/20 text-white p-3 focus:border-barber-gold outline-none"
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs uppercase mb-1">
              Description
            </label>
            <textarea
              value={newService.description}
              onChange={(e) =>
                setNewService({ ...newService, description: e.target.value })
              }
              className="w-full bg-black border border-white/20 text-white p-3 focus:border-barber-gold outline-none h-20"
              placeholder="Brief description of the service..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-barber-gold text-black font-bold uppercase py-3 hover:bg-white transition-colors"
          >
            {isEditing ? "Update Service" : "Save Service"}
          </button>
        </form>
      </Modal>

      <Table
        headers={["Name", "Category", "Duration", "Price", "Status", "Actions"]}
      >
        {services.map((s, i) => (
          <tr key={i} className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-4 font-bold text-white">
              {s.name}
              <div className="text-xs text-gray-500 font-normal">
                {s.description}
              </div>
            </td>
            <td className="px-6 py-4 text-gray-400">{s.category}</td>
            <td className="px-6 py-4 text-gray-400">{s.duration_minutes}m</td>
            <td className="px-6 py-4 font-mono text-barber-gold">£{s.price}</td>
            <td className="px-6 py-4">
              <span className="text-green-500">Active</span>
            </td>
            <td className="px-6 py-4 flex gap-2">
              <button
                onClick={() => openEditModal(s)}
                className="text-gray-400 hover:text-white text-xs uppercase"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteService(s.id)}
                className="text-red-500 hover:text-red-400 text-xs uppercase"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
        {services.length === 0 && (
          <tr>
            <td colSpan="6" className="p-4 text-center text-gray-500">
              No services found.
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
};

// --- Main Layout ---

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "" },
  { icon: Calendar, label: "Bookings", path: "bookings" },
  { icon: Users, label: "Staff", path: "staff" },
  { icon: Scissors, label: "Services", path: "services" },
];

export default function Admin() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black flex text-white font-sans">
      <aside className="w-64 bg-barber-gray border-r border-white/5 hidden md:flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-8 border-b border-white/5 bg-barber-gray">
          <span className="text-xl font-bold tracking-widest uppercase">
            Blade Admin
          </span>
        </div>
        <nav className="flex-1 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const fullPath = item.path ? `/admin/${item.path}` : "/admin";
            const isActive =
              location.pathname === fullPath ||
              (item.path !== "" && location.pathname.startsWith(fullPath));
            return (
              <Link
                key={item.label}
                to={fullPath}
                className={`flex items-center px-8 py-3 text-sm font-medium transition-colors ${isActive ? "text-barber-gold bg-white/5 border-r-2 border-barber-gold" : "text-gray-400 hover:text-white"}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t border-white/5">
          <Link
            to="/"
            className="flex items-center text-gray-400 hover:text-white text-sm"
          >
            <LogOut className="w-5 h-5 mr-3" /> Back to Site
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-0 md:ml-64 bg-black p-8 min-h-screen">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="staff" element={<Staff />} />
          <Route path="services" element={<Services />} />
        </Routes>
      </main>
    </div>
  );
}
