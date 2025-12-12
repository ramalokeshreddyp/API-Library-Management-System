import React, { useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext.tsx';
import { BookOpen, Users, Clock, AlertOctagon, TrendingUp, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TransactionStatus, MemberStatus } from '../types.ts';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, colorClass, trend }: { title: string, value: string | number, icon: React.ReactNode, colorClass: string, trend?: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-[100px] transition-transform group-hover:scale-110`} />
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
        {trend && <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2"><TrendingUp size={12} /> {trend} vs last week</p>}
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} text-white shadow-lg shadow-indigo-500/10`}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { books, members, transactions, fines } = useLibrary();

  const activeLoans = transactions.filter(t => t.status === TransactionStatus.ACTIVE || t.status === TransactionStatus.OVERDUE).length;
  const overdueLoans = transactions.filter(t => t.status === TransactionStatus.OVERDUE).length;
  const pendingFines = fines.filter(f => !f.paidAt).reduce((acc, curr) => acc + curr.amount, 0);
  const activeMembers = members.filter(m => m.status === MemberStatus.ACTIVE).length;
  const totalTitles = books.length;

  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const count = transactions.filter(t => {
        const tDate = new Date(t.borrowedAt);
        return tDate.getDate() === d.getDate() && 
               tDate.getMonth() === d.getMonth() && 
               tDate.getFullYear() === d.getFullYear();
      }).length;

      data.push({ name: dayName, loans: count });
    }
    return data;
  }, [transactions]);

  const recentOverdue = useMemo(() => {
     return transactions
       .filter(t => t.status === TransactionStatus.OVERDUE)
       .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
       .slice(0, 3);
  }, [transactions]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
           <p className="text-slate-500 mt-1">Real-time metrics and library performance</p>
        </div>
        <Link to="/circulation" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center gap-2">
           Go to Circulation <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Books" 
          value={totalTitles} 
          icon={<BookOpen size={24} />} 
          colorClass="from-blue-500 to-blue-600"
          trend="+2.5%"
        />
        <StatCard 
          title="Active Members" 
          value={activeMembers} 
          icon={<Users size={24} />} 
          colorClass="from-emerald-500 to-emerald-600"
          trend="+12%"
        />
        <StatCard 
          title="Active Loans" 
          value={activeLoans} 
          icon={<Clock size={24} />} 
          colorClass="from-amber-500 to-amber-600"
        />
        <StatCard 
          title="Overdue Items" 
          value={overdueLoans} 
          icon={<AlertOctagon size={24} />} 
          colorClass="from-rose-500 to-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800">Weekly Borrowing Trends</h3>
            <div className="flex gap-2 text-xs font-medium bg-slate-50 p-1 rounded-lg">
               <span className="px-3 py-1 bg-white shadow-sm rounded-md text-slate-800">Last 7 Days</span>
               <span className="px-3 py-1 text-slate-500 hover:bg-white/50 rounded-md cursor-pointer transition-colors">Last Month</span>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  allowDecimals={false} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="loans" radius={[6, 6, 6, 6]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full translate-x-10 -translate-y-10" />
             <h3 className="text-lg font-bold text-slate-800 mb-2 relative z-10">Outstanding Fines</h3>
             <p className="text-slate-500 text-sm mb-6 relative z-10">Total unpaid penalties across all members</p>
             <div className="flex items-baseline gap-1 relative z-10">
                <span className="text-4xl font-extrabold text-slate-900">${pendingFines.toFixed(2)}</span>
                <span className="text-sm text-slate-400 font-medium">USD</span>
             </div>
             {pendingFines > 0 && (
               <div className="mt-6">
                 <Link to="/fines" className="block text-center w-full py-2.5 bg-rose-50 text-rose-600 font-semibold rounded-xl hover:bg-rose-100 transition-colors text-sm">
                   Review Payments
                 </Link>
               </div>
             )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Critical Overdue</h3>
            <div className="space-y-3">
              {recentOverdue.map(t => {
                const book = books.find(b => b.id === t.bookId);
                const member = members.find(m => m.id === t.memberId);
                const daysOverdue = Math.ceil((new Date().getTime() - new Date(t.dueDate).getTime()) / (1000 * 3600 * 24));
                
                return (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-12 bg-indigo-100 rounded flex-shrink-0 flex items-center justify-center text-indigo-800 font-bold text-xs">
                       {daysOverdue}d
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{book?.title}</p>
                      <p className="text-xs text-slate-500 truncate">{member?.name}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  </div>
                )
              })}
              {recentOverdue.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Clock size={24} className="mx-auto mb-2 opacity-50" />
                  No overdue items today.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;