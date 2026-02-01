import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ThreeScissors from '../components/ThreeScissors';
import { ArrowRight, Star, Clock, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex flex-col lg:flex-row items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-barber-black via-barber-black/90 to-barber-black z-0" />

        {/* Text Content */}
        <div className="relative z-10 w-full lg:w-1/2 px-8 lg:pl-24 flex flex-col justify-center h-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-barber-gold font-bold tracking-widest uppercase mb-4">Established 2026</h2>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Precision Cuts <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-barber-gold to-yellow-200">
                Modern Style
              </span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md">
              Experience the art of grooming in a space designed for the modern gentleman.
              Classic techniques, contemporary mastery.
            </p>
            <div className="flex gap-4">
              <Link to="/book" className="bg-barber-gold text-black px-8 py-4 rounded-none font-bold uppercase tracking-wider hover:bg-white transition-all flex items-center gap-2 group">
                Book Appointment
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/services" className="border border-white/20 text-white px-8 py-4 rounded-none font-bold uppercase tracking-wider hover:bg-white/10 transition-all">
                View Services
              </Link>
            </div>
          </motion.div>
        </div>

        {/* 3D Scene */}
        <div className="relative z-10 w-full lg:w-1/2 h-[50vh] lg:h-full">
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <Suspense fallback={null}>
              <ThreeScissors />
              <Environment preset="city" />
              <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={1.5} far={0.8} />
            </Suspense>
          </Canvas>
        </div>
      </section>

      {/* Quick Info Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 bg-barber-gray border-y border-white/5">
        <div className="p-12 border-b md:border-b-0 md:border-r border-white/5 flex flex-col items-center text-center group hover:bg-white/5 transition-colors">
          <Clock className="w-10 h-10 text-barber-gold mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold uppercase mb-2">Open Daily</h3>
          <p className="text-gray-400">Mon-Sat: 10am - 8pm<br/>Sun: 11am - 5pm</p>
        </div>
        <div className="p-12 border-b md:border-b-0 md:border-r border-white/5 flex flex-col items-center text-center group hover:bg-white/5 transition-colors">
          <MapPin className="w-10 h-10 text-barber-gold mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold uppercase mb-2">Location</h3>
          <p className="text-gray-400">123 Blade Street<br/>London, UK</p>
        </div>
        <div className="p-12 flex flex-col items-center text-center group hover:bg-white/5 transition-colors">
          <Star className="w-10 h-10 text-barber-gold mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold uppercase mb-2">Top Rated</h3>
          <p className="text-gray-400">5-Star Service<br/>Master Barbers</p>
        </div>
      </section>
    </div>
  );
}
