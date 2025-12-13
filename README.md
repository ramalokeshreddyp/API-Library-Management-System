## ✅ 📦 How to Install Dependencies & Run LibraFlow

LibraFlow is a **client-side React + Vite application**, so it does **not** run using `npm start`.
It uses **Vite scripts** instead:

```bash
npm run dev
npm run build
npm run preview
```

Below are the **correct setup steps**.

---

### 🔧 1. Install Node.js (if not installed)

Make sure you have **Node.js v18+** installed.

> ✅ You already have **Node.js v22**, which is perfect.

---

### 📥 2. Install Project Dependencies

Open your project folder in the terminal:

```bash
cd "C:\Users\lokes\Downloads\Library Management System API"
```

Then install all dependencies:

```bash
npm install
```

This installs all **React + Vite + frontend dependencies**.

---

### 🚀 3. Start the Development Server

To run the app locally with hot reload:

```bash
npm run dev
```

After running, Vite will display something like:

```
Local:   http://localhost:5173/
Network: http://192.168.x.x:5173/
```

Open the **Local** URL in your browser.

---

### 🌐 4. Build for Production

To generate an optimized production build:

```bash
npm run build
```

---

### 🔍 5. Preview the Production Build

To preview the production build locally:

```bash
npm run preview
```

---

# LibraFlow - Library Management System

A robust, **AI-powered library management system** with a simulated RESTful API, implementing complex business rules and state machine resource lifecycles.

---

## 🚀 Features

* **Book Lifecycle**: Automatic transitions between `AVAILABLE`, `BORROWED`, `RESERVED`, and `MAINTENANCE`.
* **Borrowing Engine**: Enforces a 3-book limit and blocks patrons with unpaid fines.
* **Auto-Suspension**: System automatically suspends members with 3+ overdue items.
* **Fine Calculation**: Automated `$0.50/day` penalty generation on return.
* **AI Integration**: Gemini-powered book summaries and librarian chat support.

---

## 🛠️ Setup Instructions

1. **Environment**: Ensure a modern browser with ESM support.
2. **API Key**: Gemini features require `process.env.API_KEY` to be configured in your environment.
3. **Execution**: The app runs as a standalone SPA. Navigate to the **API Interface** tab to interact with the backend logic directly via JSON console.

---

## 📚 API Documentation

### 📘 Books Endpoint

* `GET /books` → Returns a list of all book resources.
* `GET /books/available` → Returns only books with `available_copies > 0`.
* `POST /books` → Creates a new book record.
* `PUT /books/{id}` → Updates existing book metadata.
* `DELETE /books/{id}` → Removes a book from the catalog.

---

### 👤 Members Endpoint

* `GET /members` → Returns all registered patrons.
* `GET /members/{id}/borrowed` → Returns active loan records for a specific member.
* `POST /members` → Registers a new patron.

---

### 🔄 Transactions (State Machine)

* `POST /transactions/borrow`

  ```json
  { "bookId": "...", "memberId": "..." }
  ```

  Transitions a book to `BORROWED` and creates an `ACTIVE` loan.

* `POST /transactions/{id}/return`
  Finalizes a loan, transitions it to `RETURNED`, and returns the book to `AVAILABLE`. Calculates fines if overdue.

* `GET /transactions/overdue`
  Lists all loans where `status = OVERDUE`.

---

### 💰 Financials

* `POST /fines/{id}/pay` → Marks a penalty record as settled.

---

## ⚙️ Business Logic Enforcement

* **Borrow Limit**: Max 3 active books per member.
* **Loan Term**: Exactly 14 days from `borrowed_at`.
* **Overdue Penalty**: `$0.50/day` per book, calculated upon return.
* **Suspension Rule**: Members with ≥3 overdue books are automatically set to `SUSPENDED`.

---

## 🗄️ State Machine Diagram

* **Book**: `AVAILABLE` → *(Borrow)* → `BORROWED` → *(Return)* → `AVAILABLE`
* **Transaction**: `ACTIVE` → *(Clock)* → `OVERDUE` → *(Return)* → `RETURNED`
* **Member**: `ACTIVE` → *(Rule Violation)* → `SUSPENDED` → *(Resolve Overdues)* → `ACTIVE`
