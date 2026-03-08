import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact: React.FC = () => {
  return (
    <div className="bg-erkata-surface font-sans text-erkata-text min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-32 px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto w-full">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-medium mb-12"
        >
          Contact Us
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            <div className="space-y-6">
              {[
                { icon: Mail, label: "Email", value: "support@erkata.com" },
                { icon: Phone, label: "Phone", value: "+251 911 000 000" },
                { icon: MapPin, label: "Location", value: "Addis Ababa, Ethiopia" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-12 h-12 bg-erkata-primary/5 rounded-full flex items-center justify-center text-erkata-primary">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">{item.label}</p>
                    <p className="text-lg font-medium text-gray-800">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            <form className="space-y-4">
              <motion.input 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                type="text" placeholder="Your Name" className="w-full px-6 py-4 bg-gray-50 rounded-full border-none outline-none focus:bg-white focus:ring-2 focus:ring-black/5" 
              />
              <motion.input 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                type="email" placeholder="Your Email" className="w-full px-6 py-4 bg-gray-50 rounded-full border-none outline-none focus:bg-white focus:ring-2 focus:ring-black/5" 
              />
              <motion.textarea 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                placeholder="Message" className="w-full px-6 py-4 bg-gray-50 rounded-[2rem] border-none outline-none focus:bg-white focus:ring-2 focus:ring-black/5 min-h-[150px]"
              ></motion.textarea>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-black text-white rounded-full font-bold shadow-lg shadow-black/10 transition-shadow"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
