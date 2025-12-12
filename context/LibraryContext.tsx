import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Book, Member, Transaction, Fine, BookStatus, MemberStatus, TransactionStatus } from '../types.ts';
import { MOCK_BOOKS_SEED, MOCK_MEMBERS_SEED, MAX_BORROW_LIMIT, LOAN_PERIOD_DAYS, FINE_PER_DAY, SUSPENSION_THRESHOLD } from '../constants.ts';

const generateId = () => Math.random().toString(36).substring(2, 11);

const subDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't-seed-1', bookId: 'b2', memberId: 'm3', borrowedAt: subDays(20), dueDate: subDays(6), status: TransactionStatus.OVERDUE },
  { id: 't-seed-2', bookId: 'b1', memberId: 'm1', borrowedAt: subDays(2), dueDate: subDays(12), status: TransactionStatus.ACTIVE },
];

const INITIAL_FINES: Fine[] = [
  { id: 'f-seed-1', memberId: 'm3', transactionId: 't-seed-1', amount: 6 * FINE_PER_DAY, createdAt: subDays(5) }
];

const INITIAL_BOOKS = (MOCK_BOOKS_SEED as Book[]).map(book => {
  const activeCount = INITIAL_TRANSACTIONS.filter(t => 
    t.bookId === book.id && t.status !== TransactionStatus.RETURNED
  ).length;
  const newAvailable = Math.max(0, book.totalCopies - activeCount);
  return {
    ...book,
    availableCopies: newAvailable,
    status: newAvailable <= 0 ? BookStatus.BORROWED : BookStatus.AVAILABLE
  };
});

interface LibraryContextType {
  books: Book[];
  members: Member[];
  transactions: Transaction[];
  fines: Fine[];
  addBook: (book: any) => void;
  updateBook: (id: string, updates: any) => void;
  deleteBook: (id: string) => void;
  addMember: (member: any) => void;
  updateMember: (id: string, updates: any) => void;
  deleteMember: (id: string) => void;
  borrowBook: (bookId: string, memberId: string) => Promise<{ success: boolean; message: string }>;
  returnBook: (transactionId: string) => Promise<{ success: boolean; message: string; fineAmount?: number }>;
  payFine: (fineId: string) => void;
  getMemberActiveLoans: (memberId: string) => Transaction[];
  getAvailableBooks: () => Book[];
  getMemberBorrowedBooks: (memberId: string) => { transaction: Transaction; book: Book | undefined }[];
  getOverdueTransactions: () => Transaction[];
  getBookById: (id: string) => Book | undefined;
  getMemberById: (id: string) => Member | undefined;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS_SEED as Member[]);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [fines, setFines] = useState<Fine[]>(INITIAL_FINES);

  // Business Rule: Automated lifecycle monitoring (Overdue detection & Member Suspension)
  useEffect(() => {
    const monitorSystem = () => {
      const now = new Date().toISOString();
      let hasChanges = false;
      
      const updatedTransactions = transactions.map(t => {
        if (t.status === TransactionStatus.ACTIVE && t.dueDate < now) {
          hasChanges = true;
          return { ...t, status: TransactionStatus.OVERDUE };
        }
        return t;
      });

      if (hasChanges) {
        setTransactions(updatedTransactions);
      }

      // Business Rule: Suspended if 3+ concurrently overdue items
      const overdueByMember: Record<string, number> = {};
      updatedTransactions.forEach(t => {
        if (t.status === TransactionStatus.OVERDUE) {
          overdueByMember[t.memberId] = (overdueByMember[t.memberId] || 0) + 1;
        }
      });

      setMembers(prev => prev.map(m => {
        const overdueCount = overdueByMember[m.id] || 0;
        const targetStatus = overdueCount >= SUSPENSION_THRESHOLD ? MemberStatus.SUSPENDED : MemberStatus.ACTIVE;
        return m.status !== targetStatus ? { ...m, status: targetStatus } : m;
      }));
    };

    const interval = setInterval(monitorSystem, 10000);
    monitorSystem();
    return () => clearInterval(interval);
  }, [transactions]);

  const addBook = (data: any) => setBooks(prev => [...prev, { 
    ...data, 
    id: generateId(), 
    availableCopies: data.totalCopies, 
    status: BookStatus.AVAILABLE 
  }]);
  
  const updateBook = (id: string, updates: any) => setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  const deleteBook = (id: string) => setBooks(prev => prev.filter(b => b.id !== id));
  
  const addMember = (data: any) => setMembers(prev => [...prev, { 
    ...data, 
    id: generateId(), 
    status: MemberStatus.ACTIVE, 
    joinedDate: new Date().toISOString() 
  }]);
  
  const updateMember = (id: string, updates: any) => setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  const deleteMember = (id: string) => setMembers(prev => prev.filter(m => m.id !== id));

  const getAvailableBooks = useCallback(() => books.filter(b => b.availableCopies > 0 && b.status === BookStatus.AVAILABLE), [books]);
  const getOverdueTransactions = useCallback(() => transactions.filter(t => t.status === TransactionStatus.OVERDUE), [transactions]);
  const getBookById = (id: string) => books.find(b => b.id === id);
  const getMemberById = (id: string) => members.find(m => m.id === id);
  const getMemberActiveLoans = (memberId: string) => transactions.filter(t => t.memberId === memberId && t.status !== TransactionStatus.RETURNED);
  const getMemberBorrowedBooks = (memberId: string) => 
    transactions
      .filter(t => t.memberId === memberId && t.status !== TransactionStatus.RETURNED)
      .map(t => ({ transaction: t, book: books.find(b => b.id === t.bookId) }));

  // Centralized Business Rule Engine: Borrowing
  const borrowBook = async (bookId: string, memberId: string) => {
    const member = members.find(m => m.id === memberId);
    const book = books.find(b => b.id === bookId);
    
    if (!member || !book) return { success: false, message: 'Resource not found' };

    // 1. Validate Member Eligibility
    if (member.status === MemberStatus.SUSPENDED) 
      return { success: false, message: 'BORROW_DENIED: Member account is suspended due to excessive overdue items.' };
    
    if (fines.some(f => f.memberId === memberId && !f.paidAt)) 
      return { success: false, message: 'BORROW_DENIED: Member has outstanding unpaid fines.' };
    
    if (getMemberActiveLoans(memberId).length >= MAX_BORROW_LIMIT) 
      return { success: false, message: `BORROW_DENIED: Member has reached the maximum borrowing limit of ${MAX_BORROW_LIMIT} items.` };

    // 2. Validate Book Availability
    if (book.status !== BookStatus.AVAILABLE || book.availableCopies <= 0) 
      return { success: false, message: `BORROW_DENIED: The requested book is currently ${book.status}.` };

    // 3. Perform Transaction
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + LOAN_PERIOD_DAYS);
    
    setTransactions(prev => [...prev, { 
      id: generateId(), bookId, memberId, 
      borrowedAt: new Date().toISOString(), 
      dueDate: dueDate.toISOString(), 
      status: TransactionStatus.ACTIVE 
    }]);
    
    setBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        const remaining = b.availableCopies - 1;
        return { 
          ...b, 
          availableCopies: remaining, 
          status: remaining === 0 ? BookStatus.BORROWED : BookStatus.AVAILABLE 
        };
      }
      return b;
    }));
    
    return { success: true, message: 'BORROW_SUCCESS: Item issued successfully. Please return within 14 days.' };
  };

  // Centralized Business Rule Engine: Returning
  const returnBook = async (transactionId: string) => {
    const t = transactions.find(tr => tr.id === transactionId);
    if (!t || t.status === TransactionStatus.RETURNED) return { success: false, message: 'ERROR: Invalid or already returned transaction.' };
    
    const now = new Date();
    const dueDate = new Date(t.dueDate);
    const overdueDays = Math.max(0, Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24)));
    const fineAmount = overdueDays * FINE_PER_DAY;
    
    if (fineAmount > 0) {
      setFines(prev => [...prev, { 
        id: generateId(), memberId: t.memberId, transactionId: t.id, 
        amount: fineAmount, createdAt: now.toISOString() 
      }]);
    }
    
    setTransactions(prev => prev.map(tr => tr.id === transactionId ? { 
      ...tr, returnedAt: now.toISOString(), status: TransactionStatus.RETURNED 
    } : tr));
    
    setBooks(prev => prev.map(b => {
      if (b.id === t.bookId) {
        return { 
          ...b, availableCopies: b.availableCopies + 1, status: BookStatus.AVAILABLE 
        };
      }
      return b;
    }));
    
    return { 
      success: true, 
      message: fineAmount > 0 
        ? `RETURN_SUCCESS: Overdue penalty of $${fineAmount.toFixed(2)} applied.` 
        : 'RETURN_SUCCESS: Item returned on time.' 
    };
  };

  const payFine = (fineId: string) => setFines(prev => prev.map(f => f.id === fineId ? { ...f, paidAt: new Date().toISOString() } : f));

  return (
    <LibraryContext.Provider value={{ 
      books, members, transactions, fines, 
      addBook, updateBook, deleteBook, 
      addMember, updateMember, deleteMember, 
      borrowBook, returnBook, payFine, 
      getMemberActiveLoans, getAvailableBooks, getMemberBorrowedBooks, getOverdueTransactions, 
      getBookById, getMemberById 
    }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const c = useContext(LibraryContext);
  if (!c) throw new Error('useLibrary context missing');
  return c;
};