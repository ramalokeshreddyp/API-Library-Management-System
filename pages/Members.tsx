import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext.tsx';
import { Member, MemberStatus } from '../types.ts';
import { Plus, X, User, ShieldAlert, BookOpen, CreditCard, Edit, Trash2 } from 'lucide-react';

const Members = () => {
  const { members, addMember, deleteMember, updateMember, transactions, fines } = useLibrary();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<Partial<Member>>({ name: '', email: '', membershipNumber: '' });

  const openEdit = (member: Member) => {
    setNewMember(member);
    setEditingId(member.id);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMember.name && newMember.email && newMember.membershipNumber) {
      if (editingId) {
        updateMember(editingId, newMember);
      } else {
        addMember({
          name: newMember.name,
          email: newMember.email,
          membershipNumber: newMember.membershipNumber
        });
      }
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNewMember({ name: '', email: '', membershipNumber: '' });
  };

  const getActiveLoansCount = (memberId: string) => {
    return transactions.filter(t => t.memberId === memberId && !t.returnedAt).length;
  };
  
  const getFinesStatus = (memberId: string) => {
    return fines.some(f => f.memberId === memberId && !f.paidAt);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Member Directory</h1>
          <p className="text-slate-500 mt-1">Manage accounts and borrowing privileges</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); }}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Register New Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {members.map(member => {
            const loans = getActiveLoansCount(member.id);
            const hasFines = getFinesStatus(member.id);
            const isSuspended = member.status === MemberStatus.SUSPENDED;
            
            return (
                <div key={member.id} className={`bg-white rounded-2xl p-6 shadow-sm border transition-all hover:shadow-lg relative overflow-hidden group ${isSuspended ? 'border-rose-200' : 'border-slate-100 hover:border-indigo-100'}`}>
                    {isSuspended && <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />}
                    
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <button onClick={() => openEdit(member)} className="p-1.5 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-lg border border-slate-100 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => deleteMember(member.id)} className="p-1.5 bg-slate-50 text-slate-500 hover:text-rose-600 rounded-lg border border-slate-100 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isSuspended ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors'}`}>
                                {member.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 leading-tight">{member.name}</h3>
                                <p className="text-xs text-slate-400 font-mono mt-1">{member.membershipNumber}</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${member.status === MemberStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                            {member.status}
                        </span>
                    </div>

                    <div className="space-y-3">
                       <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-slate-500">
                             <BookOpen size={16} />
                             <span>Active Loans</span>
                          </div>
                          <span className={`font-bold ${loans >= 3 ? 'text-amber-600' : 'text-slate-800'}`}>{loans} / 3</span>
                       </div>

                       <div className={`rounded-xl p-3 flex justify-between items-center text-sm border ${hasFines ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-white border-slate-100 text-slate-600'}`}>
                          <div className="flex items-center gap-2">
                             <CreditCard size={16} />
                             <span>Standing</span>
                          </div>
                          <span className="font-bold">
                              {hasFines ? 'Unpaid Fines' : 'Good'}
                          </span>
                       </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                        <span className="flex items-center gap-1.5"><User size={12} /> {member.email}</span>
                        <span>Joined {new Date(member.joinedDate).toLocaleDateString()}</span>
                    </div>
                </div>
            )
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Member' : 'Register Member'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                  <input required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} placeholder="Lokesh Reddy" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</label>
                  <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} placeholder="lokesh@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Membership ID</label>
                  <input required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" value={newMember.membershipNumber} onChange={e => setNewMember({...newMember, membershipNumber: e.target.value})} placeholder="MEM-..." />
                </div>
              <div className="pt-2 flex gap-3 justify-end border-t border-slate-100 mt-4">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-bold shadow-md shadow-indigo-200 transition-colors">
                  {editingId ? 'Save Changes' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;