import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Book() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
      service: '',
      barber: '',
      date: '',
      time: '',
      name: '',
      email: ''
  });

  const handleSubmit = (e) => {
      e.preventDefault();
      // Logic to submit to backend would go here
      alert('Booking Request Sent! (Simulation)');
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-barber-gray p-8 md:p-12 border border-white/10 rounded-none shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-white mb-8 text-center uppercase">Book Appointment</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">Select Service</label>
                <select className="w-full bg-barber-black border border-white/10 text-white p-4 rounded-none focus:ring-2 focus:ring-barber-gold focus:border-transparent transition-all">
                    <option>Classic Cut - £25</option>
                    <option>Skin Fade - £30</option>
                    <option>Beard Trim - £15</option>
                    <option>Full Works - £55</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">Select Barber</label>
                    <select className="w-full bg-barber-black border border-white/10 text-white p-4 rounded-none focus:ring-2 focus:ring-barber-gold focus:border-transparent transition-all">
                        <option>Any Available</option>
                        <option>Luis (Master Barber)</option>
                        <option>Marcus (Senior)</option>
                        <option>Sarah (Stylist)</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">Date</label>
                    <input type="date" className="w-full bg-barber-black border border-white/10 text-white p-4 rounded-none focus:ring-2 focus:ring-barber-gold focus:border-transparent transition-all" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">Your Details</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" placeholder="Name" className="w-full bg-barber-black border border-white/10 text-white p-4 rounded-none focus:ring-2 focus:ring-barber-gold focus:border-transparent transition-all" />
                    <input type="email" placeholder="Email" className="w-full bg-barber-black border border-white/10 text-white p-4 rounded-none focus:ring-2 focus:ring-barber-gold focus:border-transparent transition-all" />
                </div>
            </div>

            <button type="submit" className="w-full bg-barber-gold text-black font-bold uppercase tracking-widest py-4 mt-8 hover:bg-white transition-colors">
                Confirm Booking
            </button>
        </form>
      </motion.div>
    </div>
  );
}
