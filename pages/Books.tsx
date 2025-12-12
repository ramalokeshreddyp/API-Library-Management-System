import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext.tsx';
import { BookStatus, Book } from '../types.ts';
import { CATEGORIES } from '../constants.ts';
import { Search, Plus, Sparkles, X, Filter, BookOpen, AlertTriangle, Edit, Trash2, Settings, Bookmark } from 'lucide-react';
import { generateBookDescription } from '../services/geminiService.ts';

const Books = () => {
  const { books, addBook, deleteBook, updateBook } = useLibrary();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newBook, setNewBook] = useState<Partial<Book>>({
    title: '', author: '', isbn: '', category: CATEGORIES[0], totalCopies: 1, description: '', status: BookStatus.AVAILABLE
  });
  const [generating, setGenerating] = useState(false);

  // Robust Filtering Logic
  const filteredBooks = books.filter(b => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      b.title.toLowerCase().includes(searchLower) || 
      b.author.toLowerCase().includes(searchLower) ||
      b.isbn.toLowerCase().includes(searchLower);
    
    let matchesFilter = true;
    if (filter === 'available') {
      matchesFilter = b.availableCopies > 0 && b.status === BookStatus.AVAILABLE;
    } else if (filter === 'borrowed') {
      matchesFilter = b.availableCopies === 0 || b.status === BookStatus.BORROWED;
    }

    return matchesSearch && matchesFilter;
  });

  const handleGenerateDesc = async () => {
    if (!newBook.title || !newBook.author) return;
    setGenerating(true);
    const desc = await generateBookDescription(newBook.title, newBook.author);
    setNewBook(prev => ({ ...prev, description: desc }));
    setGenerating(false);
  };

  const openEdit = (book: Book) => {
    setNewBook(book);
    setEditingId(book.id);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBook.title && newBook.author && newBook.isbn && newBook.totalCopies) {
      if (editingId) {
        updateBook(editingId, newBook);
      } else {
        addBook({
          ...newBook,
          totalCopies: Number(newBook.totalCopies),
        });
      }
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNewBook({ title: '', author: '', isbn: '', category: CATEGORIES[0], totalCopies: 1, description: '', status: BookStatus.AVAILABLE });
  };

  const getCoverGradient = (category: string) => {
    switch (category) {
      case 'Fiction': return 'from-purple-500 to-indigo-600';
      case 'Science': return 'from-emerald-500 to-teal-600';
      case 'Technology': return 'from-blue-500 to-cyan-600';
      case 'History': return 'from-amber-500 to-orange-600';
      case 'Biography': return 'from-rose-500 to-pink-600';
      case 'Children': return 'from-yellow-400 to-orange-500';
      case 'Romance': return 'from-pink-400 to-rose-500';
      case 'Mystery': return 'from-slate-700 to-slate-900';
      default: return 'from-slate-500 to-slate-700';
    }
  };

  const getStatusBadge = (status: BookStatus, available: number) => {
    const iconSize = 12;
    if (status === BookStatus.AVAILABLE && available > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100">
          <BookOpen size={iconSize} /> Available
        </span>
      );
    }
    if (status === BookStatus.MAINTENANCE) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-rose-50 text-rose-700 border border-rose-100">
          <Settings size={iconSize} /> Maintenance
        </span>
      );
    }
    if (status === BookStatus.RESERVED) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100">
          <Bookmark size={iconSize} /> Reserved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-100">
        <AlertTriangle size={iconSize} /> Borrowed
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Library Catalog</h1>
          <p className="text-slate-500 mt-1">Manage physical inventory and status</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Add New Book
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search titles, authors, or ISBN..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
          {['all', 'available', 'borrowed'].map((f) => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               {f}
             </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <div key={book.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-indigo-100 transition-all group flex flex-col overflow-hidden">
            <div className={`h-40 bg-gradient-to-br ${getCoverGradient(book.category)} p-6 flex flex-col justify-end relative`}>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={(e) => { e.stopPropagation(); openEdit(book); }} className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-colors">
                  <Edit size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteBook(book.id); }} className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-rose-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <span className="relative z-10 text-xs font-bold text-white/80 uppercase tracking-wider mb-1">{book.category}</span>
              <h3 className="relative z-10 text-white font-bold text-lg leading-snug line-clamp-2">{book.title}</h3>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex-1">
                <p className="text-slate-500 text-sm font-medium mb-4">{book.author}</p>
                <div className="space-y-2 text-xs text-slate-500">
                   <div className="flex justify-between border-b border-slate-50 pb-2">
                     <span>ISBN</span>
                     <span className="font-mono">{book.isbn}</span>
                   </div>
                   <div className="flex justify-between items-center pt-1">
                     <span>Stock</span>
                     <div className="flex items-center gap-1 font-bold text-slate-700">
                        {book.availableCopies} <span className="text-slate-400 font-normal">/</span> {book.totalCopies}
                     </div>
                   </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                 {getStatusBadge(book.status, book.availableCopies)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Update Resource' : 'Catalog New Book'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Title</label>
                    <input required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} placeholder="e.g. 1984" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Author</label>
                    <input required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} placeholder="George Orwell" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">ISBN</label>
                    <input required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50" value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} placeholder="978-..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Copies</label>
                    <input required type="number" min="1" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50" value={newBook.totalCopies} onChange={e => setNewBook({...newBook, totalCopies: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Initial Status</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50" value={newBook.status} onChange={e => setNewBook({...newBook, status: e.target.value as BookStatus})}>
                        {Object.values(BookStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">AI Description</label>
                    <button type="button" onClick={handleGenerateDesc} disabled={generating || !newBook.title} className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md font-medium flex items-center gap-1 hover:bg-indigo-100 disabled:opacity-50 transition-colors">
                      <Sparkles size={12} /> {generating ? 'Processing...' : 'Auto-Summarize'}
                    </button>
                  </div>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm h-24 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none" 
                    value={newBook.description} 
                    onChange={e => setNewBook({...newBook, description: e.target.value})} 
                    placeholder="Provide a brief summary..."
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3 justify-end border-t border-slate-100 mt-4">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-bold shadow-md shadow-indigo-200 transition-colors">
                  {editingId ? 'Save Changes' : 'Catalog Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;