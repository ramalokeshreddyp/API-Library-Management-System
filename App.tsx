import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext.tsx';
import Layout from './components/Layout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Books from './pages/Books.tsx';
import Members from './pages/Members.tsx';
import Circulation from './pages/Circulation.tsx';
import Fines from './pages/Fines.tsx';
import ApiTester from './pages/ApiTester.tsx';

function App() {
  return (
    <LibraryProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="books" element={<Books />} />
            <Route path="members" element={<Members />} />
            <Route path="circulation" element={<Circulation />} />
            <Route path="fines" element={<Fines />} />
            <Route path="api-tester" element={<ApiTester />} />
            <Route path="*" element={<div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
              <h1 className="text-4xl font-bold mb-2">404</h1>
              <p>Requested module not found in the system.</p>
            </div>} />
          </Route>
        </Routes>
      </Router>
    </LibraryProvider>
  );
}

export default App;