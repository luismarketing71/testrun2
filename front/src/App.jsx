import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Scissors, Calendar, User, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

// Placeholders for pages
import Home from './pages/Home';
import Services from './pages/Services';
import Book from './pages/Book';
import Admin from './pages/Admin';
import About from './pages/About';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <nav className="fixed w-full z-50 bg-barber-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-barber-gold rotate-90" />
              <span className="text-xl font-bold tracking-widest text-white uppercase">Blade & Co.</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <NavLink to="/" current={location.pathname}>Home</NavLink>
              <NavLink to="/services" current={location.pathname}>Services</NavLink>
              <NavLink to="/about" current={location.pathname}>About</NavLink>
              <Link to="/book" className="bg-barber-gold hover:bg-yellow-600 text-black px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-colors">
                Book Now
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-barber-gold p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-barber-black border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink to="/" onClick={() => setIsOpen(false)}>Home</MobileNavLink>
            <MobileNavLink to="/services" onClick={() => setIsOpen(false)}>Services</MobileNavLink>
            <MobileNavLink to="/about" onClick={() => setIsOpen(false)}>About</MobileNavLink>
            <Link to="/book" onClick={() => setIsOpen(false)} className="block w-full text-center bg-barber-gold text-black px-3 py-3 rounded-md text-base font-bold uppercase mt-4">
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children, current }) {
  const isActive = current === to;
  return (
    <Link to={to} className={`${isActive ? 'text-barber-gold' : 'text-gray-300 hover:text-white'} px-3 py-2 rounded-md text-sm font-medium transition-colors uppercase tracking-wide`}>
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium uppercase">
      {children}
    </Link>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-barber-black text-white font-sans selection:bg-barber-gold selection:text-black">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/book" element={<Book />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
