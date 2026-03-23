import React from 'react';

const Footer = () => {
  return (
<footer className="w-full border-t border-cyan-400/25 bg-[#070b10]/80 backdrop-blur-xl pt-12 pb-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-wide">
              Study <span className="text-cyan-300">Ally</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Your intelligent companion for exam preparation. Synthesize, practice, and master your syllabus with AI-powered insights.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-gray-100 font-semibold uppercase tracking-wider text-sm">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-cyan-300 transition-colors duration-200">API Documentation</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition-colors duration-200">Integration Guidelines</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition-colors duration-200">Terms of Service</a></li>
            </ul>
          </div>

          {/* Connect & Credits Section */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-gray-100 font-semibold uppercase tracking-wider text-sm">Project</h3>
            <p className="text-gray-400 text-sm">
              App designed and developed by Pallab Mondal, Samrat Mondal and Timothy Utsab Bandyopadhyay to help out students in their exam preparation journey.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://github.com/TheSam13" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors duration-200" title="GitHub Profile">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Study Ally. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span className="text-gray-500 text-sm font-mono tracking-wider uppercase">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;