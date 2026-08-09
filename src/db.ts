export type Product = {
  id: string;
  user_id: string; // The store ID
  name: string;
  description: string | null;
  price: number;
  wholesale_price?: number;
  is_bundle?: boolean;
  commission_rate?: number;
  discount_value: number;
  discount_type: 'amount' | 'percentage';
  image_url: string | null;
  category: string | null;
  item_number: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
};

export type Sale = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  sale_price: number;
  created_at: string;
};

export type StockChangeLog = {
  id: string;
  user_id: string;
  product_id: string;
  change_amount: number;
  new_quantity: number;
  reason: 'sale' | 'manual_update' | 'restock' | 'return';
  created_at: string;
};

export interface BillItem {
  product_id: string;
  item_number: string | null;
  name: string;
  quantity: number;
  price: number;
}

export interface Bill {
  id?: string;
  uuid: string;
  dateTime: Date;
  items: BillItem[];
  subtotal: number;
  discount: number;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  taxAmount?: number;
  taxRate?: number;
  grandTotal: number;
  isPrinted: boolean;
  createdBy?: string;
  paymentMethod?: string;
  customerId?: string;
  status?: string;
}

export interface ShopSettings {
  id?: string;
  name: string;
  address: string;
  phone: string;
  logoUrl?: string;
  receiptHeader: string;
  receiptFooter: string;
  receiptFontSize: number;
  receiptWidth: number;
  receiptPaperSize: '58mm' | '80mm' | 'A4' | 'custom';
  showStoreName: boolean;
  showStoreDetails: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showInvoiceNumber: boolean;
  showDateTime: boolean;


  taxRate?: number;
  taxName?: string;
}

export interface Customer {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  loyalty_points?: number;
  store_credit?: number;
  total_debt?: number;
}

export interface User {
  id?: string;
  username: string;
  fullName: string;
  displayName?: string;
  email: string;
  role: 'admin' | 'cashier' | 'manager' | 'guest';
}

export async function resetDatabase() {
  localStorage.clear();
  window.location.reload();
}


export interface Expense {
  id?: string;
  description: string;
  amount: number;
  date_time: Date;
  category?: string;
}

export interface CustomerPayment {
  id?: string;
  customer_id: string;
  amount: number;
  date_time: Date;
}


export interface Supplier {
  id?: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}




export interface CashShift {
  id: string;
  opened_by: string;
  closed_by?: string;
  opened_at: string;
  closed_at?: string;
  opening_balance: number;
  closing_balance?: number;
  expected_balance?: number;
  notes?: string;
  status: 'open' | 'closed';
}


export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_purchase: number;
  valid_until?: string;
  is_active: boolean;
}


export interface AttendanceRecord {
  id: string;
  staff_id: string;
  staff_name: string;
  clock_in: string;
  clock_out?: string;
  notes?: string;
}

export interface StockAdjustment {
  id: string;
  product_id: string;
  product_name: string;
  current_product_name?: string;
  change_amount: number;
  reason: string;
  created_at: string;
}


export interface GiftCard {
  id: string;
  code: string;
  balance: number;
  issued_at: string;
  is_active: boolean;
}

export interface Quote {
  id: string;
  uuid: string;
  customer_id?: string;
  date_time: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  tax_amount?: number;
  tax_rate?: number;
  grand_total: number;
  status: 'pending' | 'accepted' | 'rejected' | 'invoiced';
}


export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name?: string;
  order_date: string;
  expected_date?: string;
  items: any[];
  total_amount: number;
  status: 'pending' | 'received' | 'cancelled';
  notes?: string;
}

export interface Return {
  id: string;
  bill_id: string;
  original_bill_uuid?: string;
  return_date: string;
  items: any[];
  refund_amount: number;
  reason: string;
}


export interface Branch {
  id?: string;
  name: string;
  location?: string;
}

export interface ProductVariant {
  id?: string;
  product_id: string;
  name: string;
  sku?: string;
  price?: number;
  stock_quantity: number;
}

export interface ProductBatch {
  id?: string;
  product_id: string;
  batch_number: string;
  expiry_date: Date;
  stock_quantity: number;
}

export interface Promotion {
  id?: string;
  name: string;
  promo_type: string;
  buy_product_id?: string;
  get_product_id?: string;
  discount_percent?: number;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
}

export interface Payroll {
  id?: string;
  staff_id: string;
  period_start: Date;
  period_end: Date;
  hours_worked: number;
  commission_earned: number;
  total_payment: number;
  status: string;
  created_at?: Date;
}
