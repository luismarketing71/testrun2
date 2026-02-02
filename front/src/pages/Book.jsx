import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Helper: Convert "HH:MM" to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper: Convert minutes to "HH:MM"
const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export default function Book() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState({
    bookings: [],
    staff: [],
    schedules: [],
  });

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

  // Generate Time Slots based on Schedules
  const timeSlots = useMemo(() => {
    if (!availability.schedules || availability.schedules.length === 0) {
      return [];
    }

    // Filter relevant schedules
    let activeSchedules = availability.schedules.filter((s) => s.is_working);

    if (formData.staffId) {
      activeSchedules = activeSchedules.filter(
        (s) => String(s.staff_id) === String(formData.staffId),
      );
    }

    if (activeSchedules.length === 0) return [];

    // Find global start and end times
    let minStart = 24 * 60;
    let maxEnd = 0;

    activeSchedules.forEach((s) => {
      const start = timeToMinutes(s.start_time);
      const end = timeToMinutes(s.end_time);
      if (start < minStart) minStart = start;
      if (end > maxEnd) maxEnd = end;
    });

    // Generate 30-min slots
    const slots = [];
    for (let t = minStart; t < maxEnd; t += 30) {
      slots.push(minutesToTime(t));
    }

    return slots;
  }, [availability.schedules, formData.staffId]);

  const isSlotAvailable = (slotTime) => {
    if (!formData.serviceId) return true;

    const service = services.find((s) => String(s.id) === formData.serviceId);
    const duration = service ? service.duration_minutes || 30 : 30;

    const startMin = timeToMinutes(slotTime);
    const endMin = startMin + duration;

    const isOverlapping = (bStart, bEnd) => {
      const bStartMin = timeToMinutes(bStart);
      const bEndMin = timeToMinutes(bEnd);
      return Math.max(startMin, bStartMin) < Math.min(endMin, bEndMin);
    };

    // Helper: Is staff working during this ENTIRE slot?
    const isWorking = (staffId) => {
      const schedule = availability.schedules.find(
        (s) => String(s.staff_id) === String(staffId),
      );
      if (!schedule || !schedule.is_working) return false;
      const sStart = timeToMinutes(schedule.start_time);
      const sEnd = timeToMinutes(schedule.end_time);
      return startMin >= sStart && endMin <= sEnd;
    };

    if (formData.staffId) {
      // Specific Staff
      if (!isWorking(formData.staffId)) return false; // Not working

      return !availability.bookings.some(
        (b) =>
          String(b.staff_id) === String(formData.staffId) &&
          isOverlapping(b.start_time, b.end_time),
      );
    } else {
      // Any Staff
      // Find ALL staff who are working during this slot
      const workingStaffIds = availability.staff
        .filter((s) => isWorking(s.id))
        .map((s) => s.id);

      if (workingStaffIds.length === 0) return false; // No one is working

      // Check if at least one of them is free
      const freeStaff = workingStaffIds.find((staffId) => {
        const hasBooking = availability.bookings.some(
          (b) =>
            String(b.staff_id) === String(staffId) &&
            isOverlapping(b.start_time, b.end_time),
        );
        return !hasBooking;
      });

      return !!freeStaff;
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
        // Find names for the success page
        const service = services.find(
          (s) => String(s.id) === String(formData.serviceId),
        );
        const staffMember = staff.find(
          (s) => String(s.id) === String(formData.staffId),
        );

        navigate("/booking-success", {
          state: {
            booking: {
              date: formData.date,
              time: formData.time,
              serviceName: service ? service.name : "Service",
              price: service ? service.price : null,
              staffName: staffMember
                ? staffMember.full_name
                : "Any Available Barber",
              customerName: formData.name,
            },
          },
        });

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
