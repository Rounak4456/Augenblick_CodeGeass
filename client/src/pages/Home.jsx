import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Home() {
  // Add state for active tab
  const [activeTab, setActiveTab] = useState('editor');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background Gradients remain the same */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-200/50 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-gray-100/50 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-300/30 rounded-full filter blur-3xl"></div>
      </div>

      {/* Hero Section with animations */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center space-y-8">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 max-w-4xl mx-auto leading-tight">
              The content studio for
              <span className="block mt-2 bg-gradient-to-r from-gray-800 to-black text-transparent bg-clip-text">
                creating impactful stories
              </span>
            </h1>

            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
              Transform your ideas into compelling content with our powerful editing suite. 
              Featuring real-time collaboration, AI assistance, and version control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button className="px-8 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                Start Writing
              </button>
              <button className="px-8 py-4 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-300">
                View Examples
              </button>
            </div>
            <div className="mt-20">
              <p className="text-gray-600 text-sm uppercase tracking-wider mb-8">
                Trusted by leading content creators
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div 
        className="py-20 overflow-hidden bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="flex flex-col gap-4 text-9xl">
          {/* First Row */}
          <div className="flex flex-nowrap gap-2 marquee-container">
            <motion.div 
              className="flex gap-2 whitespace-nowrap"
              animate={{
                x: [0, -1000],
                transition: {
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 20,
                    ease: "linear",
                  }
                }
              }}
            >
              {[
                "Headless",
                "Modular",
                "Expandable",
                "Fully customizable",
                "Open Source"
              ].map((text, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="text-9xl font-bold text-gray-900">{text}</div>
                  <div className="text-9xl font-bold" style={{
                    WebkitTextStroke: '1px black',
                    WebkitTextFillColor: 'transparent'
                  }}>{text}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Second Row - Moving in opposite direction */}
          <div className="flex flex-nowrap gap-2 marquee-container">
            <motion.div 
              className="flex gap-8 whitespace-nowrap"
              animate={{
                x: [-1000, 0],
                transition: {
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 25,
                    ease: "linear",
                  }
                }
              }}
            >
              {[
                "Real-time",
                "Collaborative",
                "Powerful",
                "User-friendly",
                "Secure"
              ].map((text, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="text-9xl font-bold text-gray-900">{text}</div>
                  <div className="text-9xl font-bold" style={{
                    WebkitTextStroke: '1px black',
                    WebkitTextFillColor: 'transparent'
                  }}>{text}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Third Row */}
          <div className="flex flex-nowrap gap-8 marquee-container">
            <motion.div 
              className="flex gap-8 whitespace-nowrap"
              animate={{
                x: [0, -1000],
                transition: {
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 15,
                    ease: "linear",
                  }
                }
              }}
            >
              {[
                "Scalable",
                "Efficient",
                "Innovative",
                "Cross-platform",
                "Modern"
              ].map((text, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="text-9xl font-bold text-gray-900">{text}</div>
                  <div className="text-9xl font-bold" style={{
                    WebkitTextStroke: '1px black',
                    WebkitTextFillColor: 'transparent'
                  }}>{text}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
      <motion.div 
        className="max-w-7xl mx-auto px-6 relative z-10 py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="relative bg-white py-12 px-6 rounded-xl shadow-sm mb-24">
          <motion.h2 
            className="text-center text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            variants={itemVariants}
          >
            Create your editor with the features you want
          </motion.h2>
          <motion.p 
            className="text-2xl text-center text-gray-600 mb-8 max-w-4xl mx-auto"
            variants={itemVariants}
          >
            Our extension-based architecture puts you in control. Choose from a wide range of features to build your perfect editing experience.
          </motion.p>
        </div>
        {/* Product Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {/* Editor Card */}
          <motion.div 
            className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 cursor-pointer"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              backgroundColor: "rgba(255, 255, 255, 0.95)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="mb-6">
              <motion.div 
                className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </motion.div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">Editor</h3>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Open source</span>
              </div>
              <p className="text-gray-600">Build custom editors that align perfectly with your user's needs, offering flexibility and ease of use.</p>
            </div>
            <a href="/editor" className="inline-flex items-center text-gray-900 font-medium hover:gap-2 transition-all duration-300">
              Learn more 
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </motion.div>
          {/* Collaboration Card */}
          <motion.div 
            className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 cursor-pointer"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              backgroundColor: "rgba(255, 255, 255, 0.95)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="mb-6">
              <motion.div 
                className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </motion.div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">Collaboration</h3>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Cloud</span>
              </div>
              <p className="text-gray-600">Enable real-time collaboration with live cursors, offline editing, and seamless content synchronization.</p>
            </div>
            <a href="/collaboration" className="inline-flex items-center text-gray-900 font-medium hover:gap-2 transition-all duration-300">
              Learn more 
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </motion.div>
          {/* AI Assistant Card */}
          <motion.div 
            className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 cursor-pointer"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              backgroundColor: "rgba(255, 255, 255, 0.95)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="mb-6">
              <motion.div 
                className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">AI Assistant</h3>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Premium</span>
              </div>
              <p className="text-gray-600">Enhance your writing with AI-powered suggestions, translations, and content refinements.</p>
            </div>
            <a href="/ai-assistant" className="inline-flex items-center text-gray-900 font-medium hover:gap-2 transition-all duration-300">
              Learn more 
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </motion.div>
          {/* Comments Card */}
          <motion.div 
            className="col-span-1 md:col-span-2 lg:col-span-3 mt-16 bg-gray-50 rounded-3xl p-12"
            variants={itemVariants}
          >
            <div className="flex justify-center gap-8 mb-16">
              {[
                { id: 'editor', label: 'Editor Features' },
                { id: 'collaboration', label: 'Collaboration' },
                { id: 'ai', label: 'AI Capabilities' },
                { id: 'security', label: 'Security' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  className={`px-6 py-3 rounded-full text-lg font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-black text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              {activeTab === 'editor' && (
                <div className="text-center">
                  <h3 className="text-4xl font-bold mb-6">Powerful Editor Features</h3>
                  <p className="text-xl text-gray-600 mb-8">
                    Build custom editors that align perfectly with your user's needs, offering flexibility and ease of use.
                  </p>
                </div>
              )}

              {activeTab === 'collaboration' && (
                <div className="text-center">
                  <h3 className="text-4xl font-bold mb-6">Real-time Collaboration</h3>
                  <p className="text-xl text-gray-600 mb-8">
                    Work together seamlessly with your team, featuring live cursors and instant updates.
                  </p>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="text-center">
                  <h3 className="text-4xl font-bold mb-6">AI-Powered Assistance</h3>
                  <p className="text-xl text-gray-600 mb-8">
                    Get intelligent suggestions and improvements as you write, powered by advanced AI.
                  </p>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="text-center">
                  <h3 className="text-4xl font-bold mb-6">Enterprise-Grade Security</h3>
                  <p className="text-xl text-gray-600 mb-8">
                    Keep your content safe with end-to-end encryption and advanced access controls.
                  </p>
                </div>
              )}
            </motion.div>          
            </motion.div>
        </motion.div>
        </motion.div>
      
    </div>
  );
}
