import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext.tsx';
import { ArrowRightLeft, Check, AlertCircle, BookOpen, User, Calendar } from 'lucide-react';

const Circulation = () => {
  const { members, books, borrowBook, returnBook, getMemberActiveLoans } = useLibrary();
  const [activeTab, setActiveTab] = useState<'borrow' | 'return'>('borrow');
  
  // Borrow State
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Return State
  const [returnMemberId, setReturnMemberId] = useState('');

  const handleBorrow = async () => {
    setMessage(null);
    if (!selectedMember || !selectedBook) return;
    
    const result = await borrowBook(selectedBook, selectedMember);
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setSelectedBook('');
      // Optional: Don't clear member to allow batch borrow
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const handleReturn = async (transactionId: string) => {
     setMessage(null);
     const result = await returnBook(transactionId);
     if (result.success) {
       setMessage({ type: 'success', text: result.message });
     } else {
       setMessage({ type: 'error', text: result.message });
     }
  };

  const availableBooks = books.filter(b => b.availableCopies > 0);
  const activeLoansForReturn = returnMemberId ? getMemberActiveLoans(returnMemberId) : [];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Circulation Desk</h1>
        <p className="text-slate-500 mt-2">Process borrowing and returns</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
           <button 
             onClick={() => { setActiveTab('borrow'); setMessage(null); }}
             className={`flex-1 py-5 text-center font-bold text-sm uppercase tracking-wide transition-all ${activeTab === 'borrow' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
           >
             Borrow Book
           </button>
           <button 
             onClick={() => { setActiveTab('return'); setMessage(null); }}
             className={`flex-1 py-5 text-center font-bold text-sm uppercase tracking-wide transition-all ${activeTab === 'return' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
           >
             Return Book
           </button>
        </div>

        <div className="p-8 md:p-10 min-h-[400px] bg-slate-50/50">
          {message && (
            <div className={`mb-8 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
              <div className={`mt-0.5 p-1 rounded-full ${message.type === 'success' ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-200 text-rose-700'}`}>
                 {message.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
              </div>
              <p className="font-medium text-sm leading-relaxed">{message.text}</p>
            </div>
          )}

          {activeTab === 'borrow' && (
            <div className="space-y-8 max-w-lg mx-auto">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    <User size={14} /> Member
                  </label>
                  <div className="relative">
                    <select 
                        className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all appearance-none"
                        value={selectedMember}
                        onChange={e => setSelectedMember(e.target.value)}
                    >
                        <option value="">Select Member...</option>
                        {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name} — {m.membershipNumber}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ArrowRightLeft size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                     <BookOpen size={14} /> Book Title
                  </label>
                  <div className="relative">
                    <select 
                        className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all appearance-none"
                        value={selectedBook}
                        onChange={e => setSelectedBook(e.target.value)}
                    >
                        <option value="">Select Book...</option>
                        {availableBooks.map(b => (
                        <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} available)</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ArrowRightLeft size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                    onClick={handleBorrow}
                    disabled={!selectedMember || !selectedBook}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3 transform active:scale-95"
                >
                    <ArrowRightLeft size={20} />
                    Confirm Loan
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                   Standard loan period is 14 days. Limit 3 books per member.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'return' && (
             <div className="space-y-8">
                <div className="max-w-lg mx-auto space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    <User size={14} /> Find Member Loans
                  </label>
                  <div className="relative">
                    <select 
                        className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all appearance-none"
                        value={returnMemberId}
                        onChange={e => setReturnMemberId(e.target.value)}
                    >
                        <option value="">Select Member...</option>
                        {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name} — {m.membershipNumber}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ArrowRightLeft size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>

                {returnMemberId && (
                  <div className="mt-8 animate-in slide-in-from-bottom-2">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 text-center">Active Loans for Selected Member</h3>
                    {activeLoansForReturn.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
                        <Check size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No active loans found.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {activeLoansForReturn.map(loan => {
                          const book = books.find(b => b.id === loan.bookId);
                          const isOverdue = new Date() > new Date(loan.dueDate);
                          return (
                            <div key={loan.id} className="group bg-white flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all">
                               <div className="mb-4 sm:mb-0">
                                 <h4 className="font-bold text-slate-900 text-lg">{book?.title}</h4>
                                 <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
                                    {isOverdue && (
                                        <span className="flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-xs">
                                            <AlertCircle size={12} /> OVERDUE
                                        </span>
                                    )}
                                 </div>
                               </div>
                               <button 
                                 onClick={() => handleReturn(loan.id)}
                                 className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                               >
                                 Return Book
                               </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Circulation;