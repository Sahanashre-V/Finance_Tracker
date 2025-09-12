import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Wallet, ArrowLeft, 
  Sparkles, Github, Linkedin
} from 'lucide-react';

const AboutPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    window.location.href = '/';
  };

  const handleSignUp = () => {
    window.location.href = '/signup';
  };

  const handleSignIn = () => {
    window.location.href = '/signin';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleBack}
                className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg hover:bg-white transition-all mr-2"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                WealthWise
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={handleSignIn}
                className="text-gray-600 hover:text-emerald-600 font-medium px-4 py-2 rounded-lg hover:bg-emerald-50 transition-all"
              >
                Sign In
              </button>
              <button 
                onClick={handleSignUp}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-200"
              >
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
            <div className="md:hidden bg-white/95 backdrop-blur-xl rounded-xl mb-4 p-6 shadow-xl">
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={handleSignIn}
                  className="text-gray-600 hover:text-emerald-600 font-medium text-left py-2 w-full"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleSignUp}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold w-full mt-2"
                >
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
          <div className="text-center max-w-4xl mx-auto mb-20">
            <div className="mb-6 inline-flex items-center bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full px-6 py-3 border border-emerald-200">
              <Sparkles className="w-5 h-5 text-emerald-600 mr-2" />
              <span className="text-emerald-700 font-semibold text-sm">About WealthWise</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="text-gray-900">Revolutionizing</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                Personal Finance
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              We believe financial management should be effortless, intelligent, and accessible to everyone. 
              That's why we built WealthWise - the AI-powered financial assistant that understands you.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-200">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                To democratize financial wellness by making expense tracking and financial insights 
                as simple as having a conversation. We're eliminating the complexity and friction 
                from personal finance management, empowering individuals to make better financial 
                decisions with the power of artificial intelligence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              The principles that guide everything we do at WealthWise.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-200">
            <div className="max-w-4xl mx-auto text-lg md:text-xl text-gray-700 leading-relaxed space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">User-Centric Design</h3>
                <p>Every feature is designed with our users' needs and financial wellness in mind. We prioritize creating intuitive experiences that make financial management accessible and enjoyable for everyone, regardless of their technical expertise or financial background.</p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Privacy First</h3>
                <p>Your financial data belongs to you. We never sell or share your personal information with third parties. Our commitment to privacy means implementing robust security measures and transparent data practices that put your trust and confidentiality at the forefront of everything we do.</p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Excellence</h3>
                <p>We strive for perfection in every aspect of our platform and user experience. From the accuracy of our AI algorithms to the responsiveness of our customer support, we maintain the highest standards to ensure WealthWise consistently delivers exceptional value to our users.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <p className="text-gray-300 font-bold text-lg">
            © 2025 WealthWise. All rights reserved.
          </p>
          <p className="text-gray-400 text-base mt-2">
            Made with <span className="text-emerald-400">❤️</span> for better financial wellness
          </p>
          <div className="flex space-x-4 mt-6">
            <a
              href="https://github.com/Sahanashre-V/"
              className="w-11 h-11 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-emerald-600 transition-all"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/sahanashre-v/"
              className="w-11 h-11 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-emerald-600 transition-all"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;