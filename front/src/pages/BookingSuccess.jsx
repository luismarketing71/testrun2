import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, Clock, User, Scissors, MapPin } from "lucide-react";
import confetti from "canvas-confetti";

export default function BookingSuccess() {
  const location = useLocation();
  const { booking } = location.state || {};

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#D4AF37', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#D4AF37', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  if (!booking) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-white mb-4">No Booking Found</h1>
        <Link to="/book" className="text-barber-gold hover:underline">
          Go back to Booking
        </Link>
      </div>
    );
  }

  const { date, time, serviceName, staffName, customerName, price } = booking;

  // Format Date nicely
  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center bg-barber-black bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-barber-gray border border-barber-gold/30 p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative Gold Shine */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-barber-gold to-transparent opacity-50"></div>

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-20 h-20 bg-barber-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-barber-gold/20"
          >
            <CheckCircle className="w-10 h-10 text-black" strokeWidth={3} />
          </motion.div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-widest mb-2">Booking Confirmed</h1>
          <p className="text-gray-400 text-sm uppercase tracking-wide">Thank you, {customerName}!</p>
        </div>

        <div className="space-y-6 border-t border-white/10 pt-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-none flex items-center justify-center border border-white/10">
              <Calendar className="w-5 h-5 text-barber-gold" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
              <p className="text-lg font-bold text-white">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-none flex items-center justify-center border border-white/10">
              <Clock className="w-5 h-5 text-barber-gold" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Time</p>
              <p className="text-lg font-bold text-white">{time}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-none flex items-center justify-center border border-white/10">
              <Scissors className="w-5 h-5 text-barber-gold" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Service</p>
              <p className="text-lg font-bold text-white">{serviceName}</p>
              {price && <p className="text-sm text-barber-gold font-mono">£{price}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-none flex items-center justify-center border border-white/10">
              <User className="w-5 h-5 text-barber-gold" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Barber</p>
              <p className="text-lg font-bold text-white">{staffName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white/5 rounded-none flex items-center justify-center border border-white/10">
               <MapPin className="w-5 h-5 text-barber-gold" />
             </div>
             <div>
               <p className="text-xs text-gray-500 uppercase tracking-wider">Location</p>
               <p className="text-lg font-bold text-white">Blade & Co. Studio</p>
             </div>
           </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-gray-500 text-xs mb-6">A confirmation email has been sent to your address.</p>
          <Link
            to="/"
            className="inline-block w-full bg-white text-black font-bold uppercase tracking-widest py-4 hover:bg-barber-gold transition-colors"
          >
            Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
