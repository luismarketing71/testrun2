import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const services = [
  { name: 'Classic Cut', price: '£25', description: 'Consultation, wash, cut & style with premium products.' },
  { name: 'Skin Fade', price: '£30', description: 'Zero/foil fade with precise blending and shape up.' },
  { name: 'Beard Trim & Shape', price: '£15', description: 'Sculpting with scissors/clippers and razor finish.' },
  { name: 'Hot Towel Shave', price: '£35', description: 'Traditional cut-throat shave with hot towels and oils.' },
  { name: 'The Full Works', price: '£55', description: 'Haircut, beard trim, and facial treatment package.' },
  { name: 'Junior Cut', price: '£20', description: 'For the young gentlemen (Under 12s).' },
];

export default function Services() {
  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 uppercase">Our Services</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Tailored grooming experiences designed for the modern man.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-barber-gray p-8 border border-white/5 hover:border-barber-gold/50 transition-colors group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Check className="w-24 h-24 text-barber-gold" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{service.name}</h3>
            <p className="text-barber-gold text-xl font-bold mb-4">{service.price}</p>
            <p className="text-gray-400">{service.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
