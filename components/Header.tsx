
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-8 flex items-center justify-between glass-effect sticky top-0 z-50 border-b border-amber-100/50">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-amber-800 rounded-xl flex items-center justify-center text-white text-xl">
          <i className="fas fa-coffee"></i>
        </div>
        <h1 className="text-2xl font-serif text-amber-950 font-bold">CafeVision <span className="text-amber-600">AI</span></h1>
      </div>
      <nav className="hidden md:flex gap-8 text-amber-900/70 font-medium">
        <a href="#" className="hover:text-amber-900">Dashboard</a>
        <a href="#" className="hover:text-amber-900 text-amber-900 font-bold border-b-2 border-amber-800">New Design</a>
        <a href="#" className="hover:text-amber-900">Projects</a>
      </nav>
      <div className="flex items-center gap-4">
        <button className="text-amber-900 bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center">
          <i className="fas fa-user"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
