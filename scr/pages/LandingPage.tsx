import React from 'react';
import { motion } from 'motion/react';
import { 
  Beaker, 
  CheckCircle2, 
  BarChart3, 
  QrCode, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Globe, 
  Clock,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  const features = [
    {
      icon: <QrCode className="w-6 h-6 text-primary" />,
      title: "QR Inventory Tracking",
      description: "Instant check-out and check-in using mobile QR scanning. No more manual entry errors."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
      title: "Real-time Analytics",
      description: "Monitor stock levels, usage patterns, and asset depreciation across all departments."
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Role-based Access",
      description: "Secure permissions for students, technicians, and administrators with SSO integration."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "Audit Compliance",
      description: "Automated logs for every transaction, perfect for safety audits and accountability."
    }
  ];

  const benefits = [
    {
      title: "99.9% Accuracy",
      description: "Reduce lost equipment by nearly 100% with automated tracking."
    },
    {
      title: "Save 15hrs / Week",
      description: "Eliminate manual spreadsheets and streamline administrative workflows."
    },
    {
      title: "Instant Setup",
      description: "Cloud-based deployment means your lab is live within minutes, not months."
    }
  ];

  const faqs = [
    {
      question: "Is LabTrack Pro compatible with mobile devices?",
      answer: "Yes! Our platform is fully responsive and the QR scanner works directly from any modern smartphone browser without needing a native app."
    },
    {
      question: "Can we migrate our current spreadsheet data?",
      answer: "Absolutely. Our administration panel supports bulk CSV imports to get your existing inventory synced in seconds."
    },
    {
      question: "Does it support multiple lab locations?",
      answer: "Yes, you can manage multiple departments and physical locations under a single institutional account."
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Jenkins",
      role: "Head of Chemistry Dept",
      content: "LabTrack Pro transformed how we manage our reagents. We've cut down on waste significantly."
    },
    {
      name: "Marcus Thorne",
      role: "Lead Lab Technician",
      content: "The QR scanning feature is a game-changer. My daily audit now takes 10 minutes instead of two hours."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-full flex items-center gap-8 shadow-sm max-w-fit"
        >
          <div className="flex items-center gap-2 font-bold text-primary">
            <Beaker className="w-5 h-5 fill-primary/20" />
            <span>LabTrack Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it works</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </div>
          <button 
            onClick={() => signInWithGoogle()}
            className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20"
          >
            Get Started
          </button>
        </motion.nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-100 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                Next-Gen Inventory Management
              </span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] mb-8">
                Precision Tracking for <span className="text-primary italic">Modern Labs.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
                Empower your laboratory with QR-powered inventory tracking, real-time auditing, and seamless resource management. Built for performance, designed for accuracy.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <button 
                  onClick={() => signInWithGoogle()}
                  className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:translate-y-[-2px] active:translate-y-0 shadow-lg shadow-primary/30"
                >
                  Sign in with Google <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>No credit card required</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100">
               <div className="bg-slate-50 rounded-[2rem] aspect-[4/3] overflow-hidden flex items-center justify-center p-8 relative group">
                  <LayoutDashboard className="w-48 h-48 text-primary/10 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent"></div>
                  
                  {/* Floating UI Elements */}
                  <div className="absolute top-8 left-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce duration-[3000ms]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Stock Status</div>
                        <div className="text-sm font-bold">Optimal Levels</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-12 right-8 bg-slate-900 p-4 rounded-2xl shadow-2xl animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-mono font-bold">
                        QR
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Rapid Scan</div>
                        <div className="text-sm font-bold text-white italic">Active Sensor...</div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
            {/* Decor */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-sky-200 rounded-full -z-10 opacity-50 blur-xl"></div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">The Workflow</h2>
            <p className="text-4xl font-black text-slate-900 tracking-tight">Simple as Scan, Track, Manage.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Scan Asset", desc: "Use the built-in QR scanner on any mobile device to quickly identify any equipment in the lab.", icon: <QrCode /> },
              { step: "02", title: "Identity Log", desc: "Authentication via SSO ensures every transaction is mapped to a verified user and department.", icon: <Users /> },
              { step: "03", title: "View Dashboard", desc: "Administrators get instant visibility into current loans, stock alerts, and usage trends.", icon: <LayoutDashboard /> }
            ].map((item, idx) => (
              <div key={idx} className="relative p-8 bg-white rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:translate-y-[-4px]">
                <div className="absolute top-6 right-8 text-5xl font-black text-slate-100">{item.step}</div>
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 relative z-10">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 relative z-10">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits / Social Proof */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            
            <div className="flex-1 relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-12 leading-tight">Trusted by leading <br />academic laboratories.</h2>
              <div className="grid grid-cols-1 gap-8">
                {testimonials.map((t, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
                    <p className="text-lg italic mb-6">"{t.content}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                      <div>
                        <div className="font-bold">{t.name}</div>
                        <div className="text-sm text-white/60">{t.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              {benefits.map((benefit, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] text-slate-900 shadow-xl flex flex-col items-center text-center">
                  <div className="text-4xl font-black text-primary mb-2 italic">{benefit.title.split(' ')[0]}</div>
                  <div className="font-bold mb-4">{benefit.title.replace(benefit.title.split(' ')[0], '')}</div>
                  <p className="text-sm text-slate-500">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Capabilities</h2>
            <p className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">Everything you need to run a high-precision lab.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="group p-8 rounded-3xl border border-slate-100 bg-white hover:border-primary transition-all">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-3">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Pricing Plans</h2>
            <p className="text-4xl font-black tracking-tight">Flexible plans for every scale.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Dept Plan */}
            <div className="bg-slate-800/50 p-10 rounded-[2.5rem] border border-slate-700">
              <div className="text-primary font-bold mb-4">Single Department</div>
              <div className="text-5xl font-black mb-6">$49<span className="text-lg font-medium text-slate-400">/mo</span></div>
              <ul className="space-y-4 mb-10 text-slate-400 text-sm font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Up to 500 assets</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> 2 Admin accounts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Email support</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> QR scanner mobile access</li>
              </ul>
              <button 
                onClick={() => signInWithGoogle()}
                className="w-full bg-slate-700 text-white py-4 rounded-2xl font-bold hover:bg-slate-600 transition-colors"
              >
                Start Trial
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-primary p-10 rounded-[2.5rem] shadow-2xl shadow-primary/20 scale-105 relative z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-200 text-primary px-4 py-1 rounded-full text-xs font-black uppercase">Most Popular</div>
              <div className="text-sky-200 font-bold mb-4">Institutional Pro</div>
              <div className="text-5xl font-black mb-6">$199<span className="text-lg font-medium text-white/60">/mo</span></div>
              <ul className="space-y-4 mb-10 text-white/80 text-sm font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-200" /> Unlimited assets</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-200" /> Unlimited admins</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-200" /> SSO & SAML Integration</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-200" /> Multi-location support</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-200" /> 24/7 Priority support</li>
              </ul>
              <button 
                onClick={() => signInWithGoogle()}
                className="w-full bg-white text-primary py-4 rounded-2xl font-bold hover:bg-sky-50 transition-colors shadow-xl"
              >
                Go Premium
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-800/50 p-10 rounded-[2.5rem] border border-slate-700">
              <div className="text-primary font-bold mb-4">Enterprise Custom</div>
              <div className="text-5xl font-black mb-6">Talk to Us</div>
              <ul className="space-y-4 mb-10 text-slate-400 text-sm font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> On-premise deployment</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Custom API access</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Dedicated Account Manager</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> SLA Guarantees</li>
              </ul>
              <button className="w-full border border-slate-600 text-white py-4 rounded-2xl font-bold hover:bg-slate-700 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Got Questions?</h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  {faq.question}
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 font-black text-primary text-2xl mb-6">
                <Beaker className="w-8 h-8 fill-primary/20" />
                <span>LabTrack Pro</span>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed mb-8">
                Defining the standard for modern laboratory inventory management. Accuracy, speed, and reliability in every scan.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer"><Globe className="w-5 h-5" /></div>
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer"><Clock className="w-5 h-5" /></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li className="hover:text-primary transition-colors cursor-pointer">Live Demo</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Mobile App</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Security</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Integrations</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Support</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li className="hover:text-primary transition-colors cursor-pointer">Help Center</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Contact Us</li>
                <li className="hover:text-primary transition-colors cursor-pointer">System Status</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Legacy Support</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div>© 2026 LabTrack Pro Systems Inc. All rights reserved.</div>
            <div className="flex items-center gap-8">
              <span className="hover:text-slate-600 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-600 transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
