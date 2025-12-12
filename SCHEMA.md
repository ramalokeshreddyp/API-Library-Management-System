# Database Schema Specification

## Entities & Attributes

### `books`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique resource identifier |
| `isbn` | VARCHAR(13) | Standard book number |
| `title` | VARCHAR(255) | Book title |
| `author` | VARCHAR(255) | Author name |
| `category` | VARCHAR(100) | Genre classification |
| `status` | ENUM | 'available', 'borrowed', 'reserved', 'maintenance' |
| `total_copies` | INTEGER | Physical inventory count |
| `available_copies` | INTEGER | Current shelf count |

### `members`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique member identifier |
| `name` | VARCHAR(255) | Full legal name |
| `email` | VARCHAR(255) | Contact email address |
| `membership_number` | VARCHAR(50) | Unique library card number |
| `status` | ENUM | 'active', 'suspended' |

### `transactions`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Transaction record ID |
| `book_id` | UUID (FK) | Reference to `books.id` |
| `member_id` | UUID (FK) | Reference to `members.id` |
| `borrowed_at` | TIMESTAMP | Issuance timestamp |
| `due_date` | TIMESTAMP | Expected return date |
| `returned_at` | TIMESTAMP | Actual return date (nullable) |
| `status` | ENUM | 'active', 'returned', 'overdue' |

### `fines`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Fine record ID |
| `member_id` | UUID (FK) | Reference to `members.id` |
| `transaction_id` | UUID (FK) | Reference to `transactions.id` |
| `amount` | DECIMAL(10,2) | Penalty amount in USD |
| `paid_at` | TIMESTAMP | Payment completion date (nullable) |

## Relationships
- **One-to-Many**: A `member` can have multiple `transactions`.
- **One-to-Many**: A `book` can have multiple `transactions` (historical).
- **One-to-One**: A `fine` is strictly associated with a specific `transaction`.