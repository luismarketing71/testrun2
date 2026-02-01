import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
       <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase">
            Not Just a Barber, <br/>
            <span className="text-barber-gold">It's a Lifestyle</span>
          </h1>
          <p className="text-gray-400 text-lg mb-6 leading-relaxed">
            Founded in 2026, Blade & Co. was built on the belief that a haircut shouldn't just be a chore, but an experience.
            We blend old-school craftsmanship with modern aesthetics to create a space where you can relax, unwind, and walk out looking your absolute best.
          </p>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Our team of master barbers are artists with a passion for precision. Whether you need a classic scissor cut or a sharp skin fade, we have the skills to deliver.
          </p>

          <div className="grid grid-cols-2 gap-8">
             <div>
                <h4 className="text-3xl font-bold text-white">500+</h4>
                <p className="text-barber-gold uppercase text-sm tracking-wider">Happy Clients</p>
             </div>
             <div>
                <h4 className="text-3xl font-bold text-white">10+</h4>
                <p className="text-barber-gold uppercase text-sm tracking-wider">Awards Won</p>
             </div>
          </div>
        </div>

        <div className="relative">
           <div className="absolute inset-0 bg-barber-gold blur-3xl opacity-20 rounded-full" />
           {/* Placeholder for a cool team image or shop interior */}
           <div className="relative bg-barber-gray aspect-square border border-white/10 flex items-center justify-center overflow-hidden">
               <span className="text-white/20 text-6xl font-bold uppercase rotate-[-45deg]">Blade & Co.</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
