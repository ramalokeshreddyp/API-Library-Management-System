import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext.tsx';
import { Terminal, Send, Database, AlertCircle } from 'lucide-react';

const ApiTester = () => {
  const library = useLibrary();
  const [response, setResponse] = useState<any>(null);
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/books');
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState('');

  const endpoints = [
    { group: 'Books', method: 'GET', path: '/books', desc: 'Full Catalog' },
    { group: 'Books', method: 'GET', path: '/books/available', desc: 'List In-Stock' },
    { group: 'Books', method: 'GET', path: '/books/{id}', desc: 'Resource Details', needsId: 'book' },
    { group: 'Books', method: 'POST', path: '/books', desc: 'Create Resource', hasPayload: true, defaultPayload: { title: 'New Sci-Fi', author: 'Isaac Asimov', isbn: '978-0553293357', category: 'Science', totalCopies: 5 } },
    { group: 'Books', method: 'PUT', path: '/books/{id}', desc: 'Update Resource', needsId: 'book', hasPayload: true, defaultPayload: { status: 'maintenance' } },
    { group: 'Books', method: 'DELETE', path: '/books/{id}', desc: 'Remove Resource', needsId: 'book' },
    
    { group: 'Members', method: 'GET', path: '/members', desc: 'All Patrons' },
    { group: 'Members', method: 'GET', path: '/members/{id}', desc: 'Patron Details', needsId: 'member' },
    { group: 'Members', method: 'POST', path: '/members', desc: 'Register Member', hasPayload: true, defaultPayload: { name: 'Sarah Connor', email: 'sarah@resistance.com', membershipNumber: 'MEM-800' } },
    { group: 'Members', method: 'GET', path: '/members/{id}/borrowed', desc: 'Active Patron Loans', needsId: 'member' },
    
    { group: 'Transactions', method: 'POST', path: '/transactions/borrow', desc: 'Issue Loan', hasPayload: true, defaultPayload: { bookId: 'b1', memberId: 'm1' } },
    { group: 'Transactions', method: 'POST', path: '/transactions/{id}/return', desc: 'Process Return', needsId: 'transaction' },
    { group: 'Transactions', method: 'GET', path: '/transactions/overdue', desc: 'Reporting: Late Items' },
    
    { group: 'Fines', method: 'POST', path: '/fines/{id}/pay', desc: 'Settle Penalty', needsId: 'fine' },
  ];

  const handleRun = async () => {
    setLoading(true);
    let result: any = null;
    let statusCode = 200;
    
    try {
      const body = payload ? JSON.parse(payload) : null;
      const parts = endpoint.split('/');
      const id = parts[2];

      if (endpoint === '/books' && method === 'GET') result = library.books;
      else if (endpoint === '/books/available' && method === 'GET') result = library.getAvailableBooks();
      else if (parts[1] === 'books' && method === 'GET' && id) {
        result = library.getBookById(id) || { error: 'Resource Not Found' };
        if (!result.id) statusCode = 404;
      }
      else if (endpoint === '/books' && method === 'POST') {
        library.addBook(body);
        result = { message: 'Resource created successfully', resource: body };
        statusCode = 201;
      }
      else if (parts[1] === 'books' && method === 'PUT' && id) {
        library.updateBook(id, body);
        result = { message: 'Resource updated successfully' };
      }
      else if (parts[1] === 'books' && method === 'DELETE' && id) {
        library.deleteBook(id);
        result = { message: 'Resource deleted successfully' };
      }
      else if (endpoint === '/members' && method === 'GET') result = library.members;
      else if (parts[1] === 'members' && parts[3] === 'borrowed' && id) result = library.getMemberBorrowedBooks(id);
      else if (parts[1] === 'members' && method === 'GET' && id) {
        result = library.getMemberById(id) || { error: 'Patron Not Found' };
        if (!result.id) statusCode = 404;
      }
      else if (endpoint === '/members' && method === 'POST') {
        library.addMember(body);
        result = { message: 'Member registered successfully', member: body };
        statusCode = 201;
      }
      else if (endpoint === '/transactions/borrow' && method === 'POST') {
        result = await library.borrowBook(body.bookId, body.memberId);
        if (!result.success) {
           statusCode = 400;
           result = { error: 'Business Rule Violation', message: result.message };
        }
      }
      else if (parts[1] === 'transactions' && parts[3] === 'return' && id) {
        result = await library.returnBook(id);
        if (!result.success) {
           statusCode = 400;
           result = { error: 'State Machine Error', message: result.message };
        }
      }
      else if (endpoint === '/transactions/overdue' && method === 'GET') result = library.getOverdueTransactions();
      else if (parts[1] === 'fines' && parts[3] === 'pay' && id) {
        library.payFine(id);
        result = { message: 'Payment processed. Fine cleared.' };
      } else {
        statusCode = 404;
        result = { error: 'Unknown Endpoint' };
      }
    } catch (e) {
      result = { error: 'Internal Simulation Error', detail: String(e) };
      statusCode = 500;
    }

    setTimeout(() => {
      setResponse({ status: statusCode, body: result, timestamp: new Date().toISOString() });
      setLoading(false);
    }, 300);
  };

  const selectEndpoint = (ep: any) => {
    setMethod(ep.method);
    let path = ep.path;
    if (ep.needsId === 'book') path = path.replace('{id}', library.books[0]?.id || 'null');
    else if (ep.needsId === 'member') path = path.replace('{id}', library.members[0]?.id || 'null');
    else if (ep.needsId === 'transaction') path = path.replace('{id}', library.transactions[0]?.id || 'null');
    else if (ep.needsId === 'fine') path = path.replace('{id}', library.fines[0]?.id || 'null');
    setEndpoint(path);
    setPayload(ep.hasPayload ? JSON.stringify(ep.defaultPayload, null, 2) : '');
    setResponse(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 space-y-6">
        {['Books', 'Members', 'Transactions', 'Fines'].map(group => (
          <div key={group} className="space-y-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{group}</h3>
            <div className="space-y-1">
              {endpoints.filter(e => e.group === group).map((ep, i) => (
                <button 
                  key={i} onClick={() => selectEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-xl border text-[11px] transition-all group ${endpoint.includes(ep.path.split('/')[1]) && method === ep.method ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                >
                  <span className={`font-black mr-2 ${ep.method === 'GET' ? 'text-blue-500' : ep.method === 'POST' ? 'text-emerald-500' : 'text-amber-500'}`}>{ep.method}</span>
                  <span className="text-slate-600 font-mono opacity-80">{ep.path}</span>
                  <p className="mt-1 text-slate-400 group-hover:text-slate-600 transition-colors">{ep.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-3">
        <div className="bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl min-h-[650px] flex flex-col border border-slate-800">
          <div className="bg-slate-800/50 backdrop-blur-md px-8 py-5 flex items-center justify-between border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg"><Terminal size={18} className="text-indigo-400" /></div>
              <span className="text-slate-300 text-sm font-bold tracking-tight">Backend API Simulator</span>
            </div>
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
            </div>
          </div>

          <div className="p-8 space-y-6 flex-1 flex flex-col">
            <div className="flex gap-3">
              <div className="bg-slate-800 text-indigo-300 px-5 py-3.5 rounded-2xl font-black text-xs border border-slate-700/50 shadow-inner">{method}</div>
              <input value={endpoint} onChange={e => setEndpoint(e.target.value)} className="flex-1 bg-slate-800/50 border border-slate-700/50 text-slate-100 px-5 py-3.5 rounded-2xl font-mono text-xs focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all" />
              <button onClick={handleRun} disabled={loading} className="bg-indigo-600 text-white px-8 rounded-2xl font-bold text-xs hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />} Execute
              </button>
            </div>

            {(method === 'POST' || method === 'PUT') && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Request Payload</span>
                <textarea value={payload} onChange={e => setPayload(e.target.value)} className="w-full bg-slate-800/30 border border-slate-700/50 text-indigo-100 p-5 rounded-2xl font-mono text-xs h-32 resize-none focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="JSON Payload..." />
              </div>
            )}

            <div className="flex-1 flex flex-col min-h-[300px]">
              <div className="flex justify-between items-center mb-3 px-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Server Response</span>
                {response && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-600 font-mono">{response.timestamp}</span>
                    <div className={`text-[10px] font-black px-3 py-1 rounded-full ${response.status >= 400 ? 'text-rose-400 bg-rose-400/10 border border-rose-400/20' : 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'}`}>
                      HTTP {response.status}
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-slate-950 rounded-[24px] p-8 font-mono text-xs text-indigo-300 flex-1 overflow-auto border border-slate-800/50 shadow-inner scroll-smooth">
                {response ? (
                   <pre className="animate-in fade-in duration-300">{JSON.stringify(response.body, null, 2)}</pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 text-slate-500 select-none">
                    <Database size={64} strokeWidth={1} />
                    <p className="mt-4 font-black text-xl uppercase tracking-[0.2em]">Ready for Query</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold mt-2 ml-1">
               <AlertCircle size={12} />
               Simulation utilizes isolated context state. Persists until page reload.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTester;