export type Role = 'admin' | 'librarian';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category_id: string;
  category_name?: string;
  total_copies: number;
  available_copies: number;
  cover_image?: string | null;
  deleted_at?: string | null;
}

export interface Member {
  id: string;
  name: string;
  document_type: string;
  document_number: string;
  email: string;
  phone: string;
  active_loans_count?: number;
  has_overdue?: boolean;
}

export interface LoanItem {
  id: string;
  loan_id: string;
  book_id: string;
  book_title: string;
  isbn: string;
  category_name: string;
  returned_at: string | null;
}

export type LoanStatus = 'open' | 'overdue' | 'closed';

export interface Loan {
  id: string;
  member_id: string;
  member_name?: string;
  member_document?: string;
  user_id: string;
  loaned_at: string;
  due_date: string;
  status: LoanStatus;
  items: LoanItem[];
}

export interface MostBorrowedReportItem {
  book_id: string;
  title: string;
  author: string;
  category_name: string;
  borrow_count: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}
