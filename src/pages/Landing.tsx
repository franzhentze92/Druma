import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './landing/Home';
import { AboutUs } from './landing/AboutUs';
import { Features } from './landing/Features';
import { FAQs } from './landing/FAQs';
import { Pricing } from './landing/Pricing';
import { Contact } from './landing/Contact';
import { Login } from './landing/Login';
import { Register } from './landing/Register';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingFooter } from '../components/landing/LandingFooter';

export const Landing: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <LandingNavbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/features" element={<Features />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <LandingFooter />
      </div>
    </Router>
  );
};
