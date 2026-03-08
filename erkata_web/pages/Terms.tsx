import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const Terms: React.FC = () => {
  return (
    <div className="bg-erkata-surface font-sans text-erkata-text min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-32 px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto w-full">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-medium mb-8"
        >
          Terms of Service
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg max-w-4xl text-gray-600 space-y-4"
        >
           <p>Last updated: February 2026</p>
          <h3 className="text-2xl font-bold text-black mt-8 mb-4">1. Terms</h3>
          <p>
            By accessing the website at https://erkata.com, you are agreeing to be bound by these terms of service, 
            all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
          </p>
          <h3 className="text-2xl font-bold text-black mt-8 mb-4">2. Use License</h3>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on Erkata's website 
            for personal, non-commercial transitory viewing only.
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
