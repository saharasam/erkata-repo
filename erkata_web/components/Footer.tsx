import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-erkata-primary text-white pt-20 pb-10 rounded-t-[3rem] mt-4 mx-4">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16">
          <div className="mb-10 md:mb-0">
            <h2 className="text-3xl font-bold tracking-widest uppercase mb-6">Erkata</h2>
            <div className="flex space-x-6 text-white/60">
               <a href="https://twitter.com/erkata" target="_blank" rel="noopener noreferrer"><Twitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors" /></a>
               <a href="https://facebook.com/erkata" target="_blank" rel="noopener noreferrer"><Facebook className="w-5 h-5 hover:text-white cursor-pointer transition-colors" /></a>
               <a href="https://linkedin.com/company/erkata" target="_blank" rel="noopener noreferrer"><Linkedin className="w-5 h-5 hover:text-white cursor-pointer transition-colors" /></a>
               <a href="https://instagram.com/erkata" target="_blank" rel="noopener noreferrer"><Instagram className="w-5 h-5 hover:text-white cursor-pointer transition-colors" /></a>
            </div>
            <p className="mt-6 text-white/60 text-sm max-w-xs">
              Building fairer transactions, one mediated request at a time.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 text-sm w-full md:w-auto">
             <div>
                <h4 className="font-bold mb-4 text-erkata-accent">Erkata</h4>
                <ul className="space-y-3 text-white/60">
                  <li><Link to="/about" className="hover:text-white transition-colors">About Erkata</Link></li>
                  <li><a href="/#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
             </div>
             <div>
                <h4 className="font-bold mb-4 text-erkata-accent">Users</h4>
                <ul className="space-y-3 text-white/60">
                  <li><Link to="/register" className="hover:text-white transition-colors">For Requestors</Link></li>
                  <li><Link to="/become-agent" className="hover:text-white transition-colors">For Agents</Link></li>
                  <li><Link to="/become-operator" className="hover:text-white transition-colors">For Operators</Link></li>
                </ul>
             </div>
             <div>
                <h4 className="font-bold mb-4 text-erkata-accent">Legal</h4>
                <ul className="space-y-3 text-white/60">
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
             </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between text-xs text-white/40 items-center">
          <p>&copy; 2026 Erkata &bull; Addis Ababa, Ethiopia</p>
          <div className="mt-4 md:mt-0">
            <p>Trusted Mediation Platform</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;