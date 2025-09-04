import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Brain, TrendingUp, Shield, Zap, 
  BarChart3, PieChart, Wallet, ArrowRight,
  Star, Check, Users, DollarSign, Target,
  ChevronRight, Github, Twitter, Linkedin,
  PlayCircle, Sparkles, Lock, Clock
} from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { number: "100K+", label: "Happy Users", icon: <Users className="w-6 h-6" /> },
    { number: "$50M+", label: "Tracked Expenses", icon: <DollarSign className="w-6 h-6" /> },
    { number: "99.9%", label: "AI Accuracy", icon: <Target className="w-6 h-6" /> },
    { number: "4.9★", label: "App Rating", icon: <Star className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                MoneyMind
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Reviews</a>
              <a href="#pricing" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Pricing</a>
              <button className="text-gray-600 hover:text-emerald-600 font-medium px-4 py-2 rounded-lg hover:bg-emerald-50 transition-all">
                Sign In
              </button>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-200">
                Get Started Free
              </button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-xl rounded-xl mb-4 p-6 shadow-xl border border-gray-100">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-emerald-600 font-medium py-2">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 font-medium py-2">How It Works</a>
                <a href="#testimonials" className="text-gray-600 hover:text-emerald-600 font-medium py-2">Reviews</a>
                <a href="#pricing" className="text-gray-600 hover:text-emerald-600 font-medium py-2">Pricing</a>
                <hr className="border-gray-200" />
                <button className="text-gray-600 hover:text-emerald-600 font-medium text-left py-2">
                  Sign In
                </button>
                <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold">
                  Get Started Free
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6 inline-flex items-center bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full px-6 py-3 border border-emerald-200">
              <Sparkles className="w-5 h-5 text-emerald-600 mr-2" />
              <span className="text-emerald-700 font-semibold text-sm">AI-Powered Financial Assistant</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="text-gray-900">Smart Finance</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Say goodbye to manual expense tracking. Just describe your transaction in plain English, 
              and our AI handles categorization, amounts, and insights automatically.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-xl hover:shadow-emerald-200 flex items-center gap-3">
                Start Free Trial
                <ArrowRight className="w-6 h-6" />
              </button>
              <button className="group bg-white/80 backdrop-blur-sm text-gray-700 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-white transition-all border border-gray-200 hover:border-gray-300 flex items-center gap-3 shadow-lg">
                <PlayCircle className="w-6 h-6 text-emerald-600 group-hover:text-emerald-700" />
                Watch Demo
              </button>
            </div>

            {/* Demo Input */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200">
                <div className="text-left">
                  <p className="text-sm text-gray-500 mb-2">Try it yourself:</p>
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                    <p className="text-gray-400 italic">"Bought coffee at Starbucks for $5.50"</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Amount: $5.50</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Category: Food & Drink</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600">Type: Expense</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:bg-white/80 transition-all group">
                  <div className="text-emerald-600 mb-3 flex justify-center group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">MoneyMind</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Revolutionizing personal finance management with AI technology that understands natural language 
                and makes expense tracking effortless.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-emerald-600 transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-emerald-600 transition-all">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-emerald-600 transition-all">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6 text-lg">Product</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Mobile App</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6 text-lg">Company</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Press</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6 text-lg">Support</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2025 MoneyMind. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Made with ❤️ for better financial wellness
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;