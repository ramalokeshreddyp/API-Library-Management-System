import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Book, Users, Repeat, AlertTriangle, Menu, X, Sparkles, LogOut, Library, Terminal } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext.tsx';
import { askLibrarian } from '../services/geminiService.ts';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  
  const { books } = useLibrary();

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const answer = await askLibrarian(query, books);
    setAiResponse(answer);
    setLoading(false);
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} />, end: true },
    { to: '/books', label: 'Book Inventory', icon: <Book size={20} />, end: false },
    { to: '/members', label: 'Members', icon: <Users size={20} />, end: false },
    { to: '/circulation', label: 'Circulation Desk', icon: <Repeat size={20} />, end: false },
    { to: '/fines', label: 'Fines & Overdue', icon: <AlertTriangle size={20} />, end: false },
    { to: '/api-tester', label: 'API Interface', icon: <Terminal size={20} />, end: false },
  ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const item = navItems.find(i => {
      if (i.end) return currentPath === i.to;
      return i.to !== '/' && currentPath.startsWith(i.to);
    });
    return item ? item.label : 'Library System';
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="flex items-center gap-3 p-8 border-b border-slate-100">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
            <Library size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-900 tracking-tight">LibraFlow</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Management Hub</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm ring-1 ring-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={`transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
           <button 
             onClick={() => setAiChatOpen(!aiChatOpen)}
             type="button"
             className={`flex items-center justify-center w-full gap-2 p-3 rounded-xl transition-all duration-200 font-bold text-sm shadow-sm ring-1 ${aiChatOpen ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-white text-slate-700 ring-slate-200 hover:ring-indigo-300 hover:text-indigo-600'}`}
           >
              <Sparkles size={16} className={aiChatOpen ? 'text-indigo-200' : 'text-indigo-500'} />
              {aiChatOpen ? "Close Assistant" : "Ask AI Librarian"}
           </button>
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">LR</div>
             <div className="flex-1 min-w-0 text-sm">
               <p className="font-bold text-slate-900 truncate">Lokesh Reddy</p>
               <p className="text-xs text-slate-500 truncate">Senior Administrator</p>
             </div>
             <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg text-slate-900 tracking-tight">LibraFlow</span>
          </div>
          
          <div className="hidden lg:block">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{getPageTitle()}</h2>
          </div>

          <div className="text-sm font-medium text-slate-500 hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Live: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 relative scroll-smooth bg-slate-50/30">
          <div className="max-w-7xl mx-auto pb-20">
            <Outlet />
          </div>

          {aiChatOpen && (
            <div className="fixed bottom-6 right-6 w-96 bg-white shadow-2xl rounded-2xl border border-slate-200 flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-5 rounded-t-2xl flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Sparkles size={16} className="text-indigo-50" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide">AI Librarian</h3>
                    <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Gemini Powered</p>
                  </div>
                </div>
                <button onClick={() => setAiChatOpen(false)} className="text-indigo-100 hover:text-white transition-colors"><X size={18} /></button>
              </div>
              <div className="p-5 h-80 overflow-y-auto bg-slate-50/50">
                {aiResponse ? (
                  <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2">
                     <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 mt-1 border border-indigo-200">
                        <Sparkles size={14} />
                     </div>
                     <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {aiResponse}
                     </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-50">
                    <Library size={48} strokeWidth={1} />
                    <p className="text-sm font-medium">How can I assist with the catalog today?</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
                <form onSubmit={handleAskAI} className="relative">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about inventory or policies..."
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium transition-all"
                  />
                  <button 
                    disabled={loading || !query.trim()}
                    type="submit" 
                    className="absolute right-2 top-1.5 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md shadow-indigo-100"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={16} />}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Layout;