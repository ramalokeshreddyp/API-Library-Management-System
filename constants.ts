export const MAX_BORROW_LIMIT = 3;
export const LOAN_PERIOD_DAYS = 14;
export const FINE_PER_DAY = 0.50;
export const SUSPENSION_THRESHOLD = 3; // Concurrent overdue books

export const CATEGORIES = [
  'Fiction',
  'Science',
  'Technology',
  'History',
  'Biography',
  'Children',
  'Romance',
  'Mystery'
];

export const MOCK_BOOKS_SEED = [
  { id: 'b1', isbn: '978-0141036137', title: '1984', author: 'George Orwell', category: 'Fiction', status: 'available', totalCopies: 5, availableCopies: 4, description: 'Dystopian social science fiction novel and cautionary tale.' },
  { id: 'b2', isbn: '978-0061120084', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', status: 'borrowed', totalCopies: 3, availableCopies: 0, description: 'A novel about the serious issues of rape and racial inequality.' },
  { id: 'b3', isbn: '978-0743273565', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', status: 'available', totalCopies: 4, availableCopies: 2, description: 'A novel set in the Jazz Age that tells the story of Jay Gatsby.' },
  { id: 'b4', isbn: '978-0547928227', title: 'The Hobbit', author: 'J.R.R. Tolkien', category: 'Children', status: 'available', totalCopies: 6, availableCopies: 5, description: 'A fantasy novel and children\'s book.' },
  { id: 'b5', isbn: '978-0553380163', title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', status: 'available', totalCopies: 2, availableCopies: 2, description: 'A book on cosmology by English physicist Stephen Hawking.' },
];

export const MOCK_MEMBERS_SEED = [
  { id: 'm1', name: 'Alice Johnson', email: 'alice@example.com', membershipNumber: 'MEM001', status: 'active', joinedDate: '2023-01-15' },
  { id: 'm2', name: 'Bob Smith', email: 'bob@example.com', membershipNumber: 'MEM002', status: 'active', joinedDate: '2023-02-20' },
  { id: 'm3', name: 'Charlie Brown', email: 'charlie@example.com', membershipNumber: 'MEM003', status: 'suspended', joinedDate: '2023-03-10' },
];
