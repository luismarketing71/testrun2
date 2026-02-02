import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Helper to generate 30-minute slots
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 9;
  const endHour = 18; // 6 PM

  for (let i = startHour; i < endHour; i++) {
    slots.push(`${i.toString().padStart(2, "0")}:00`);
    slots.push(`${i.toString().padStart(2, "0")}:30`);
  }
  return slots;
};

const timeSlots = generateTimeSlots();

// Helper: Convert "HH:MM" to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function Book() {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState({ bookings: [], staff: [] });

  const [formData, setFormData] = useState({
    serviceId: "",
    staffId: "",
    date: "",
    time: "",
    name: "",
    email: "",
  });

  useEffect(() => {
    // Fetch data for dropdowns
    const fetchData = async () => {
      try {
        const [servicesRes, staffRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/staff"),
        ]);

        if (servicesRes.ok) setServices(await servicesRes.json());
        if (staffRes.ok) setStaff(await staffRes.json());
        setLoading(false);
      } catch (err) {
        console.error("Failed to load booking data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch availability when date changes
  useEffect(() => {
    if (!formData.date) return;

    const fetchAvailability = async () => {
      try {
        const res = await fetch(`/api/availability?date=${formData.date}`);
        if (res.ok) {
          setAvailability(await res.json());
        }
      } catch (err) {
        console.error("Failed to load availability", err);
      }
    };
    fetchAvailability();
  }, [formData.date]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isSlotAvailable = (slotTime) => {
    if (!formData.serviceId) return true; // Can't check without duration

    const service = services.find((s) => String(s.id) === formData.serviceId);
    const duration = service ? service.duration_minutes || 30 : 30;

    const startMin = timeToMinutes(slotTime);
    const endMin = startMin + duration;

    const isOverlapping = (bStart, bEnd) => {
      const bStartMin = timeToMinutes(bStart);
      const bEndMin = timeToMinutes(bEnd);
      return Math.max(startMin, bStartMin) < Math.min(endMin, bEndMin);
    };

    if (formData.staffId) {
      // Specific Staff: Check if THIS staff has a collision
      return !availability.bookings.some(
        (b) =>
          String(b.staff_id) === String(formData.staffId) &&
          isOverlapping(b.start_time, b.end_time),
      );
    } else {
      // Any Staff: Check if ALL staff are busy
      const busyStaffIds = new Set();
      availability.bookings.forEach((b) => {
        if (isOverlapping(b.start_time, b.end_time)) {
          busyStaffIds.add(b.staff_id);
        }
      });
      // If number of busy staff < total active staff, then at least one is free
      return busyStaffIds.size < availability.staff.length;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Booking Request Sent Successfully!");
        // Reset form
        setFormData({
          serviceId: "",
          staffId: "",
          date: "",
          time: "",
          name: "",
          email: "",
        });
      } else {
        const err = await res.json();
        alert("Failed to submit booking: " + (err.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("An error occurred.");
    }
  };

  if (loading)
    return (
      <div className="text-white text-center pt-24">Loading options...</div>
    );

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-barber-gray p-8 md:p-12 border border-white/10 rounded-none shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-white mb-8 text-center uppercase">
          Book Appointment
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
              Select Service
            </label>
            <select
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              required
              className="w-full bg-barber-black border border-white/10 text-white p-4 rounded-none focus:ring-2 focus:ring-barber-gold focus:border-transparent transition-all"
            >
              <option value="">-- Choose a Service --</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - £{s.price} ({s.duration_minutes}m)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Select Barber
              </label>
              <select
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                className="w-full bg-barber-black border border-white/10 text-white p-4 rounded-none focus:ring-2 focus:ring-barber-gold focus:border-transparent transition-all"
              >
                <option value="">Any Available</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Date & Time
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-barber-black border border-white/10 text-white p-4 rounded-none focus:ring-2 focus:ring-barber-gold focus:border-transparent transition-all"
                />
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  disabled={!formData.date}
                  className={`w-full bg-barber-black border border-white/10 text-white p-4 rounded-none focus:ring-2 focus:ring-barber-gold focus:border-transparent transition-all ${!formData.date ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {formData.date ? "-- Time --" : "Select Date First"}
                  </option>
                  {timeSlots.map((slot) => {
                    const isAvailable = isSlotAvailable(slot);
                    return (
                      <option
                        key={slot}
                        value={slot}
                        disabled={!isAvailable}
                        className={
                          !isAvailable ? "text-gray-600 bg-gray-900" : ""
                        }
                      >
                        {slot} {isAvailable ? "" : "(Taken)"}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
              Your Details
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-barber-black border border-white/10 text-white p-4 rounded-none focus:ring-2 focus:ring-barber-gold focus:border-transparent transition-all"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-barber-black border border-white/10 text-white p-4 rounded-none focus:ring-2 focus:ring-barber-gold focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-barber-gold text-black font-bold uppercase tracking-widest py-4 mt-8 hover:bg-white transition-colors"
          >
            Confirm Booking
          </button>
        </form>
      </motion.div>
    </div>
  );
}
