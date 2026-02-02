import React, { useState, useEffect } from "react";
import { Clock, Save, User } from "lucide-react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function Schedule() {
  const [staff, setStaff] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Staff List
  useEffect(() => {
    fetch("/api/staff")
      .then((res) => res.json())
      .then((data) => {
        setStaff(Array.isArray(data) ? data : []);
        if (data.length > 0) setSelectedStaffId(data[0].id);
      })
      .catch((err) => console.error("Error fetching staff:", err));
  }, []);

  // Fetch Schedule for Selected Staff
  useEffect(() => {
    if (!selectedStaffId) return;
    setLoading(true);

    fetch(`/api/staff/${selectedStaffId}/schedule`)
      .then((res) => res.json())
      .then((data) => {
        // Initialize if empty or merge with defaults
        const loadedSchedule = Array.isArray(data) && data.length > 0
          ? data
          : DAYS.map((_, index) => ({
              day_of_week: index,
              start_time: "09:00",
              end_time: "17:00",
              is_working: index !== 0, // Default Sun off
            }));

        // Ensure strictly 0-6 order
        const sortedSchedule = [...loadedSchedule].sort((a, b) => a.day_of_week - b.day_of_week);
        setSchedule(sortedSchedule);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedStaffId]);

  const handleScheduleChange = (dayIndex, field, value) => {
    const newSchedule = [...schedule];
    const day = newSchedule.find(d => d.day_of_week === dayIndex);
    if (day) {
      day[field] = value;
      setSchedule(newSchedule);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/staff/${selectedStaffId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
      });

      if (res.ok) {
        alert("Schedule updated successfully!");
      } else {
        alert("Failed to save schedule");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
          Staff Scheduling
        </h2>

        {/* Staff Selector */}
        <div className="flex items-center gap-3 bg-barber-gray border border-white/10 px-4 py-2">
          <User className="w-4 h-4 text-barber-gold" />
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="bg-transparent text-white outline-none border-none uppercase text-sm font-bold"
          >
            {staff.map((s) => (
              <option key={s.id} value={s.id} className="bg-barber-gray text-white">
                {s.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-barber-gray p-6 border border-white/5">
        {loading ? (
          <div className="text-white">Loading schedule...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {schedule.map((day) => (
              <div
                key={day.day_of_week}
                className={`grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 border-b border-white/5 last:border-0 ${
                  day.is_working ? "opacity-100" : "opacity-50"
                }`}
              >
                <div className="font-bold text-white uppercase w-32">
                  {DAYS[day.day_of_week]}
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 uppercase">Start</label>
                  <input
                    type="time"
                    value={day.start_time}
                    disabled={!day.is_working}
                    onChange={(e) =>
                      handleScheduleChange(day.day_of_week, "start_time", e.target.value)
                    }
                    className="bg-black border border-white/20 text-white p-2 w-full focus:border-barber-gold outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 uppercase">End</label>
                  <input
                    type="time"
                    value={day.end_time}
                    disabled={!day.is_working}
                    onChange={(e) =>
                      handleScheduleChange(day.day_of_week, "end_time", e.target.value)
                    }
                    className="bg-black border border-white/20 text-white p-2 w-full focus:border-barber-gold outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() =>
                      handleScheduleChange(day.day_of_week, "is_working", !day.is_working)
                    }
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border ${
                      day.is_working
                        ? "bg-green-900/20 text-green-500 border-green-500/50 hover:bg-green-900/40"
                        : "bg-red-900/20 text-red-500 border-red-500/50 hover:bg-red-900/40"
                    }`}
                  >
                    {day.is_working ? "Working" : "Day Off"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-barber-gold hover:bg-yellow-600 text-black px-8 py-3 font-bold uppercase tracking-wide flex items-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
