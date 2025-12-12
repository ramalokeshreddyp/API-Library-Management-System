import React from 'react';
import { useLibrary } from '../context/LibraryContext.tsx';
import { CheckCircle, DollarSign, Clock } from 'lucide-react';

const Fines = () => {
  const { fines, members, payFine } = useLibrary();
  
  // Sort fines: unpaid first
  const sortedFines = [...fines].sort((a, b) => {
    if (a.paidAt && !b.paidAt) return 1;
    if (!a.paidAt && b.paidAt) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Records</h1>
           <p className="text-slate-500 mt-1">Manage overdue penalties and payments</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wide">Member</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wide">Date Issued</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wide text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedFines.map(fine => {
                const member = members.find(m => m.id === fine.memberId);
                
                return (
                  <tr key={fine.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5">
                      <div className="font-bold text-slate-900">{member?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-400 font-mono">{member?.membershipNumber}</div>
                    </td>
                    <td className="p-5 text-slate-600 text-sm">Overdue Penalty</td>
                    <td className="p-5">
                       <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded text-sm">
                          ${fine.amount.toFixed(2)}
                       </span>
                    </td>
                    <td className="p-5 text-slate-500 text-sm">{new Date(fine.createdAt).toLocaleDateString()}</td>
                    <td className="p-5">
                      {fine.paidAt ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle size={14} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
                          <Clock size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      {!fine.paidAt && (
                        <button 
                          onClick={() => payFine(fine.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95"
                        >
                          <DollarSign size={14} /> Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sortedFines.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <div className="inline-flex p-4 rounded-full bg-slate-50 mb-3">
                       <CheckCircle size={24} className="text-slate-300" />
                    </div>
                    <p className="font-medium">No records found</p>
                    <p className="text-sm opacity-70">All accounts are in good standing.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Fines;