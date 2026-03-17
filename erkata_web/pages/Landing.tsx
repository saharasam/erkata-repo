import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck,
  UserCheck,
  FileText,
  MapPin,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Landing: React.FC = () => {
  const fadeInUp: Variants = {
    initial: { opacity: 0, y: 30 },
    whileInView: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer: Variants = {
    initial: { opacity: 0 },
    whileInView: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardHover = {
    whileHover: { y: -10, scale: 1.02, transition: { duration: 0.2 } }
  };

  return (
    <div className="bg-erkata-surface font-sans text-erkata-text overflow-x-hidden">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="relative w-full min-h-[90vh] rounded-b-[3rem] overflow-hidden mx-auto flex items-end">
        <div className="absolute inset-0 bg-gradient-to-b from-erkata-primary to-[#05232d]">
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        {/* Content Positioned Bottom Left */}
        <div className="relative z-10 w-full p-6 md:p-12 lg:p-24 pb-20">
          <motion.div 
            className="max-w-[1440px] mx-auto"
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
            }}
          >
            <motion.h1 
              variants={{
                initial: { opacity: 0, x: -50 },
                animate: { opacity: 1, x: 0 }
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl lg:text-8xl font-medium text-white tracking-tight leading-[1.1] mb-8 max-w-5xl"
            >
              Get it done. <br />
              <motion.span 
                animate={{ color: ["#EAD37E", "#FFD700", "#EAD37E"] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-erkata-accent"
              >
                Fairly.
              </motion.span> <br />
              Through trusted local mediation.
            </motion.h1>
            
            <motion.p 
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.8 }}
              className="text-gray-200 text-lg md:text-xl max-w-3xl mb-12 leading-relaxed border-l-4 border-erkata-accent pl-6"
            >
              No public listings. No direct contact. No shortcuts. <br />
              Ethiopia’s structured platform where every request goes through a neutral operator before reaching a verified local agent.
            </motion.p>

            <motion.div 
              variants={{
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 }
              }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link 
                to="/submit-request" 
                className="inline-flex items-center justify-center bg-erkata-accent hover:bg-erkata-secondary text-black text-lg font-bold px-10 py-5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-erkata-accent/20"
              >
                Submit Your Request
              </Link>
              <Link 
                to="/become-agent" 
                className="inline-flex items-center justify-center border-2 border-erkata-accent text-erkata-accent hover:bg-erkata-accent/10 text-lg font-bold px-10 py-5 rounded-full transition-all active:scale-95"
              >
                Join as Agent
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. How It Works */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 lg:px-20 max-w-[1440px] mx-auto bg-white/50 rounded-[3rem] my-12 mx-4 md:mx-auto">
        <motion.div 
          {...fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-medium text-erkata-text mb-4">How Erkata Actually Works</h2>
          <div className="w-24 h-1 bg-erkata-primary mx-auto rounded-full"></div>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Step 1 */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            {...cardHover}
            className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-shadow duration-300"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <FileText className="w-32 h-32" />
            </div>
            <div className="w-12 h-12 bg-erkata-primary text-white rounded-full flex items-center justify-center font-bold text-xl mb-6">1</div>
            <h3 className="text-2xl font-bold mb-4">Submit Your Need</h3>
            <p className="text-gray-600 leading-relaxed">
              You fill a structured form describing exactly what you want (property, furniture, service…). 
              Your request goes <strong>only to an operator</strong> in your area — never public.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            {...cardHover}
            className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-shadow duration-300"
          >
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <UserCheck className="w-32 h-32" />
            </div>
            <div className="w-12 h-12 bg-erkata-primary text-white rounded-full flex items-center justify-center font-bold text-xl mb-6">2</div>
            <h3 className="text-2xl font-bold mb-4">Neutral Mediation & Matching</h3>
            <p className="text-gray-600 leading-relaxed">
              A certified local operator reviews your request, validates it and assigns it to the most suitable subscribed agent according to:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-500 font-medium">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-erkata-secondary"/> Geographic zone</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-erkata-secondary"/> Agent tier & specialization</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-erkata-secondary"/> Current availability</li>
            </ul>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            {...cardHover}
            className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-shadow duration-300"
          >
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <div className="w-12 h-12 bg-erkata-primary text-white rounded-full flex items-center justify-center font-bold text-xl mb-6">3</div>
            <h3 className="text-2xl font-bold mb-4">Delivery + Protected Feedback</h3>
            <p className="text-gray-600 leading-relaxed">
              The agent delivers the service or transaction. Both sides submit feedback through the operator.
              Only bundled, anonymized feedback reaches higher levels — final resolution always requires Super Admin approval.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. Who Is This For? */}
      <section className="py-12 px-6 md:px-12 lg:px-20 max-w-[1440px] mx-auto">
        <motion.h2 
          variants={fadeInUp}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="text-3xl md:text-4xl font-medium mb-12"
        >
          Who Is This For?
        </motion.h2>
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Requestors */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ scale: 1.03 }}
            className="bg-erkata-primary text-white p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[320px]"
          >
            <div>
              <h3 className="text-2xl font-bold mb-4">Requestors <br/><span className="text-white/60 text-lg font-normal">(Buyers / Sellers)</span></h3>
              <p className="text-gray-200 leading-relaxed">
                You want transparency, zone-respecting service and protection against unverified intermediaries.
              </p>
            </div>
            <Link to="/submit-request" className="mt-8 inline-flex items-center text-erkata-accent font-bold hover:translate-x-2 transition-transform">
              Submit a Request <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>

          {/* Agents */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ scale: 1.03 }}
            className="bg-white border border-gray-200 p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[320px]"
          >
             <div>
              <h3 className="text-2xl font-bold mb-4 text-erkata-text">Agents <br/><span className="text-gray-500 text-lg font-normal">(Executors)</span></h3>
              <p className="text-gray-600 leading-relaxed">
                You want qualified, pre-validated leads in your operating zones without competing in a public free-for-all marketplace.
                Higher tiers = more referral income + larger geographic rights.
              </p>
            </div>
            <Link to="/become-agent" className="mt-8 inline-flex items-center text-erkata-secondary font-bold hover:translate-x-2 transition-transform">
              Become an Agent <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>

          {/* Operators */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ scale: 1.03 }}
            className="bg-white border border-gray-200 p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[320px]"
          >
             <div>
              <h3 className="text-2xl font-bold mb-4 text-erkata-text">Operators <br/><span className="text-gray-500 text-lg font-normal">(Neutral Mediators)</span></h3>
              <p className="text-gray-600 leading-relaxed">
                You want to play a respected, paid mediation role in your community while enforcing structure and fairness.
              </p>
            </div>
            <Link to="/become-operator" className="mt-8 inline-flex items-center text-erkata-secondary font-bold hover:translate-x-2 transition-transform">
              Apply as Operator <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 4. Agent Progression Tiers Table */}
      <section className="py-24 px-6 md:px-12 lg:px-20 max-w-[1440px] mx-auto">
        <motion.div 
          {...fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-medium text-erkata-text mb-4">Choose Your Path as Agent</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Referral commission applies only to first-generation (direct) referrals. Higher tiers unlock significantly more earning potential through referrals and wider zone rights.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="overflow-x-auto rounded-[2rem] border border-gray-200 shadow-xl"
        >
          <table className="w-full text-left bg-white border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-6 font-bold text-gray-900 uppercase text-sm tracking-wider">Package</th>
                <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Referral Slots</th>
                <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Free Zones</th>
                <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Geographic Access</th>
                <th className="p-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name: 'Free', slots: '3', zones: '1', access: 'Very limited', status: 'Basic' },
                { name: 'Peace', slots: '7', zones: '2', access: 'Small expansion', status: 'Paid' },
                { name: 'Love', slots: '16', zones: '3', access: 'Medium coverage', status: 'Paid' },
                { name: 'Unity', slots: '23', zones: '5', access: 'Large coverage', status: 'Paid' },
                { name: 'Abundant Life', slots: '31', zones: 'Unlimited', access: 'Full map-based access', status: 'Premium', highlighted: true }
              ].map((tier, i) => (
                <motion.tr 
                  key={tier.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`${tier.highlighted ? 'bg-erkata-accent/10 border-l-4 border-l-erkata-secondary' : 'hover:bg-gray-50/50'} transition-colors`}
                >
                  <td className={`p-6 font-bold ${tier.highlighted ? 'text-erkata-primary text-lg' : 'text-gray-900'}`}>{tier.name}</td>
                  <td className={`p-6 ${tier.highlighted ? 'font-bold text-erkata-primary' : 'text-gray-600'}`}>{tier.slots}</td>
                  <td className={`p-6 ${tier.highlighted ? 'font-bold text-erkata-primary' : 'text-gray-600'}`}>{tier.zones}</td>
                  <td className={`p-6 ${tier.highlighted ? 'font-bold text-erkata-primary' : 'text-gray-600'}`}>{tier.access}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      tier.status === 'Premium' ? 'bg-erkata-secondary text-white shadow-sm' : 
                      tier.status === 'Paid' ? 'bg-erkata-accent/20 text-erkata-primary' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tier.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 text-center"
        >
          <Link to="/become-agent" className="text-lg font-bold text-erkata-secondary hover:text-black underline underline-offset-4 transition-colors">
            Start as Free Agent – Upgrade Anytime
          </Link>
        </motion.div>
      </section>

      {/* 5. Geographic Zoning */}
      <section className="py-20 px-6 md:px-12 lg:px-20 max-w-[1440px] mx-auto bg-white rounded-[3rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:w-1/2"
        >
           <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
             Structure
           </div>
           <h2 className="text-4xl md:text-5xl font-medium mb-6">Local. Zoned. Accountable.</h2>
           <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
             <p>
               Agents can only accept and fulfill requests inside zones they have rights to.
             </p>
             <p>
               Zones follow Ethiopia’s administrative divisions (kifle ketema / woreda).
               Higher-tier agents progressively unlock larger territories.
             </p>
             <p className="font-medium text-erkata-secondary">
               This structure protects both requestors and agents from unqualified long-distance matching.
             </p>
           </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:w-1/2 w-full h-[400px] bg-gray-100 rounded-[2rem] relative overflow-hidden flex items-center justify-center"
        >
            {/* Abstract Map Visual */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Ethiopia_adm_location_map.svg/1024px-Ethiopia_adm_location_map.svg.png')] bg-cover bg-center"></div>
            <div className="relative z-10 p-8 text-center text-erkata-primary">
               <motion.div
                 animate={{ y: [0, -10, 0] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               >
                 <MapPin className="w-16 h-16 text-erkata-secondary mx-auto mb-4" />
               </motion.div>
               <p className="text-gray-500 font-medium">Zone Rights Visualization</p>
               <div className="mt-4 flex justify-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                 <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                 <span className="w-3 h-3 rounded-full bg-erkata-accent animate-pulse"></span>
               </div>
            </div>
        </motion.div>
      </section>

      {/* 6. Final Trust Section */}
      <section className="py-24 px-6 md:px-12 lg:px-20 text-center">
        <motion.h2 
          variants={fadeInUp}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="text-4xl md:text-6xl font-medium mb-8 leading-tight"
        >
          Trust is not promised. <br/>
          <span className="text-gray-400">It is enforced.</span>
        </motion.h2>
        
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-center gap-4 md:gap-12 mb-16 text-left md:text-center max-w-4xl mx-auto"
        >
           <motion.div 
             variants={fadeInUp}
             initial="initial"
             whileInView="whileInView"
             viewport={{ once: true, margin: "-100px" }}
             className="flex items-center md:flex-col gap-4"
           >
             <div className="w-2 h-2 bg-erkata-accent rounded-full md:hidden"></div>
             <p className="text-lg text-gray-600">Every transaction has a neutral operator in the middle</p>
           </motion.div>
           <motion.div 
             variants={fadeInUp}
             initial="initial"
             whileInView="whileInView"
             viewport={{ once: true, margin: "-100px" }}
             className="flex items-center md:flex-col gap-4"
           >
             <div className="w-2 h-2 bg-erkata-accent rounded-full md:hidden"></div>
             <p className="text-lg text-gray-600">No hidden direct contact before validation</p>
           </motion.div>
           <motion.div 
             variants={fadeInUp}
             initial="initial"
             whileInView="whileInView"
             viewport={{ once: true, margin: "-100px" }}
             className="flex items-center md:flex-col gap-4"
           >
             <div className="w-2 h-2 bg-erkata-accent rounded-full md:hidden"></div>
             <p className="text-lg text-gray-600">Immutable feedback escalation chain ending at Super Admin</p>
           </motion.div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/submit-request" 
            className="inline-flex items-center justify-center bg-erkata-accent hover:bg-erkata-secondary text-black text-xl font-bold px-12 py-6 rounded-full transition-all shadow-lg hover:shadow-xl shadow-erkata-accent/20"
          >
            Begin Your Journey with Erkata
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;