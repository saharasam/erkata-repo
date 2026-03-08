import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const About: React.FC = () => {
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
          About Erkata
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg max-w-4xl text-gray-600"
        >
          <p className="mb-6">
            Erkata is Ethiopia's structured platform where every request goes through a neutral operator 
            before reaching a verified local agent. We believe in fairness, transparency, and accountability.
          </p>
          <p>
            By removing public listings and enforcing a mediation layer, we protect both requestors and agents 
            from the chaos of unverified marketplaces.
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
