# LibraFlow - Library Management System

A robust, AI-powered library management system with a simulated RESTful API, implementing complex business rules and state machine resource lifecycles.

## 🚀 Features
- **Book Lifecycle**: Automatic transitions between `AVAILABLE`, `BORROWED`, `RESERVED`, and `MAINTENANCE`.
- **Borrowing Engine**: Enforces a 3-book limit and blocks patrons with unpaid fines.
- **Auto-Suspension**: System automatically suspends members with 3+ overdue items.
- **Fine Calculation**: Automated `$0.50/day` penalty generation on return.
- **AI Integration**: Gemini-powered book summaries and librarian chat support.

## 🛠️ Setup Instructions
1. **Environment**: Ensure a modern browser with ESM support.
2. **API Key**: Gemini features require `process.env.API_KEY` to be configured in your environment.
3. **Execution**: The app runs as a standalone SPA. Navigate to the **API Interface** tab to interact with the backend logic directly via JSON console.

## 📚 API Documentation

### Books Endpoint
- `GET /books`: Returns a list of all book resources.
- `GET /books/available`: Returns only books with `available_copies > 0`.
- `POST /books`: Creates a new book record. 
- `PUT /books/{id}`: Updates existing book metadata.
- `DELETE /books/{id}`: Removes a book from the catalog.

### Members Endpoint
- `GET /members`: Returns all registered patrons.
- `GET /members/{id}/borrowed`: Returns active loan records for a specific member.
- `POST /members`: Registers a new patron.

### Transactions (State Machine)
- `POST /transactions/borrow`: `{ "bookId": "...", "memberId": "..." }`. Transitions a book to `BORROWED` and creates an `ACTIVE` loan.
- `POST /transactions/{id}/return`: Finalizes a loan. Transitions transaction to `RETURNED` and book back to `AVAILABLE`. Calculates fines if `now > due_date`.
- `GET /transactions/overdue`: Lists all loans where `status = overdue`.

### Financials
- `POST /fines/{id}/pay`: Marks a penalty record as settled.

## ⚙️ Business Logic Enforcement
- **Limit**: Members are capped at 3 simultaneous books.
- **Loan Term**: All loans are issued for exactly 14 days from `borrowed_at`.
- **Overdue Penalty**: `$0.50` per day per item, calculated upon return.
- **Suspension Rule**: Background process periodically checks for members with ≥3 overdue books and sets status to `SUSPENDED`.

## 🗄️ State Machine Diagram
- **Book**: `Available` --[Borrow]--> `Borrowed` --[Return]--> `Available`.
- **Transaction**: `Active` --[Clock]--> `Overdue` --[Return]--> `Returned`.
- **Member**: `Active` --[Rule Violation]--> `Suspended` --[Resolve Overdues]--> `Active`.