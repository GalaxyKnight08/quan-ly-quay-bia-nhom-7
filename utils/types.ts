export type UserRole = 'staff' | 'manager' | 'owner';
export type TableStatus = 'empty' | 'occupied' | 'provisional';
export type AdjustmentAction = 'void' | 'discount';
export type PaymentMethod = 'CASH' | 'TRANSFER';

export interface User {
  name: string;
  email: string;
  role: UserRole;
}

export interface Area {
  id: string;
  name: string;
  firstTable: number;
  count: number;
}

export interface MenuItem {
  id: string;
  shortcut: string;
  name: string;
  category: string;
  price: number;
  station: string;
}

export interface OrderLine {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category?: string;
  station?: string;
  adjustment?: boolean;
  reason?: string;
  note?: string;
}

export interface OrderRound {
  id: string;
  sentAt: string;
  staffName: string;
  lines: OrderLine[];
}

export interface DiningTable {
  id: number;
  areaId: string;
  status: TableStatus;
  guestCount: number | null;
  openedAt: string | null;
  total: number;
  rounds: OrderRound[];
  provisionalCount?: number;
}

export interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
}

export interface PaymentDetails {
  subtotal: number;
  discount: number;
  total: number;
  change: number;
  payments: PaymentEntry[];
}

export interface CompletedBill extends PaymentDetails {
  billNo: string;
  tableId: number;
  paidAt: string;
  lines: OrderLine[];
}

export interface PosData {
  areas: Area[];
  tables: DiningTable[];
  completedBills: CompletedBill[];
}
