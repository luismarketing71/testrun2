import React, { useState } from "react";
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
  Filter,
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

const SectionHeader = ({ title, action }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
      {title}
    </h2>
    <div className="flex gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="pl-10 pr-4 py-2 bg-barber-gray border border-white/10 text-white text-sm focus:outline-none focus:border-barber-gold w-64"
        />
      </div>
      {action && (
        <button className="bg-barber-gold hover:bg-yellow-600 text-black px-4 py-2 text-sm font-bold uppercase tracking-wide flex items-center gap-2 transition-colors">
          <Plus className="h-4 w-4" />
          {action}
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

// --- Feature Modules ---

const DashboardHome = () => (
  <div className="space-y-8">
    <SectionHeader title="Dashboard Overview" />

    {/* Core Stats */}
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

    {/* Live Indicators */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-barber-gray border border-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4 uppercase">
          Today's Schedule
        </h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors border-l-2 border-barber-gold"
            >
              <div className="flex items-center gap-6">
                <span className="text-barber-gold font-mono text-lg">
                  10:00
                </span>
                <div>
                  <div className="font-bold text-white text-base">John Doe</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    Skin Fade • Luis
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-wider">
                Confirmed
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-barber-gray border border-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4 uppercase">
          Quick Actions
        </h3>
        <div className="space-y-3">
          <button className="w-full bg-barber-gold text-black font-bold uppercase text-sm py-4 hover:bg-white transition-colors">
            Add New Booking
          </button>
          <button className="w-full bg-white/5 text-white font-bold uppercase text-sm py-3 hover:bg-white/10 transition-colors border border-white/10">
            Block Time
          </button>
          <button className="w-full bg-white/5 text-white font-bold uppercase text-sm py-3 hover:bg-white/10 transition-colors border border-white/10">
            Register Walk-in
          </button>
        </div>
      </div>
    </div>
  </div>
);

const Bookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          console.error("Bookings API returned non-array:", data);
          setBookings([]);
        }
      })
      .catch((err) => console.error("Failed to load bookings:", err));
  }, []);

  return (
    <div>
      <SectionHeader title="Bookings & Calendar" action="New Booking" />
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-5 bg-barber-gray border border-white/5 p-6 min-h-[500px]">
          {/* Calendar Placeholder UI */}
          <div className="grid grid-cols-7 gap-px bg-white/10 border border-white/10 mb-4 text-center text-gray-400 text-xs uppercase py-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-white/5 h-96">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="bg-barber-gray hover:bg-white/5 p-2 transition-colors relative"
              >
                <span className="text-gray-600 text-xs">{i + 1}</span>
                {i === 14 && (
                  <div className="absolute inset-x-1 top-6 bg-barber-gold/80 text-black text-[10px] font-bold px-1 py-0.5 truncate">
                    Booked
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-barber-gray p-6 border border-white/5">
            <h3 className="text-white font-bold mb-4 uppercase text-sm">
              Upcoming
            </h3>
            {bookings.length === 0 && (
              <p className="text-gray-500 text-xs">No upcoming bookings.</p>
            )}
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="mb-4 pb-4 border-b border-white/5 last:border-0 last:pb-0"
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
      </div>
    </div>
  );
};

const Staff = () => {
  // Initialize with empty array to prevent render crashes
  const [staff, setStaff] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState(null);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      if (!res.ok) {
        // If 500/404, just return empty list so page doesn't break
        console.warn("Staff fetch failed", res.status);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setStaff(data);
      }
    } catch (err) {
      console.error("Error loading staff:", err);
      setError("Could not load staff.");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newName) return;
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: newName }),
      });
      if (res.ok) {
        setNewName("");
        setIsAdding(false);
        fetchStaff(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <SectionHeader title="Staff Management" action="Add Staff" />

      {/* Add Staff Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-barber-gold text-black px-4 py-2 font-bold uppercase text-sm mb-4"
        >
          {isAdding ? "Cancel" : "Add New Staff"}
        </button>

        {isAdding && (
          <form
            onSubmit={handleAddStaff}
            className="bg-white/5 p-4 border border-white/10 flex gap-4 items-end"
          >
            <div className="flex-1">
              <label className="block text-gray-400 text-xs uppercase mb-1">
                Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-black border border-white/20 text-white p-2 focus:border-barber-gold outline-none"
                placeholder="e.g. John Doe"
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 font-bold uppercase text-sm"
            >
              Save
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div
            key={member.id || Math.random()}
            className="bg-barber-gray p-6 border border-white/5 group hover:border-barber-gold/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-6">
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
            </div>
            {/* Visual placeholder stats to match original look */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-white/5 mb-4">
              <div>
                <div className="text-xs text-gray-500 uppercase">Status</div>
                <div className="text-white font-mono">Active</div>
              </div>
            </div>
          </div>
        ))}
        {staff.length === 0 && !error && (
          <div className="text-gray-500 col-span-full py-8 text-center border border-dashed border-white/10">
            No staff members found. Add one to get started.
          </div>
        )}
      </div>
    </div>
  );
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    duration: 30,
  });

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      if (!res.ok) {
        console.warn("Services fetch failed", res.status);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setServices(data);
      }
    } catch (err) {
      console.error("Error loading services:", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newService.name || !newService.price) return;
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      });
      if (res.ok) {
        setNewService({ name: "", price: "", duration: 30 });
        setIsAdding(false);
        fetchServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <SectionHeader title="Service Menu" action="Add Service" />

      <div className="mb-6">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-barber-gold text-black px-4 py-2 font-bold uppercase text-sm mb-4"
        >
          {isAdding ? "Cancel" : "Add New Service"}
        </button>

        {isAdding && (
          <form
            onSubmit={handleAddService}
            className="bg-white/5 p-4 border border-white/10 grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label className="block text-gray-400 text-xs uppercase mb-1">
                Service Name
              </label>
              <input
                type="text"
                value={newService.name}
                onChange={(e) =>
                  setNewService({ ...newService, name: e.target.value })
                }
                className="w-full bg-black border border-white/20 text-white p-2 focus:border-barber-gold outline-none"
                placeholder="e.g. Skin Fade"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs uppercase mb-1">
                Price (£)
              </label>
              <input
                type="number"
                value={newService.price}
                onChange={(e) =>
                  setNewService({ ...newService, price: e.target.value })
                }
                className="w-full bg-black border border-white/20 text-white p-2 focus:border-barber-gold outline-none"
                placeholder="25.00"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs uppercase mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                value={newService.duration}
                onChange={(e) =>
                  setNewService({ ...newService, duration: e.target.value })
                }
                className="w-full bg-black border border-white/20 text-white p-2 focus:border-barber-gold outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 font-bold uppercase text-sm h-10"
            >
              Save
            </button>
          </form>
        )}
      </div>

      <Table headers={["Service Name", "Price", "Status", ""]}>
        {services.map((s, i) => (
          <tr key={i} className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-4 font-bold text-white">{s.name}</td>
            <td className="px-6 py-4 font-mono text-barber-gold">£{s.price}</td>
            <td className="px-6 py-4">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2"></span>
              Active
            </td>
            <td className="px-6 py-4 text-right">
              <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                Edit
              </button>
            </td>
          </tr>
        ))}
        {services.length === 0 && (
          <tr>
            <td colSpan="4" className="p-4 text-center text-gray-500">
              No services found. Add one above.
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
};
const Customers = () => (
  <div>
    <SectionHeader title="Customer CRM" action="Add Client" />
    <Table
      headers={[
        "Customer",
        "Last Visit",
        "Total Spend",
        "Visits",
        "Status",
        "",
      ]}
    >
      {[
        {
          name: "Harvey Specter",
          last: "2 days ago",
          spend: "£450",
          visits: 12,
          status: "VIP",
        },
        {
          name: "Mike Ross",
          last: "1 week ago",
          spend: "£120",
          visits: 4,
          status: "Regular",
        },
        {
          name: "Louis Litt",
          last: "3 weeks ago",
          spend: "£850",
          visits: 25,
          status: "VIP",
        },
        {
          name: "Rachel Zane",
          last: "Yesterday",
          spend: "£60",
          visits: 2,
          status: "New",
        },
      ].map((c, i) => (
        <tr key={i} className="hover:bg-white/5 transition-colors">
          <td className="px-6 py-4">
            <div className="font-bold text-white">{c.name}</div>
            <div className="text-xs text-gray-500">harvey@firm.com</div>
          </td>
          <td className="px-6 py-4 text-gray-400">{c.last}</td>
          <td className="px-6 py-4 text-white">{c.spend}</td>
          <td className="px-6 py-4">{c.visits}</td>
          <td className="px-6 py-4">
            <span
              className={`text-[10px] font-bold px-2 py-1 uppercase ${c.status === "VIP" ? "bg-barber-gold text-black" : "bg-white/10 text-gray-400"}`}
            >
              {c.status}
            </span>
          </td>
          <td className="px-6 py-4 text-right">
            <MoreHorizontal className="w-4 h-4 text-gray-500 ml-auto" />
          </td>
        </tr>
      ))}
    </Table>
  </div>
);

const Payments = () => (
  <div>
    <SectionHeader title="Transactions" action="New Sale" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Sales (Today)"
        value="£850.00"
        subtext="15 Transactions"
        trend="up"
      />
      <StatCard title="Cash" value="£200.00" subtext="23%" />
      <StatCard title="Card" value="£650.00" subtext="77%" />
    </div>
    <Table
      headers={[
        "ID",
        "Time",
        "Customer",
        "Service",
        "Amount",
        "Method",
        "Status",
      ]}
    >
      {[
        {
          id: "#1023",
          time: "14:30",
          cust: "John Doe",
          svc: "Skin Fade",
          amt: "£30.00",
          method: "Card",
          status: "Paid",
        },
        {
          id: "#1022",
          time: "13:15",
          cust: "Jane Smith",
          svc: "Consultation",
          amt: "£0.00",
          method: "-",
          status: "Free",
        },
        {
          id: "#1021",
          time: "12:00",
          cust: "Mike Ross",
          svc: "Full Works",
          amt: "£55.00",
          method: "Cash",
          status: "Paid",
        },
      ].map((t, i) => (
        <tr key={i} className="hover:bg-white/5 transition-colors">
          <td className="px-6 py-4 font-mono text-gray-500">{t.id}</td>
          <td className="px-6 py-4 text-gray-400">{t.time}</td>
          <td className="px-6 py-4 text-white">{t.cust}</td>
          <td className="px-6 py-4 text-gray-400">{t.svc}</td>
          <td className="px-6 py-4 font-bold text-white">{t.amt}</td>
          <td className="px-6 py-4 text-gray-400">{t.method}</td>
          <td className="px-6 py-4">
            <span className="text-green-500 text-xs font-bold uppercase">
              {t.status}
            </span>
          </td>
        </tr>
      ))}
    </Table>
  </div>
);

const Reports = () => (
  <div className="space-y-8">
    <SectionHeader title="Analytics & Reports" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-barber-gray p-8 border border-white/5 flex flex-col items-center justify-center min-h-[300px]">
        <TrendingUp className="w-16 h-16 text-white/10 mb-4" />
        <h3 className="text-white font-bold mb-2">Revenue Growth</h3>
        <p className="text-gray-500 text-sm text-center max-w-xs">
          Detailed charts would be rendered here using Recharts or Chart.js
        </p>
      </div>
      <div className="bg-barber-gray p-8 border border-white/5 flex flex-col items-center justify-center min-h-[300px]">
        <Users className="w-16 h-16 text-white/10 mb-4" />
        <h3 className="text-white font-bold mb-2">Customer Retention</h3>
        <p className="text-gray-500 text-sm text-center max-w-xs">
          Cohort analysis visualizations would go here.
        </p>
      </div>
    </div>
  </div>
);

const Marketing = () => (
  <div>
    <SectionHeader title="Marketing Campaigns" action="New Campaign" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-barber-gray p-6 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Megaphone className="w-24 h-24" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Summer Promo</h3>
        <p className="text-gray-400 text-sm mb-4">20% off for students.</p>
        <div className="w-full bg-white/10 h-1 mt-4 mb-2">
          <div className="bg-green-500 h-1 w-3/4"></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Sent: 1,200</span>
          <span>Open Rate: 45%</span>
        </div>
      </div>
      <div className="bg-barber-gray p-6 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Star className="w-24 h-24" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Win Back</h3>
        <p className="text-gray-400 text-sm mb-4">
          Clients inactive for 60+ days.
        </p>
        <div className="w-full bg-white/10 h-1 mt-4 mb-2">
          <div className="bg-barber-gold h-1 w-1/4"></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Sent: 450</span>
          <span>Recovered: 12%</span>
        </div>
      </div>
    </div>
  </div>
);

const ShopSettings = () => (
  <div>
    <SectionHeader title="Shop Settings" />
    <div className="max-w-2xl bg-barber-gray border border-white/5 p-8">
      <h3 className="text-white font-bold mb-6 uppercase border-b border-white/10 pb-4">
        General Info
      </h3>
      <div className="space-y-6">
        <div>
          <label className="block text-gray-400 text-sm mb-2">Shop Name</label>
          <input
            type="text"
            defaultValue="Blade & Co."
            className="w-full bg-black border border-white/10 text-white p-3 focus:border-barber-gold outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Opening Time
            </label>
            <input
              type="time"
              defaultValue="09:00"
              className="w-full bg-black border border-white/10 text-white p-3 focus:border-barber-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Closing Time
            </label>
            <input
              type="time"
              defaultValue="20:00"
              className="w-full bg-black border border-white/10 text-white p-3 focus:border-barber-gold outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-2">Currency</label>
          <select className="w-full bg-black border border-white/10 text-white p-3 focus:border-barber-gold outline-none">
            <option>GBP (£)</option>
            <option>USD ($)</option>
            <option>EUR (€)</option>
          </select>
        </div>
        <button className="bg-barber-gold text-black font-bold uppercase px-6 py-3 text-sm hover:bg-white transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  </div>
);

// --- Layout & Sidebar ---

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "" },
  { icon: Calendar, label: "Bookings", path: "bookings" },
  { icon: Users, label: "Staff", path: "staff" },
  { icon: Scissors, label: "Services", path: "services" },
  { icon: Star, label: "Customers", path: "customers" },
  { icon: CreditCard, label: "Payments", path: "payments" },
  { icon: TrendingUp, label: "Reports", path: "reports" },
  { icon: Megaphone, label: "Marketing", path: "marketing" },
  { icon: Settings, label: "Settings", path: "settings" },
];

export default function Admin() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-barber-gray border-r border-white/5 hidden md:flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-8 border-b border-white/5 bg-barber-gray">
          <span className="text-xl font-bold text-white tracking-widest uppercase">
            Blade Admin
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-1">
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
                className={`flex items-center px-8 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-barber-gold bg-white/5 border-r-2 border-barber-gold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
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
            className="flex items-center text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 bg-black p-8 min-h-screen">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="staff" element={<Staff />} />
          <Route path="services" element={<Services />} />
          <Route path="customers" element={<Customers />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="settings" element={<ShopSettings />} />
        </Routes>
      </main>
    </div>
  );
}
