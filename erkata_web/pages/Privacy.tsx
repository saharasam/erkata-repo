import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const Privacy: React.FC = () => {
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
          Privacy Policy
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg max-w-4xl text-gray-600 space-y-4"
        >
          <p>Last updated: February 2026</p>
          <p>
            Your privacy is important to us. It is Erkata's policy to respect your privacy regarding any information 
            we may collect from you across our website, https://erkata.com, and other sites we own and operate.
          </p>
          <h3 className="text-2xl font-bold text-black mt-8 mb-4">1. Information We Collect</h3>
          <p>
            We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, 
            with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
