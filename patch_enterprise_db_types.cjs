const fs = require('fs');
let db = fs.readFileSync('src/db.ts', 'utf-8');

// Update Product
if (!db.includes('wholesale_price?: number')) {
  db = db.replace(/price: number;/, 'price: number;\n  wholesale_price?: number;\n  is_bundle?: boolean;\n  commission_rate?: number;');
}

// Update Customer
if (!db.includes('store_credit?: number')) {
  db = db.replace(/loyalty_points\?: number;/, 'loyalty_points?: number;\n  store_credit?: number;');
}

// Add new interfaces
const newInterfaces = `
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
`;

db = db + "\n" + newInterfaces;
fs.writeFileSync('src/db.ts', db);
console.log("Enterprise DB types patched.");
