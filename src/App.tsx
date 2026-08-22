import { useSync } from "./useSync";
import { api } from './api';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import ShopSettingsScreen from './ShopSettingsScreen';
import SuperAdminScreen from './SuperAdminScreen';
import StaffScreen from './StaffScreen';
import SuppliersScreen from './SuppliersScreen';
import CashDrawerScreen from './CashDrawerScreen';
import CouponsScreen from './CouponsScreen';
import ExpensesScreen from './ExpensesScreen';
import AttendanceScreen from './AttendanceScreen';
import StockAdjustmentsScreen from './StockAdjustmentsScreen';
import GiftCardsScreen from './GiftCardsScreen';
import QuotesScreen from './QuotesScreen';
import ReturnsScreen from './ReturnsScreen';
import PurchaseOrdersScreen from './PurchaseOrdersScreen';
import BarcodeScreen from './BarcodeScreen';

import PayrollScreen from './PayrollScreen';
import PromotionsScreen from './PromotionsScreen';
import BranchesScreen from './BranchesScreen';

import VariantsScreen from './VariantsScreen';

import ShiftsScreen from './ShiftsScreen';
import InvoicesScreen from './InvoicesScreen';





import { Award, Mail, CreditCard, Calculator, Tag, Store, ScanBarcode, Utensils, Layers, ChefHat, Armchair, Scale, Monitor, 
  Banknote, Ticket, Wallet, Truck, RotateCcw, PackageOpen, Gift, FileText, LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Settings, Moon, Sun, 
  Plus, 
  Search, 
  Trash2, 
  Minus, 
  Camera, 
  Printer, 
  ChevronRight, ChevronLeft,
  ChevronUp,
  ChevronDown,
  Edit,
  AlertCircle,
  X,
  CheckCircle2,
  ArrowLeft,
  Bluetooth,
  History,
  Percent,
  DollarSign,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Lock,
  Users,
  User as UserIcon,
  LogOut,
  Sparkles,
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  PieChart as PieChartIcon,
  UserCircle2
, PackageMinus, Clock } from 'lucide-react';
import { useZxing } from 'react-zxing';
import { format, startOfDay, endOfDay, subDays, isWithinInterval, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from "./ThemeContext";
import { useTranslation } from "./i18n";
import Fuse from 'fuse.js';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { resetDatabase, type Product, type Bill, type BillItem, type ShopSettings, type User, type Sale, type StockChangeLog, type Customer, type Expense } from './db';
import { cn, formatCurrency } from './lib/utils';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import { googleSignIn, sendGmailReport } from './gmail';

// --- API Utility ---
const API_URL = '/api';



// --- Components ---

const ReceiptView = ({ bill, settings }: { bill: Bill, settings: ShopSettings }) => {
  const widthPx = settings.receiptWidth * 3.78; // Convert mm to approximate px (96dpi)
  
  
  if (window.location.hash === '#cfd') {
    return <CFDScreen />;
  }
  
  return (
    <div 
      id="receipt" 
      className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm font-mono leading-relaxed mx-auto text-slate-900 dark:text-slate-100" 
      style={{ 
        fontSize: `${settings.receiptFontSize}px`,
        width: settings.receiptPaperSize === 'custom' ? `${widthPx}px` : (settings.receiptPaperSize === '58mm' ? '219px' : (settings.receiptPaperSize === '80mm' ? '302px' : '100%')),
        maxWidth: '100%'
      }}
    >
      <div className="text-center space-y-1 mb-6">
        {settings.logoUrl && (
          <img 
            src={settings.logoUrl} 
            alt="Store Logo" 
            className="h-20 mx-auto mb-4 object-contain grayscale"
            referrerPolicy="no-referrer"
          />
        )}
        {settings.showStoreName && <h1 className="text-2xl font-bold tracking-widest uppercase">{settings.name}</h1>}
        {settings.showStoreDetails && (
          <div className="space-y-1 mt-2 text-sm">
            {settings.showAddress && <p className="max-w-[250px] mx-auto">{settings.address}</p>}
            {settings.showPhone && <p>Tel: {settings.phone}</p>}
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-slate-300 dark:border-slate-700 my-4"></div>

      <div className="text-center space-y-2 mb-4">
        {settings.receiptHeader && <p className="text-xs tracking-widest uppercase">{settings.receiptHeader}</p>}
        <div className="text-[10px] uppercase tracking-wider flex justify-center items-center gap-4">
          {settings.showInvoiceNumber && <span>INV: #{bill.uuid.slice(0, 8).toUpperCase()}</span>}
          {settings.showDateTime && <span>{format(bill.dateTime, 'dd MMM yyyy HH:mm')}</span>}
        </div>
      </div>

      <div className="border-t border-dashed border-slate-300 dark:border-slate-700 my-4"></div>

      <div className="space-y-4 mb-4">
        <div className="flex justify-between font-bold border-b border-dashed border-slate-300 dark:border-slate-700 pb-2 uppercase tracking-wider text-xs">
          <span>Description</span>
          <span className="w-20 text-right">Total</span>
        </div>
        {bill.items.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between font-bold text-sm">
              <span className="flex-1 pr-2">{item.name}</span>
              <span className="w-24 text-right">{(item.quantity * item.price).toFixed(2)}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {item.quantity} x {Number(item.price).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-slate-300 dark:border-slate-700 my-4"></div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{Number(bill.subtotal).toFixed(2)}</span>
        </div>
        {bill.discount > 0 && (
          <div className="flex justify-between text-rose-600 dark:text-rose-400">
            <span>Discount</span>
            <span>-{Number(bill.discount).toFixed(2)}</span>
          </div>
        )}
        {(bill as any).pointsRedeemed > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Points Discount ({(bill as any).pointsRedeemed} pts)</span>
            <span>-{Number((bill as any).pointsRedeemed * 0.01).toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-slate-300 dark:border-slate-700 my-4"></div>

      <div className="flex justify-between font-bold text-lg">
        <span className="uppercase tracking-widest">Total</span>
        <span>{formatCurrency(bill.grandTotal)}</span>
      </div>
      
      {bill.paymentMethod && (
        <div className="flex justify-between mt-2 text-xs font-bold text-slate-500 uppercase">
          <span>Payment Method</span>
          <span>{bill.paymentMethod}</span>
        </div>
      )}
      {(bill as any).pointsEarned > 0 && (
        <div className="flex justify-between mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <span>Points Earned</span>
          <span>+{(bill as any).pointsEarned} pts</span>
        </div>
      )}

      <div className="border-t border-dashed border-slate-300 dark:border-slate-700 my-4"></div>

      <div className="text-center mt-6 space-y-4">
        <p className="text-xs tracking-widest uppercase max-w-[200px] mx-auto leading-relaxed">{settings.receiptFooter}</p>
        <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-[9px] text-slate-400 uppercase tracking-widest">Alpha Mobile POS • v2.0</p>
        </div>
      </div>
    </div>
  );
};

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanFullName = fullName.trim();

    if (!cleanEmail || !cleanPassword || (!isLogin && !cleanFullName)) {
      setError('All fields are required');
      return;
    }

    if (!cleanEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const data = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
        localStorage.setItem('token', data.token);
        window.location.reload(); // Refresh to trigger auth check
      } else {
        await api.post('/auth/register', {
          email: cleanEmail,
          password: cleanPassword,
          fullName: cleanFullName,
          role: 'admin'
        });
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err: any) {
      console.error('Auth error detail:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0A0A0A] flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
            <ShoppingCart size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">ALPHA <span className="text-blue-500">POS</span></h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Next-gen retail management</p>
        </div>

        <div className="bg-white dark:bg-slate-900/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex gap-4 mb-10 p-1.5 bg-white dark:bg-slate-900/5 rounded-2xl">
            <button 
              onClick={() => { setIsLogin(true); setError(""); }}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                isLogin ? "bg-white dark:bg-slate-900 text-black dark:text-white shadow-xl" : "text-slate-400 hover:text-slate-800 dark:hover:text-white"
              )}
            >
              Login
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(""); }}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                !isLogin ? "bg-white dark:bg-slate-900 text-black dark:text-white shadow-xl" : "text-slate-400 hover:text-slate-800 dark:hover:text-white"
              )}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-white dark:bg-slate-900/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={18} />
                <input 
                  type="email" 
                  ref={isLogin ? emailRef : undefined}
                  placeholder="admin@example.com"
                  className="w-full bg-white dark:bg-slate-900/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="password"
                  className="w-full bg-white dark:bg-slate-900/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 animate-shake">
                <AlertCircle size={18} />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
            {isLogin && (
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                Don't have an account? <button type="button" onClick={() => { setIsLogin(false); setError(""); }} className="text-blue-500 font-bold hover:underline">Register here</button>
              </p>
            )}
          </form>

          <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
            <div className="flex justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-4">
              <a href="/public/terms" className="hover:text-slate-800 dark:hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
              <span>|</span>
              <a href="/public/privacy" className="hover:text-slate-800 dark:hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              <span>|</span>
              <a href="/public/returns" className="hover:text-slate-800 dark:hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Return Policy</a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick, isMobile = false }: { icon: any, label: string, active: boolean, onClick: () => void, isMobile?: boolean }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg",
      isMobile ? "flex-col gap-1 px-2 py-1" : "w-full",
      active 
        ? "bg-blue-50 text-blue-600" 
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 hover:text-slate-900 dark:text-slate-100 dark:text-slate-100"
    )}
  >
    <Icon size={isMobile ? 18 : 20} />
    <span className={cn(isMobile && "text-[10px]")}>{label}</span>
  </button>
);

const StatsCard = ({ label, value, icon: Icon, colorClass, children }: { label: string, value: string | number, icon: any, colorClass: string, children?: React.ReactNode }) => (
  <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-xl", colorClass)}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100 mt-1">{value}</h3>
      </div>
    </div>
    {children && <div className="mt-4">{children}</div>}
  </div>
);

// --- Screens ---


const CFDScreen = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const handleStorage = (e: any) => {
      if (e.key === 'pos_current_cart') {
        const parsed = JSON.parse(e.newValue || '[]');
        setCart(parsed);
        const t = parsed.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        setTotal(t);
      }
    };
    window.addEventListener('storage', handleStorage);
    // initial load
    const initial = JSON.parse(localStorage.getItem('pos_current_cart') || '[]');
    setCart(initial);
    setTotal(initial.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0));
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-slate-900 text-white p-8">
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-black tracking-tighter text-blue-500">ALPHA POS</h1>
        <h2 className="text-2xl font-bold text-slate-400">Customer Display</h2>
      </div>
      
      <div className="flex-1 flex gap-10 overflow-hidden">
        <div className="flex-1 bg-slate-800 rounded-3xl p-6 overflow-y-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-4 text-xl">Item</th>
                <th className="pb-4 text-xl text-center">Qty</th>
                <th className="pb-4 text-xl text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item: any, i) => (
                <tr key={i} className="border-b border-slate-700/50">
                  <td className="py-6 text-2xl font-bold">{item.product.name}</td>
                  <td className="py-6 text-2xl font-bold text-center">x{item.quantity}</td>
                  <td className="py-6 text-2xl font-black text-blue-400 text-right">\$\{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-slate-500 dark:text-slate-400 text-2xl font-bold">Welcome! Next customer please.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="w-1/3 bg-blue-600 rounded-3xl p-10 flex flex-col justify-center items-center text-center shadow-2xl shadow-blue-900/50">
          <div className="text-blue-200 font-bold text-2xl mb-4 uppercase tracking-widest">Total Amount</div>
          <div className="text-7xl font-black">\$\{total.toFixed(2)}</div>
          
          <div className="mt-16 text-blue-200 text-xl font-medium">
            Scan QR to pay / Earn points
          </div>
          <div className="w-48 h-48 bg-white dark:bg-slate-900 rounded-2xl mt-6 p-2">
             <div className="w-full h-full border-4 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 font-bold">QR CODE</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ bills, products, onNewSale, onPendingPrints }: { bills: Bill[], products: Product[], onNewSale: () => void, onPendingPrints: () => void }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    todayBills: 0,
    monthlyIncome: 0,
    totalProducts: 0,
    lowStock: 0,
    pendingPrints: 0
  });
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<{name: string, uv: number}[]>([]);
  const [topProducts, setTopProducts] = useState<{name: string, sales: number}[]>([]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const todayBillsCount = bills.filter(b => b.dateTime >= today).length;
    const monthlyIncome = bills
      .filter(b => b.dateTime >= monthStart)
      .reduce((sum, b) => sum + b.grandTotal, 0);
    
    const lowStockItems = products.filter(p => p.stock_quantity <= p.low_stock_threshold);
    const pendingPrintsCount = bills.filter(b => !b.isPrinted).length;

    setStats({
      todayBills: todayBillsCount,
      monthlyIncome,
      totalProducts: products.length,
      lowStock: lowStockItems.length,
      pendingPrints: pendingPrintsCount
    });

    setRecentBills(bills.slice(0, 5));
    setLowStockProducts(lowStockItems.slice(0, 5));

    // Weekly trend
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      
      const dayTotal = bills
        .filter(b => b.dateTime >= d && b.dateTime < nextD)
        .reduce((sum, b) => sum + b.grandTotal, 0);
      
      trend.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        uv: dayTotal
      });
    }
    setWeeklyTrend(trend);

    // Top products
    const productSales: Record<string, number> = {};
    bills.forEach(b => {
      b.items.forEach(item => {
        if (!productSales[item.name]) productSales[item.name] = 0;
        productSales[item.name] += item.quantity;
      });
    });
    
    const sortedTop = Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
      
    setTopProducts(sortedTop);
  }, [bills, products]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">{t('dashboard')}</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back to Alpha Mobile POS</p>
        </div>
        <div className="flex gap-3">
          {stats.pendingPrints > 0 && (
            <button 
              onClick={onPendingPrints}
              className="flex items-center gap-2 px-4 py-3 font-semibold text-rose-600 dark:text-rose-400 transition-all bg-rose-50 dark:bg-rose-900/20 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-100"
            >
              <History size={20} />
              {stats.pendingPrints} Pending Prints
            </button>
          )}
          <button 
            onClick={onNewSale}
            className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            <Plus size={20} />
            New Sale
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Today's Bills" value={stats.todayBills} icon={ShoppingCart} colorClass="bg-blue-500" />
        <StatsCard label="Monthly Income" value={formatCurrency(stats.monthlyIncome)} icon={LayoutDashboard} colorClass="bg-emerald-500">
          <div className="h-10 mt-2">
            <LineChart width={120} height={40} data={weeklyTrend}>
              <Line type="monotone" dataKey="uv" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </div>
        </StatsCard>
        <StatsCard label="Total Products" value={stats.totalProducts} icon={Package} colorClass="bg-violet-500" />
        <div className="relative">
          <StatsCard label="Low Stock Items" value={stats.lowStock} icon={AlertCircle} colorClass="bg-rose-500" />
          {stats.lowStock > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-bounce">
              {stats.lowStock}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Recent Transactions</h3>
          <div className="space-y-4">
            {recentBills.length > 0 ? (
              recentBills.map(bill => (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                      <ShoppingCart size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">#{bill.uuid.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{format(bill.dateTime, 'HH:mm')}</p>
                    </div>
                  </div>
                  <p className="font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">{formatCurrency(bill.grandTotal)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">No recent transactions found.</p>
            )}
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Top Selling Products</h3>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((tp, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shadow-sm">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">{tp.name}</p>
                    </div>
                  </div>
                  <p className="font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">{tp.sales} sold</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">No sales data yet.</p>
            )}
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Inventory Status</h3>
           <div className="space-y-4">
             {lowStockProducts.length > 0 ? (
               lowStockProducts.map(product => (
                 <div key={product.id} className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
                       <AlertCircle size={20} />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">{product.name}</p>
                       <p className="text-[10px] text-rose-500 font-bold uppercase">Low Stock</p>
                     </div>
                   </div>
                   <p className="font-black text-rose-600 dark:text-rose-400">{product.stock_quantity} Left</p>
                 </div>
               ))
             ) : (
               <p className="text-sm text-slate-500 dark:text-slate-400 italic">All stock levels are healthy.</p>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};


const CustomerSelect = ({ customers, selectedId, onChange, onAddCustomer }: { customers: Customer[], selectedId: string, onChange: (id: string) => void, onAddCustomer?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    (c.phone && c.phone.includes(query))
  );

  const selectedCustomer = customers.find(c => String(c.id) === String(selectedId));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const saved = await api.post('/customers', { name, phone, email });
      if (onAddCustomer) onAddCustomer();
      onChange(saved.id);
      setShowAdd(false);
      setIsOpen(false);
      setName('');
      setPhone('');
      setEmail('');
    } catch(err: any) {
      console.error(err);
      alert(err.message || 'Failed to add customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-medium flex justify-between items-center cursor-pointer"
      >
        <span>{selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'}</span>
        <ChevronDown size={16} className="text-slate-400" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full mt-2 w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            {!showAdd ? (
              <div className="flex flex-col max-h-[300px]">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search customers..." 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto">
                  <div 
                    onClick={() => { onChange(''); setIsOpen(false); }}
                    className="p-3 border-b border-slate-50 hover:bg-slate-50 dark:bg-slate-800 cursor-pointer font-medium"
                  >
                    Walk-in Customer
                  </div>
                  {filtered.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => { onChange(c.id.toString()); setIsOpen(false); }}
                      className="p-3 border-b border-slate-50 hover:bg-slate-50 dark:bg-slate-800 cursor-pointer flex flex-col"
                    >
                      <span className="font-bold">{c.name}</span>
                      {c.phone && <span className="text-xs text-slate-500 dark:text-slate-400">{c.phone}</span>}
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                      No matching customers
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => setShowAdd(true)}
                    className="w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add New Customer
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdd} className="p-4 flex flex-col gap-3">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-2" onClick={() => setShowAdd(false)}>
                  <ChevronLeft size={16} className="cursor-pointer" /> New Customer
                </h4>
                <input 
                  type="text" 
                  placeholder="Name" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 text-sm"
                />
                <input 
                  type="tel" 
                  placeholder="Phone" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 text-sm"
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 text-sm"
                />
                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold mt-2"
                >
                  {isSubmitting ? 'Saving...' : 'Save Customer'}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Checkout = ({ products, settings, customers, currentUser, onBack, onAddCustomer, onSaleComplete }: { products: Product[], settings: ShopSettings, customers: Customer[], currentUser: User, onBack: () => void, onAddCustomer?: () => void, onSaleComplete?: () => void }) => {
  
  const handleReadScale = async () => {
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      const reader = port.readable.getReader();
      const { value, done } = await reader.read();
      if (value) {
        const decoder = new TextDecoder();
        const weight = decoder.decode(value);
        alert('Weight read from scale: ' + weight + ' kg');
        // You can attach this to the active cart item here
      }
      reader.releaseLock();
      await port.close();
    } catch (err) {
      alert("Error reading scale: " + err);
    }
  };

  
  const testUsbPrinter = async () => {
    try {
      // ESC/POS Commands: Initialize, Cash Drawer, text, cut
      const ESC = "\x1B";
      const GS = "\x1D";
      const init = ESC + "@";
      const openDrawer = ESC + "p" + "\x00" + "\x32" + "\xFA"; // pulse pin 2
      const cutPaper = GS + "V" + "\x41" + "\x00";

      let receiptText = init + "    --- ALPHA POS ---\n\n";
      cart.forEach(item => {
        receiptText += `${item.product.name} x${item.quantity}   ${(item.price * item.quantity).toFixed(2)}\n`;
      });
      receiptText += `\nTOTAL: ${grandTotal.toFixed(2)}\n\n`;
      receiptText += cutPaper + openDrawer;

      alert("Simulated WebUSB ESC/POS command sent to printer:\n\n" + receiptText);
      
      // Real implementation would look like:
      // const device = await (navigator as any).usb.requestDevice({ filters: [{ vendorId: 0x04b8 }] }); // e.g., Epson
      // await device.open();
      // await device.selectConfiguration(1);
      // await device.claimInterface(0);
      // const encoder = new TextEncoder();
      // await device.transferOut(1, encoder.encode(receiptText));
      // await device.close();

    } catch (err: any) {
      alert("Print failed: " + err.message);
    }
  };

  const verifyManagerPin = async (actionDesc: string) => {
    const pin = prompt(`Manager PIN required for: ${actionDesc}`);
    if (!pin) return false;
    try {
      const res = await api.post('/verify-pin', { pin });
      if (res.success) {
        alert(`Manager ${res.manager.full_name || 'Approved'}`);
        return true;
      }
      alert('Invalid Manager PIN');
      return false;
    } catch(e) { return false; }
  };

  const [cart, setCart] = useState<BillItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastBill, setLastBill] = useState<Bill | null>(null);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState(0);
  
  const handleDiscountChange = (val: number, type: 'percent'|'fixed') => {
    if (currentUser?.role === 'cashier') {
      if (type === 'percent' && val > 10) {
         alert('Cashiers cannot give more than 10% discount.');
         setDiscountValue(10);
         return;
      }
    }
    setDiscountValue(val);
  };


  const [usePoints, setUsePoints] = useState(false);
  const [pointsRedeemed, setPointsRedeemed] = useState(0);

  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    try {
      const coupon = await api.post('/coupons/validate', { code: couponCode });
      if (subtotal < coupon.min_purchase) {
        alert(`Minimum purchase of ${coupon.min_purchase} required for this coupon.`);
        return;
      }
      setDiscountType(coupon.discount_type);
      setDiscountValue(coupon.discount_value);
      alert('Coupon applied successfully!');
      setCouponCode('');
    } catch (err: any) {
      alert(err.message || 'Invalid coupon code');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  
  // Custom Item State
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [heldCarts, setHeldCarts] = useState<{ id: string, items: BillItem[], time: Date }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('held_carts');
    if (saved) setHeldCarts(JSON.parse(saved).map((c: any) => ({ ...c, time: new Date(c.time) })));
  }, []);

  const holdCart = () => {
    if (cart.length === 0) return;
    const newHeld = [...heldCarts, { id: crypto.randomUUID(), items: cart, time: new Date() }];
    setHeldCarts(newHeld);
    localStorage.setItem('held_carts', JSON.stringify(newHeld));
    setCart([]);
    setDiscountValue(0);
    setSelectedCustomerId('');
  };

  const resumeCart = (held: any) => {
    setCart(held.items);
    const newHeld = heldCarts.filter(c => c.id !== held.id);
    setHeldCarts(newHeld);
    localStorage.setItem('held_carts', JSON.stringify(newHeld));
  };

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or F1 to focus search
      if (((e.ctrlKey || e.metaKey) && e.key === 's') || e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Ctrl+Enter to confirm
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (cart.length > 0) {
          handleConfirm();
        }
      }
      // Esc to clear or back
      if (e.key === 'Escape') {
        if (searchQuery) {
          setSearchQuery('');
        } else {
          onBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart.length, searchQuery, onBack]);

  useEffect(() => {
    // Check simulated printer connection
    const connected = localStorage.getItem('printer_connected') === 'true';
    setIsPrinterConnected(connected);
  }, []);

  useEffect(() => {
    const performSearch = () => {
      if (searchQuery.length < 1) {
        setSearchResults([]);
        return;
      }
      
      // Direct barcode match first
      const exactMatch = products.find(p => p.item_number === searchQuery);
      if (exactMatch) {
        setSearchResults([exactMatch, ...products.filter(p => p.item_number !== searchQuery && (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.item_number && p.item_number.includes(searchQuery))))].slice(0, 10));
        return;
      }

      const fuse = new Fuse(products, {
        keys: ['name', 'item_number'],
        threshold: 0.3
      });
      const results = fuse.search(searchQuery).map(r => r.item);
      setSearchResults(results.slice(0, 10));
    };
    performSearch();
  }, [searchQuery, products]);

  const { ref } = useZxing({
    onDecodeResult(result) {
      handleScan(result.getText());
    },
    paused: !isScanning
  });

  const handleScan = (barcode: string) => {
    const product = products.find(p => p.item_number === barcode);
    if (product) {
      addToCart(product);
      setIsScanning(false);
    } else {
      setScannedBarcode(barcode);
      setShowManualAdd(true);
      setIsScanning(false);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, {
        product_id: product.id,
        item_number: product.item_number,
        name: product.name,
        quantity: 1,
        price: product.price
      }];
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const addCustomItem = () => {
    if (!customItemName || !customItemPrice) return;
    const price = parseFloat(customItemPrice);
    if (isNaN(price)) return;

    const customId = `CUSTOM-${Date.now()}`;
    setCart(prev => [...prev, {
      product_id: customId,
      item_number: customId,
      name: customItemName,
      quantity: 1,
      price
    }]);
    setCustomItemName('');
    setCustomItemPrice('');
  };

  const updateQuantity = (product_id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === product_id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (product_id: string) => {
    setCart(prev => prev.filter(item => item.product_id !== product_id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = discountType === 'percent' 
    ? (subtotal * discountValue) / 100 
    : discountValue;
  
  
  const taxAmount = (subtotal - discountAmount) * (settings.taxRate || 0) / 100;
  let baseGrandTotal = Math.max(0, subtotal - discountAmount + taxAmount);
  
  const selectedCustomerObj = customers.find(c => String(c.id) === String(selectedCustomerId));
  const availablePoints = selectedCustomerObj ? (selectedCustomerObj.loyalty_points || 0) : 0;
  
  // 1 point = 0.01 currency
  const pointValue = settings?.valuePerPoint || 0.01;
  const maxPointsToUse = Math.min(availablePoints, Math.floor(baseGrandTotal / pointValue));
  
  const pointsDiscount = usePoints ? maxPointsToUse * pointValue : 0;
  const grandTotal = Math.max(0, baseGrandTotal - pointsDiscount);
  const pointsEarned = settings?.enableLoyalty && settings?.amountPerPoint && settings.amountPerPoint > 0 ? Math.floor(grandTotal / settings.amountPerPoint) : 0;


  
  const handleSaveQuote = async () => {
    if (cart.length === 0) return;
    
    try {
      const quoteData = {
        uuid: 'QT-' + Date.now().toString().slice(-6),
        customerId: selectedCustomerId,
        items: cart,
        subtotal: subtotal,
        discount: discountAmount,
        discountType: discountType,
        discountValue: discountValue,
        taxAmount: taxAmount,
        taxRate: settings?.taxRate || 0,
        grandTotal: grandTotal
      };
      await api.post('/quotes', quoteData);
      setCart([]);
      setDiscountValue(0);
      setSelectedCustomerId('');
      alert("Quote saved successfully!");
    } catch(err: any) {
      alert("Failed to save quote: " + err.message);
    } finally {
      
    }
  };


  const handleConfirm = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'credit' && !selectedCustomerId) {
      alert('You must select a customer for store credit (Layaways).');
      return;
    }

    try {
      const savedBillData = {
        uuid: crypto.randomUUID(),
        dateTime: new Date(),
        items: [...cart],
        
        subtotal,
        discount: discountAmount,
        discountType,
        discountValue,
        
        
        taxAmount,
        taxRate: settings.taxRate || 0,
        grandTotal,
        isPrinted: false, // User can print in the next step
        createdBy: currentUser.id,
        customerId: selectedCustomerId || undefined,
        paymentMethod,
        status: paymentMethod === 'credit' ? 'unpaid' : 'paid',
        pointsRedeemed: usePoints ? maxPointsToUse : 0,
        pointsEarned: pointsEarned
      };

      const savedBill = await api.post('/bills', savedBillData);
      setLastBill({...savedBill, dateTime: new Date(savedBill.dateTime)});
      
      const customer = customers.find(c => String(c.id) === String(selectedCustomerId));
      if (customer && customer.phone) {
        const phoneStr = customer.phone.replace(/\D/g, '');
        if (phoneStr) {
          const billUrl = `${window.location.origin}/public/bill/${savedBill.uuid}`;
          const text = `Greetings from ${settings.name || 'Our Shop'}\nWe are pleased to have you as a valuable customer. Please find the details of your transaction.\n\nSale Invoice : ${savedBill.uuid}\nInvoice Amount: ${formatCurrency(savedBill.grandTotal)}\nBalance: 0.00\n\nThanks for doing business with us.\nRegards,\n${settings.name || 'Our Shop'}\n\nInvoice Link:\n${billUrl}`;
          const waUrl = `https://wa.me/${phoneStr}?text=${encodeURIComponent(text)}`;
          setTimeout(() => {
            window.open(waUrl, '_blank');
          }, 300);
        }
      }

      setCart([]);
      setShowReceipt(true);
      if (typeof onSaleComplete !== 'undefined' && onSaleComplete) onSaleComplete();
    } catch (err: any) {
      console.error('Checkout save error:', err);
      alert(`Error saving sale: ${err.message || 'Unknown error'}`);
    }
  };

  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');

  const handleManualAddProduct = async () => {
    if (!manualName) return;
    const price_val = manualPrice ? parseFloat(manualPrice) : 0;
    const item_number = scannedBarcode || `BC-${Date.now()}`;

    const newProd = {
      user_id: currentUser.id,
      item_number,
      name: manualName,
      price: isNaN(price_val) ? 0 : price_val,
      category: 'General',
      stock_quantity: 100,
      low_stock_threshold: 5,
      image_url: null,
      description: null,
      discount_value: 0,
      discount_type: 'amount'
    };
    try {
      const savedProd = await api.post('/products', newProd);
      addToCart(savedProd as Product);
      setShowManualAdd(false);
      setScannedBarcode('');
      setManualName('');
      setManualPrice('');
    } catch (err: any) {
      console.error('Manual product add error:', err);
      alert(`Error: ${err.message || 'Unknown error'}`);
    }
  };

  if (showReceipt && lastBill && settings) {
    let phoneStr = '';
    if (selectedCustomerId) {
      const customer = customers.find(c => String(c.id) === String(selectedCustomerId));
      if (customer && customer.phone) {
        phoneStr = customer.phone.replace(/[^0-9]/g, '');
        if (phoneStr.startsWith('0') && phoneStr.length === 10) {
          phoneStr = '94' + phoneStr.substring(1);
        }
      }
    }
    
    const billUrl = `${window.location.origin}/public/bill/${lastBill.uuid}`;
    const text = `Greetings from ${settings.name || 'Our Shop'}\nWe are pleased to have you as a valuable customer. Please find the details of your transaction.\n\nSale Invoice : ${lastBill.uuid}\nInvoice Amount: ${formatCurrency(lastBill.grandTotal)}\nBalance: 0.00\n\nThanks for doing business with us.\nRegards,\n${settings.name || 'Our Shop'}\n\nInvoice Link:\n${billUrl}`;
    const waUrl = `https://wa.me/${phoneStr}?text=${encodeURIComponent(text)}`;

    const handleShareWhatsApp = async (e: React.MouseEvent) => {
      e.preventDefault();
      try {
        const element = document.getElementById('receipt');
        if (element) {
          const canvas = await html2canvas(element, { 
            scale: Math.max(2, window.devicePixelRatio || 2), // Better quality for high DPI screens
            useCORS: true, 
            backgroundColor: '#ffffff', // Ensure solid background for JPG
            logging: false
          });
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], `bill-${lastBill.uuid}.jpg`, { type: 'image/jpeg' });
              
              let shared = false;
              if (navigator.share) {
                try {
                  await navigator.share({
                    text: text,
                    files: [file]
                  });
                  shared = true; // Successfully shared using OS share sheet
                } catch (shareErr: any) {
                   console.log('Share canceled or failed', shareErr);
                   // If user cancelled (AbortError), we should probably not fallback
                   if (shareErr.name === 'AbortError') {
                       return;
                   }
                }
              }
              
              if (!shared) {
                // Fallback: Download JPG and open specific WhatsApp chat
                try {
                   const url = window.URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.style.display = 'none';
                   a.href = url;
                   a.download = `bill-${lastBill.uuid}.jpg`;
                   document.body.appendChild(a);
                   a.click();
                   window.URL.revokeObjectURL(url);
                   a.remove();
                } catch (e) {}
                
                setTimeout(() => {
                  window.open(waUrl, '_blank');
                }, 300);
              }
            } else {
               window.open(waUrl, '_blank');
            }
          }, 'image/jpeg', 0.92); // Optimize file size while maintaining quality
        } else {
           window.open(waUrl, '_blank');
        }
      } catch (err) {
        console.error('Error sharing:', err);
        window.open(waUrl, '_blank');
      }
    };

    const handlePrint = async () => {
      window.print();
      try {
        await api.patch(`/bills/${lastBill.uuid}`, { isPrinted: true });
      } catch (err) {
        console.error('Failed to mark as printed', err);
      }
    };

    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
             Sale Successful!
          </h2>
        </div>

        <ReceiptView bill={lastBill} settings={settings} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <button onClick={handlePrint} className="py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 flex flex-col items-center gap-1 transition-colors">
            <Printer size={24} />
            <span>Print Bill</span>
          </button>
          
          <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={handleShareWhatsApp} className="py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#128C7E] flex flex-col items-center gap-1 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>WhatsApp</span>
          </a>
          
          <a href={`sms:${phoneStr}?body=${encodeURIComponent(text)}`} className="py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 flex flex-col items-center gap-1 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>Send SMS</span>
          </a>

          <button onClick={async () => {
             const email = prompt("Enter customer email address:");
             if(email) {
               try {
                 await api.post(`/bills/${lastBill.uuid}/send-receipt`, { email });
                 alert('Receipt sent via Email!');
               } catch(e) { alert('Failed to send receipt.'); }
             }
          }} className="py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 flex flex-col items-center gap-1 transition-colors">
            <Mail size={24} />
            <span>Email Receipt</span>
          </button>
          <button onClick={async () => {
             try {
               const res = await api.post(`/bills/${lastBill.uuid}/create-payment-link`, {});
               if(res.url) {
                 window.open(res.url, '_blank');
               }
             } catch(e) { alert('Failed to create payment link.'); }
          }} className="py-3 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-700 flex flex-col items-center gap-1 transition-colors">
            <CreditCard size={24} />
            <span>Pay via PayHere</span>
          </button>

          
        
        <button onClick={() => window.open(window.location.origin + '/#cfd', '_blank', 'width=800,height=600')} className="mr-4 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-2 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-xl transition-colors">
          <Monitor size={18} /> Open CFD
        </button>
        <button onClick={handleReadScale}
   className="mr-4 text-slate-500 dark:text-slate-400 hover:text-blue-500 flex items-center gap-2 font-bold text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl transition-colors">
          <Scale size={18} /> Read Scale
        </button>
        <button onClick={onBack}
  
            className="col-span-2 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">New Sale</h2>
        </div>

        <div className="flex gap-4 relative">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              ref={searchInputRef}
              placeholder="Search product by name or barcode..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchResults.length > 0) {
                  addToCart(searchResults[0]);
                  setSearchQuery('');
                }
              }}
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                {searchResults.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">{p.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{p.item_number}</div>
                    </div>
                    <div className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(p.price)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsScanning(!isScanning)}
            className={cn(
              "p-3 rounded-xl transition-colors",
              isScanning ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
            )}
          >
            <Camera size={24} />
          </button>
        </div>

        {/* Custom Item Input */}
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Custom Item Name</label>
            <input 
              type="text"
              placeholder="e.g. Service Charge"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={customItemName}
              onChange={(e) => setCustomItemName(e.target.value)}
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Price</label>
            <input 
              type="number"
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={customItemPrice}
              onChange={(e) => setCustomItemPrice(e.target.value)}
            />
          </div>
          <button 
            onClick={addCustomItem}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {isScanning && (
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-4 border-blue-500">
            <video ref={ref} className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-white/30 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-32 border-2 border-blue-400 rounded-lg animate-pulse" />
            </div>
            <button 
              onClick={() => setIsScanning(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Product Quick Select */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                  selectedCategory === cat 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                    : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredProducts.slice(0, 12).map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all text-left group"
              >
                <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-xl mb-2 overflow-hidden flex items-center justify-center">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="text-slate-300 group-hover:text-blue-400 transition-colors" size={24} />
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100 truncate">{p.name}</h4>
                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(p.price)}</p>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-8 text-center text-slate-400 text-sm italic">
                No products found in this category.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg sticky top-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100 mb-6">Order Summary</h3>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-300 items-center">
                <span>Discount</span>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 rounded-lg p-1">
                  <button 
                    onClick={() => setDiscountType('percent')}
                    className={cn("p-1 rounded", discountType === 'percent' ? "bg-white dark:bg-slate-900 shadow-sm text-blue-600" : "text-slate-400")}
                  >
                    <Percent size={14} />
                  </button>
                  <button 
                    onClick={() => setDiscountType('fixed')}
                    className={cn("p-1 rounded", discountType === 'fixed' ? "bg-white dark:bg-slate-900 shadow-sm text-blue-600" : "text-slate-400")}
                  >
                    <DollarSign size={14} />
                  </button>
                  <input 
                    type="number"
                    className="w-16 bg-transparent text-right font-bold text-sm outline-none"
                    value={discountValue}
                    onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0, discountType)}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Amount Saved</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>

                <div className="flex gap-2 items-center mt-2">
                  <input 
                    type="text" 
                    placeholder="Coupon code" 
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none uppercase font-mono"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode}
                    className="bg-slate-800 dark:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>

            </div>

            {settings.taxRate ? (
              <div className="flex justify-between text-slate-600 dark:text-slate-300 items-center">
                <span>{settings.taxName || 'Tax'} ({settings.taxRate}%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            ) : null}

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-end">
              <span className="text-slate-900 dark:text-slate-100 dark:text-slate-100 font-bold">Grand Total</span>
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(grandTotal)}</span>
            </div>
            
            {pointsEarned > 0 && (
              <div className="flex justify-between items-center text-sm font-bold text-emerald-600 dark:text-emerald-400 pt-2">
                <span>Loyalty Points Earned</span>
                <span>+{pointsEarned} Points</span>
              </div>
            )}

          </div>

          <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Customer</label>
              <CustomerSelect 
                customers={customers} 
                selectedId={selectedCustomerId} 
                onChange={setSelectedCustomerId} 
                onAddCustomer={onAddCustomer}
              />
            </div>

            {selectedCustomerId && (() => {
              const cust = customers.find(c => String(c.id) === String(selectedCustomerId));
              if (cust && cust.loyalty_points && cust.loyalty_points > 0) {
                return (
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <div>
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Available: {cust.loyalty_points} Points (Valued at {(cust.loyalty_points * (settings?.valuePerPoint || 0.01)).toFixed(2)})</p>
                      <p className="text-xs text-blue-600/70 dark:text-blue-400/70">1 point = {formatCurrency(settings?.valuePerPoint || 0.01)}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={usePoints} onChange={e => setUsePoints(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                );
              }
              return null;
            })()}

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Payment</label>
              <div className="flex gap-2">
                {(['cash', 'card', 'mobile', 'credit'] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method as any)}
                    className={cn(
                      "flex-1 py-2 font-bold rounded-xl text-sm capitalize transition-colors",
                      paymentMethod === method 
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-800"
                    )}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              disabled={cart.length === 0}
              onClick={handleConfirm}
              className="col-span-2 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Confirm Sale
            </button>
            <button 
              disabled={cart.length === 0}
              onClick={holdCart}
              className="col-span-2 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <History size={18} />
              Hold Bill
            </button>
          </div>

          {heldCarts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Held Bills ({heldCarts.length})</h4>
              <div className="space-y-2">
                {heldCarts.map(held => (
                  <div key={held.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">{held.items.length} items</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{format(held.time, 'HH:mm')}</p>
                    </div>
                    <button 
                      onClick={() => resumeCart(held)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold rounded-lg text-xs hover:bg-blue-50 dark:bg-blue-900/20 transition-colors"
                    >
                      Resume
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Cart Items below Order Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Cart Items</h3>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
              {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
            {cart.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium">Your cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} className="p-4 space-y-3 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100 truncate">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.item_number || item.product_id}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id)} className="p-1 text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {settings?.scale_integration && (
                        <button 
                          onClick={() => {
                            const weight = parseFloat((Math.random() * 5).toFixed(2));
                            setCart(prev => prev.map(c => c.product_id === item.product_id ? { ...c, quantity: weight } : c));
                          }} 
                          className="text-xs bg-indigo-100 text-indigo-700 dark:text-indigo-400 px-2 py-2 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-300"
                          title="Read from scale"
                        >
                          ⚖️ Scale
                        </button>
                      )}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-inner">
                      <button 
                        onClick={() => updateQuantity(item.product_id, -1)} 
                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg shadow-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:text-blue-400 transition-all active:scale-95"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-black text-sm text-slate-900 dark:text-slate-100 dark:text-slate-100">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product_id, 1)} 
                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg shadow-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:text-blue-400 transition-all active:scale-95"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{formatCurrency(item.price)} each</p>
                      <p className="font-black text-blue-600 dark:text-blue-400">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Running Total</span>
              <span className="font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">{formatCurrency(subtotal)}</span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showManualAdd && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Product Not Found</h3>
                <button onClick={() => setShowManualAdd(false)} className="p-2 hover:bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Barcode <span className="font-mono font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">{scannedBarcode}</span> was not found in your inventory. Would you like to add it now?</p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter product name"
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selling Price</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                    value={manualPrice}
                    onChange={e => setManualPrice(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowManualAdd(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleManualAddProduct}
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    Add & Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Products = ({ products }: { products: Product[] }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product, direction: 'asc' | 'desc' } | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    item_number: '',
    name: '',
    category: 'General',
    price: 0,
    discount_value: 0,
    stock_quantity: 0,
    low_stock_threshold: 5,
    discount_type: 'amount'
  });

  useEffect(() => {
    let result = [...products];

    if (searchQuery.length >= 1) {
      const fuse = new Fuse(products, {
        keys: ['name', 'item_number'],
        threshold: 0.4
      });
      result = fuse.search(searchQuery).map(r => r.item);
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredProducts(result);
  }, [searchQuery, products, sortConfig]);

  const handleSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSave = async () => {
    if (!newProduct.name) {
      alert("Product Name is required");
      return;
    }
    
    try {
      const finalProduct = {
        item_number: newProduct.item_number || `BC-${Date.now()}`,
        name: newProduct.name,
        category: newProduct.category || 'General',
        price: Number(newProduct.price) || 0,
        stock_quantity: Number(newProduct.stock_quantity) || 0,
        low_stock_threshold: Number(newProduct.low_stock_threshold) || 5,
        image_url: newProduct.image_url || '',
        discount_value: Number(newProduct.discount_value) || 0,
        discount_type: newProduct.discount_type || 'amount'
      };

      if (isEditing && newProduct.id) {
        await api.put(`/products/${newProduct.id}`, finalProduct);
      } else {
        await api.post('/products', finalProduct);
      }

      setIsAdding(false);
      setIsEditing(false);
      setNewProduct({
        item_number: '',
        name: '',
        category: 'General',
        price: 0,
        stock_quantity: 0,
        low_stock_threshold: 5
      });
    } catch (err: any) {
      console.error('Product save error:', err);
      alert(`Error saving product: ${err.message || 'Unknown error'}`);
    }
  };

  const handleEdit = (product: Product) => {
    setNewProduct(product);
    setIsEditing(true);
    setIsAdding(true);
    setSelectedProduct(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Inventory</h1>
        <button 
          onClick={() => {
            setIsEditing(false);
            setNewProduct({
              item_number: '',
              name: '',
              category: 'General',
              price: 0,
              stock_quantity: 0,
              low_stock_threshold: 5
            });
            setIsAdding(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:text-blue-600 dark:text-blue-400 transition-colors" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  Product
                  {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th className="px-6 py-4 font-semibold">Barcode/Item #</th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:text-blue-600 dark:text-blue-400 transition-colors" onClick={() => handleSort('price')}>
                <div className="flex items-center gap-1">
                  Price
                  {sortConfig?.key === 'price' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:text-blue-600 dark:text-blue-400 transition-colors" onClick={() => handleSort('stock_quantity')}>
                <div className="flex items-center gap-1">
                  Stock
                  {sortConfig?.key === 'stock_quantity' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th className="px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 dark:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => setSelectedProduct(product)}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-slate-300" size={20} />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 dark:text-slate-100">{product.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{product.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-mono">{product.item_number}</td>
                <td className="px-6 py-4 text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(product.price)}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold",
                    product.stock_quantity <= product.low_stock_threshold 
                      ? "bg-rose-100 text-rose-600" 
                      : "bg-emerald-100 text-emerald-600"
                  )}>
                    {product.stock_quantity} in stock
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(product);
                    }} className="text-slate-400 hover:text-blue-600 dark:text-blue-400 p-2">
                      <Edit size={18} />
                    </button>
                    <button onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this product?')) {
                        try {
                          await api.delete(`/products/${product.id}`);
                        } catch (err) {
                          console.error('Product delete error:', err);
                        }
                      }
                    }} className="text-slate-400 hover:text-rose-500 p-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group">
                    {newProduct.imagePath ? (
                      <img src={newProduct.imagePath} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-300" size={32} />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera size={20} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Product Image</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Optional. Upload a clear photo of the item.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter product name"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Number/Barcode (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="Auto-generated if empty"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newProduct.item_number || ''}
                      onChange={e => setNewProduct({...newProduct, item_number: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="General"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newProduct.category || ''}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (Optional)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newProduct.price || ''}
                      onChange={e => setNewProduct({...newProduct, price: e.target.value ? parseFloat(e.target.value) : 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount Amount (Optional)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newProduct.discount_value || ''}
                      onChange={e => setNewProduct({...newProduct, discount_value: e.target.value ? parseFloat(e.target.value) : 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock Quantity (Optional)</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newProduct.stock_quantity || ''}
                      onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value ? parseInt(e.target.value) : 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Low Stock Alert (Optional)</label>
                    <input 
                      type="number" 
                      placeholder="5"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newProduct.low_stock_threshold || ''}
                      onChange={e => setNewProduct({...newProduct, low_stock_threshold: e.target.value ? parseInt(e.target.value) : 5})}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleSave}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors mt-6"
                >
                  {isEditing ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800">
                {selectedProduct.imagePath ? (
                  <img src={selectedProduct.imagePath} alt={selectedProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="text-slate-300" size={48} />
                  </div>
                )}
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-900/20 backdrop-blur-md text-white rounded-full hover:bg-white dark:bg-slate-900/40 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 tracking-tight">{selectedProduct.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">{selectedProduct.category}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</p>
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(selectedProduct.sellingPrice)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock</p>
                    <p className="text-xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">{selectedProduct.stockQuantity}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Barcode/Item #</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">{selectedProduct.item_number}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Selling Price</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">{formatCurrency(selectedProduct.price)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Low Stock Alert</span>
                    <span className="font-bold text-rose-500">{selectedProduct.lowStockThreshold} units</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleEdit(selectedProduct)}
                    className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit size={20} />
                    Edit Product
                  </button>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PrinterSetup = ({ onBack }: { onBack: () => void }) => {
  const [devices, setDevices] = useState<{ name: string, address: string, connected: boolean }[]>([
    { name: 'Alpha Thermal P1', address: '00:11:22:33:44:55', connected: false },
    { name: 'Alpha Thermal P2', address: 'AA:BB:CC:DD:EE:FF', connected: false },
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(localStorage.getItem('printer_name'));

  const handleConnect = (name: string) => {
    setConnectedDevice(name);
    localStorage.setItem('printer_connected', 'true');
    localStorage.setItem('printer_name', name);
    alert(`Connected to ${name}`);
  };

  const handleDisconnect = () => {
    setConnectedDevice(null);
    localStorage.setItem('printer_connected', 'false');
    localStorage.removeItem('printer_name');
  };

  const handleTestPrint = () => {
    if (!connectedDevice) {
      alert('Please connect a printer first.');
      return;
    }
    alert(`Test receipt sent to ${connectedDevice}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Printer Setup</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage Bluetooth thermal printers</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-8 space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-full", connectedDevice ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 dark:bg-slate-700 text-slate-400")}>
              <Bluetooth size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Connection Status</p>
              <p className={cn("text-lg font-bold", connectedDevice ? "text-emerald-600" : "text-slate-400")}>
                {connectedDevice ? `Connected to ${connectedDevice}` : 'Disconnected'}
              </p>
            </div>
          </div>
          {connectedDevice && (
            <button onClick={handleDisconnect} className="text-rose-600 dark:text-rose-400 font-bold text-sm hover:underline">Disconnect</button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Available Devices</h3>
            <button 
              onClick={() => {
                setIsScanning(true);
                setTimeout(() => setIsScanning(false), 2000);
              }}
              className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-2"
            >
              <RefreshCw size={14} className={cn(isScanning && "animate-spin")} />
              Scan for Devices
            </button>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            {devices.map(device => (
              <div key={device.address} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Printer size={20} className="text-slate-400" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">{device.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{device.address}</p>
                  </div>
                </div>
                <button 
                  disabled={connectedDevice === device.name}
                  onClick={() => handleConnect(device.name)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-bold text-sm transition-all",
                    connectedDevice === device.name 
                      ? "bg-emerald-100 text-emerald-600 cursor-default" 
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  {connectedDevice === device.name ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleTestPrint}
          className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold rounded-xl hover:border-blue-400 hover:text-blue-600 dark:text-blue-400 transition-all flex items-center justify-center gap-2"
        >
          <Printer size={20} />
          Print Test Receipt
        </button>
      </div>
    </div>
  );
};

const PendingPrints = ({ bills, settings, onBack, onSaleComplete }: { bills: Bill[], settings: ShopSettings | null, onBack: () => void, onSaleComplete?: () => void }) => {
  const pendingBills = bills.filter(b => !b.isPrinted);

  const handlePrint = async (bill: Bill) => {
    const connected = localStorage.getItem('printer_connected') === 'true';
    if (!connected) {
      alert('Printer not connected. Please go to Printer Setup.');
      return;
    }
    try {
      await api.patch(`/bills/${bill.uuid}`, { isPrinted: true });
      alert(`Receipt for ${bill.uuid.slice(0, 8)} printed successfully!`);
      if (typeof onSaleComplete !== 'undefined' && onSaleComplete) onSaleComplete();
    } catch (err) {
      console.error('Print update error:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Pending Prints</h1>
          <p className="text-slate-500 dark:text-slate-400">Bills saved for later printing</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {pendingBills.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
            <p>No pending prints found.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Invoice</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingBills.map(bill => (
                <tr key={bill.id} className="hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">{bill.uuid.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{format(bill.dateTime, 'MMM dd, HH:mm')}</td>
                  <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{formatCurrency(bill.grandTotal)}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handlePrint(bill)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Printer size={16} />
                      Print Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const Transactions = ({ bills, settings, customers, onRefresh, currentUser }: { bills: Bill[], settings: ShopSettings, customers: Customer[], onRefresh: () => void, currentUser: any }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [filteredBills, setFilteredBills] = useState<Bill[]>(bills);
  const [isRefunding, setIsRefunding] = useState(false);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredBills(bills);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = bills.filter(b => 
      b.uuid.toLowerCase().includes(query) || 
      b.grandTotal.toString().includes(query)
    );
    setFilteredBills(filtered);
  }, [searchQuery, bills]);

  const handleRefund = async (uuid: string) => {
    if (currentUser?.role === 'cashier') return alert('You do not have permission to refund bills. Please ask a manager.');
    if (!window.confirm('Are you sure you want to refund this bill? Items will be returned to stock.')) return;
    setIsRefunding(true);
    try {
      await api.post(`/bills/${uuid}/refund`, {});
      onRefresh();
      setSelectedBill(null);
    } catch (err) {
      alert('Failed to process refund');
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Transaction History</h1>
          <p className="text-slate-500 dark:text-slate-400">View and reprint past receipts</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Search by Invoice # or Amount..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Invoice</th>
              <th className="px-6 py-4 font-semibold hidden md:table-cell">Customer</th>
              <th className="px-6 py-4 font-semibold">Date & Time</th>
              <th className="px-6 py-4 font-semibold hidden sm:table-cell">Items</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredBills.map(bill => (
              <tr key={bill.id} className="hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">
                  #{bill.uuid.slice(0, 8).toUpperCase()}
                  {bill.status === 'refunded' && (
                    <span className="ml-2 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] uppercase font-black rounded-full">Refunded</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
                  {bill.customerId ? customers.find(c => c.id === bill.customerId)?.name || 'Unknown' : 'Walk-in'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{format(bill.dateTime, 'MMM dd, yyyy HH:mm')}</td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">{bill.items.length} items</td>
                <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{formatCurrency(bill.grandTotal)}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedBill(bill)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-200 dark:bg-slate-700 transition-colors"
                  >
                    <Eye size={16} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBills.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <p>No transactions found.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedBill && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg my-8"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Receipt Details</h3>
                <button onClick={() => setSelectedBill(null)} className="p-2 hover:bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <ReceiptView bill={selectedBill} settings={settings} />
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                {selectedBill.status !== 'refunded' && (
                  <button 
                    disabled={isRefunding}
                    onClick={() => handleRefund(selectedBill.uuid)}
                    className="flex-1 py-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-black rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={20} />
                    {isRefunding ? 'Refunding...' : 'Refund'}
                  </button>
                )}
                <button 
                  onClick={() => {
                    const connected = localStorage.getItem('printer_connected') === 'true';
                    if (!connected) {
                      alert('Printer not connected. Please go to Printer Setup.');
                      return;
                    }
                    alert(`Reprinting receipt for ${selectedBill.uuid.slice(0, 8)}...`);
                  }}
                  className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  Reprint Receipt
                </button>
                <button 
                  onClick={() => setSelectedBill(null)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-200 dark:bg-slate-700 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomersScreen = ({ customers, onAddCustomer, bills, settings }: { customers: Customer[], onAddCustomer: () => void, bills: Bill[], settings: ShopSettings | null }) => {
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post('/customers', { name, phone, email });
      onAddCustomer();
      setShowAdd(false);
      setName('');
      setPhone('');
      setEmail('');
    } catch(err: any) {
      console.error(err);
      alert(err.message || 'Failed to add customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerBills = selectedCustomer ? bills.filter(b => b.customerId == selectedCustomer.id).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()) : [];

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{t('customers')}</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{customers.length} total clients</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Add Customer</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Name</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 hidden sm:table-cell">Phone</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 hidden md:table-cell">Email</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 hidden lg:table-cell">Loyalty Points</th>
     <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Debt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {customers.map((c, i) => (
                <tr key={c.id || i} onClick={() => setSelectedCustomer(c)} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{c.name}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell font-medium">{c.phone || '-'}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 hidden md:table-cell font-medium">{c.email || '-'}</td>
                  <td className="p-4 font-bold text-blue-600 dark:text-blue-400 hidden lg:table-cell">{c.loyalty_points || 0}</td>
     <td className="p-4 font-black text-rose-500 text-right">{c.total_debt && c.total_debt > 0 ? formatCurrency(c.total_debt) : '-'}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedCustomer && !selectedBill && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSelectedCustomer(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{selectedCustomer.name}</h3>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex gap-4 mt-2">
                    {selectedCustomer.phone && <span>{selectedCustomer.phone}</span>}
                    {selectedCustomer.email && <span>{selectedCustomer.email}</span>}
                  </div>
                </div>
                {selectedCustomer.total_debt && selectedCustomer.total_debt > 0 ? (
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unpaid Debt</span>
                    <span className="text-xl font-black text-rose-500">{formatCurrency(selectedCustomer.total_debt)}</span>
                    <button 
                      onClick={(e) => {
                         e.stopPropagation();
                         const amountStr = window.prompt(`Enter amount to pay (Max: ${selectedCustomer.total_debt})`);
                         if (amountStr) {
                           const amount = parseFloat(amountStr);
                           if (!isNaN(amount) && amount > 0) {
                             if (amount > (selectedCustomer.total_debt || 0)) {
                               alert('Amount exceeds total debt');
                               return;
                             }
                             api.post(`/customers/${selectedCustomer.id}/pay`, { amount }).then(() => {
                               alert('Payment recorded!');
                               onAddCustomer(); // refetch
                               setSelectedCustomer(null);
                             }).catch(e => alert(e.message));
                           }
                         }
                      }}
                      className="mt-2 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 px-3 py-1.5 rounded-lg font-bold transition-colors"
                    >
                      Pay Debt
                    </button>
                  </div>
                ) : null}
                <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm p-2 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Recent Purchases ({customerBills.length})</h4>
                {customerBills.length === 0 ? (
                  <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No purchases recorded for this customer.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerBills.map(bill => (
                      <div 
                        key={bill.uuid} 
                        onClick={() => setSelectedBill(bill)}
                        className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-blue-500 cursor-pointer transition-all shadow-sm"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{format(new Date(bill.dateTime), 'MMM dd, yyyy - HH:mm')}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">{bill.uuid.slice(0, 8)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(bill.grandTotal)}</p>
                          <p className="text-xs text-slate-400 capitalize mt-1">{bill.items.length} items</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {selectedBill && settings && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedBill(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col max-h-[85vh] overflow-hidden"
            >
               <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Invoice Details</h3>
                  <button onClick={() => setSelectedBill(null)} className="p-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
                    <X size={20} />
                  </button>
               </div>
               <div className="p-6 overflow-y-auto bg-slate-50 dark:bg-slate-800/50">
                  <ReceiptView bill={selectedBill} settings={settings} />
               </div>
            </motion.div>
          </div>
        )}

        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowAdd(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">Add Customer</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm p-2 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Name *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" placeholder="+1 234 567 8900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" placeholder="john@example.com" />
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={isSubmitting || !name.trim()} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                    {isSubmitting ? 'Saving...' : 'Save Customer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ReportsScreen = ({ bills, products, currentUser }: { bills: Bill[], products: Product[], currentUser: User | null }) => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'custom'>('today');
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [productCategoryMap, setProductCategoryMap] = useState<Map<string, string>>(new Map());
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    api.get('/expenses').then(res => setExpenses(res)).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    const catMap = new Map(products.map(p => [p.id, p.category || 'Uncategorized']));
    setProductCategoryMap(catMap);

    let startDate = startOfDay(new Date());
    const endDate = endOfDay(new Date());

    if (dateRange === '7d') startDate = startOfDay(subDays(new Date(), 7));
    if (dateRange === '30d') startDate = startOfDay(subDays(new Date(), 30));

    const filtered = bills.filter(b => isWithinInterval(b.dateTime, { start: startDate, end: endDate }));
    setFilteredBills(filtered);
  }, [dateRange, bills, products]);

  let startDate = startOfDay(new Date());
  const endDate = endOfDay(new Date());
  if (dateRange === '7d') startDate = startOfDay(subDays(new Date(), 7));
  if (dateRange === '30d') startDate = startOfDay(subDays(new Date(), 30));

  const totalSales = filteredBills.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalOrders = filteredBills.length;
  const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  const filteredExpenses = expenses.filter(e => isWithinInterval(new Date(e.date_time), { start: startDate, end: endDate }));
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalExpenses;

  const todayIncome = bills
    .filter(b => isSameDay(b.dateTime, new Date()))
    .reduce((sum, b) => sum + b.grandTotal, 0);

  // Chart Data: Sales by Day
  const salesByDay = filteredBills.reduce((acc: { day: string, date: Date, sales: number }[], b) => {
    const day = format(b.dateTime, 'MMM dd');
    const existing = acc.find(item => item.day === day);
    if (existing) {
      existing.sales += b.grandTotal;
    } else {
      acc.push({ day, date: startOfDay(b.dateTime), sales: b.grandTotal });
    }
    return acc;
  }, []).sort((a, b) => a.date.getTime() - b.date.getTime());

  // Chart Data: Sales by Category
  const salesByCategory = filteredBills.reduce((acc: any[], b) => {
    b.items.forEach(item => {
      const category = productCategoryMap.get(item.product_id) || 'Uncategorized';
      const existing = acc.find(i => i.name === category);
      if (existing) {
        existing.value += item.quantity * item.price;
      } else {
        acc.push({ name: category, value: item.quantity * item.price });
      }
    });
    return acc;
  }, []).sort((a, b) => b.value - a.value).slice(0, 5);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const handleSendGmailReport = async () => {
    setIsSendingEmail(true);
    try {
      const authResult = await googleSignIn();
      if (!authResult) throw new Error("Google Sign In failed");
      
      const reportContent = `
        <h1>POS Report - ${dateRange}</h1>
        <p>Total Sales: ${formatCurrency(totalSales)}</p>
        <p>Total Orders: ${totalOrders}</p>
        <p>Average Order Value: ${formatCurrency(avgOrder)}</p>
        <h2>Sales by Category</h2>
        <ul>
          ${salesByCategory.map(c => `<li>${c.name}: ${formatCurrency(c.value)}</li>`).join('')}
        </ul>
      `;

      await sendGmailReport(authResult.accessToken, reportContent);
      alert("Report sent to your Gmail successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send report. See console.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleExportCsv = () => {
    if (filteredBills.length === 0) {
      alert("No data to export for this date range.");
      return;
    }
    const headers = ['Invoice ID', 'Date', 'Customer', 'Items', 'Subtotal', 'Tax', 'Discount', 'Total', 'Payment Method', 'Status'];
    const rows = filteredBills.map(b => [
      b.uuid,
      format(b.dateTime, 'yyyy-MM-dd HH:mm'),
      b.customerId || 'Walk-in',
      b.items.map(i => `${i.name} x${i.quantity}`).join(' | '),
      b.subtotal.toString(),
      (b.taxAmount || 0).toString(),
      b.discount.toString(),
      b.grandTotal.toString(),
      b.paymentMethod || 'cash',
      b.status || 'paid'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => `"${e.join('","')}"`)].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 tracking-tighter">{t('reports')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Analyze your business performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            {(['today', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  dateRange === range ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100 dark:text-slate-100"
                )}
              >
                {range === 'today' ? 'Today' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all flex items-center gap-1 shadow-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      {dateRange !== 'today' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <p className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-2">Daily Income (Today)</p>
            <h2 className="text-4xl font-black">{formatCurrency(todayIncome)}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-blue-100 text-sm font-medium">Total Orders Today</p>
              <p className="text-xl font-bold">{bills.filter(b => isSameDay(b.dateTime, new Date())).length}</p>
            </div>
            <div className="w-12 h-12 bg-white dark:bg-slate-900/20 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
        </motion.div>
      )}

      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label={dateRange === 'today' ? "Today's Revenue" : "Total Revenue"} value={formatCurrency(totalSales)} icon={DollarSign} color="blue" />
        <StatCard label="Total Orders" value={totalOrders.toString()} icon={ShoppingCart} color="emerald" />
        <StatCard label="Avg. Order Value" value={formatCurrency(avgOrder)} icon={TrendingUp} color="amber" />
        <StatCard label="Net Profit" value={formatCurrency(netProfit)} icon={DollarSign} color="blue" />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 mb-8 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600 dark:text-blue-400" />
            Revenue Over Time
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDay}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 mb-8 flex items-center gap-2">
            <PieChartIcon size={20} className="text-emerald-600 dark:text-emerald-400" />
            Top Selling Products
          </h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="hidden md:block space-y-2 ml-4">
              {salesByCategory.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: 'blue' | 'emerald' | 'amber' | 'rose' | 'rose' }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 shadow-blue-100 dark:bg-blue-900/20 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100 dark:bg-amber-900/20 dark:text-amber-400",
    rose: "bg-rose-50 text-rose-600 shadow-rose-100 dark:bg-rose-900/20 dark:text-rose-400"
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
      <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg", colors[color])}>
        <Icon size={32} />
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-slate-100 dark:text-slate-100 tracking-tighter">{value}</p>
      </div>
    </div>
  );
};

const SettingsScreen = ({ onPrinterSetup, currentUser, setCurrentUser, syncStatus, settings, setSettings }: { onPrinterSetup: () => void, currentUser: User | null, setCurrentUser: (user: User | null) => void, syncStatus: 'synced' | 'syncing' | 'error' | 'idle', settings: ShopSettings | null, setSettings: (s: ShopSettings) => void }) => {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSave = async () => {
    if (settings) {
      try {
        await api.post('/settings', settings);
        alert('Settings saved successfully!');
      } catch (err) {
        console.error('Settings save error:', err);
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && settings) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!settings) return null;

  const mockBill: Bill = {
    uuid: 'DEMO-12345678',
    dateTime: new Date(),
    items: [
      { product_id: '123', item_number: '123', name: 'Sample Product 1', quantity: 2, price: 150 },
      { product_id: '456', item_number: '456', name: 'Sample Product 2', quantity: 1, price: 500 },
      { product_id: 'CUSTOM', item_number: 'CUSTOM', name: 'Custom Service', quantity: 1, price: 200 }
    ],
    subtotal: 1000,
    discount: 100,
    discountType: 'fixed',
    discountValue: 100,
    grandTotal: 900,
    isPrinted: true
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">{t('settings')}</h1>
          <p className="text-slate-500 dark:text-slate-400">Configure your shop and cloud sync</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:bg-slate-700 transition-colors"
            title="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <Eye size={20} />
            Preview Bill
          </button>
          <button 
            onClick={onPrinterSetup}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:bg-slate-700 transition-colors"
          >
            <Bluetooth size={20} />
            Printer Setup
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-8 space-y-8">
        <section className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">Shop Details</h3>
          
          <div className="flex items-center gap-6 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="text-slate-300" size={32} />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                <Upload size={20} />
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Shop Logo</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Upload your store logo for the receipt. Square images work best.</p>
              {settings.logoUrl && (
                <button 
                  onClick={() => setSettings({...settings, logoUrl: undefined})}
                  className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1 hover:underline"
                >
                  Remove Logo
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Shop Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.name}
                onChange={e => setSettings({...settings, name: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.address}
                onChange={e => setSettings({...settings, address: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.phone}
                onChange={e => setSettings({...settings, phone: e.target.value})}
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">Tax Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.taxName || ''}
                placeholder="e.g. VAT or Tax"
                onChange={e => setSettings({...settings, taxName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax Rate (%)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.taxRate || 0}
                onChange={e => setSettings({...settings, taxRate: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
        </section>

        

        <section className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">User Profile</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Your display name"
              value={currentUser?.displayName || ''}
              onChange={async (e) => {
                if (currentUser && currentUser.id) {
                  const updatedUser = { ...currentUser, displayName: e.target.value };
                  setCurrentUser(updatedUser);
                  try {
                    await api.put('/auth/me', { fullName: e.target.value });
                  } catch (err) {
                    console.error('User update error:', err);
                  }
                }
              }}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This name will be shown instead of your real name.</p>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">Receipt Layout & Size</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Paper Size</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.receiptPaperSize}
                onChange={e => setSettings({...settings, receiptPaperSize: e.target.value as any})}
              >
                <option value="58mm">58mm (Standard Thermal)</option>
                <option value="80mm">80mm (Wide Thermal)</option>
                <option value="A4">A4 (Standard Paper)</option>
                <option value="custom">Custom Width</option>
              </select>
            </div>
            {settings.receiptPaperSize === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Custom Width (mm)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={settings.receiptWidth}
                  onChange={e => setSettings({...settings, receiptWidth: parseInt(e.target.value) || 58})}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Font Size (px)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.receiptFontSize}
                onChange={e => setSettings({...settings, receiptFontSize: parseInt(e.target.value) || 12})}
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">Receipt Content</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 justify-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.showStoreName}
                  onChange={e => setSettings({...settings, showStoreName: e.target.checked})}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Store Name</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.showStoreDetails}
                  onChange={e => setSettings({...settings, showStoreDetails: e.target.checked})}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Store Details Container</span>
              </label>
            </div>
            <div className="flex flex-col gap-2 justify-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.showAddress}
                  onChange={e => setSettings({...settings, showAddress: e.target.checked})}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Address</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.showPhone}
                  onChange={e => setSettings({...settings, showPhone: e.target.checked})}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Phone</span>
              </label>
            </div>
            <div className="flex flex-col gap-2 justify-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.showInvoiceNumber}
                  onChange={e => setSettings({...settings, showInvoiceNumber: e.target.checked})}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Invoice Number</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.showDateTime}
                  onChange={e => setSettings({...settings, showDateTime: e.target.checked})}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Date & Time</span>
              </label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Receipt Header</label>
              <textarea 
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20"
                value={settings.receiptHeader}
                onChange={e => setSettings({...settings, receiptHeader: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Receipt Footer</label>
              <textarea 
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20"
                value={settings.receiptFooter}
                onChange={e => setSettings({...settings, receiptFooter: e.target.value})}
              />
            </div>
          </div>
        </section>

        <button 
          onClick={handleSave}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          Save All Settings
        </button>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Receipt Preview</h3>
                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-200 dark:bg-slate-700 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 flex-1">
                <div className="max-w-xs mx-auto">
                  <ReceiptView bill={mockBill} settings={settings} />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button 
                  onClick={() => setShowPreview(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:bg-slate-700 transition-colors"
                >
                  Close Preview
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  Print Test
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

const SyncIndicator = ({ isOnline, isMobile, isSyncing, pendingCount = 0 }: { isOnline: boolean, isMobile?: boolean, isSyncing?: boolean, pendingCount?: number }) => {
  const getStatusConfig = () => {
    if (!isOnline) return { icon: Lock, text: 'Offline Mode', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', pulse: true, spin: false, sub: pendingCount > 0 ? `${pendingCount} items pending` : 'Working offline' };
    if (isSyncing) return { icon: RefreshCw, text: 'Syncing...', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', pulse: false, spin: true, sub: 'Fetching data...' };
    if (pendingCount > 0) return { icon: RefreshCw, text: 'Pending Sync', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', pulse: true, spin: false, sub: `${pendingCount} items waiting` };
    return { icon: CheckCircle2, text: 'Database Online', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', pulse: false, spin: false, sub: 'Connected' };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (isMobile) {
    return (
      <div className="relative overflow-hidden rounded-lg">
        <div className={cn("flex items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase tracking-wider transition-colors", config.bg, config.color)}>
          <Icon size={12} className={cn(config.pulse && "animate-pulse", config.spin && "animate-spin")} />
          {config.text}
        </div>
        {isSyncing && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-200/50">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ x: "-100%", width: "50%" }}
              animate={{ x: "200%" }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border border-transparent relative overflow-hidden", config.bg)}>
      {isSyncing && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-200/50">
          <motion.div 
            className="h-full bg-blue-500"
            initial={{ x: "-100%", width: "50%" }}
            animate={{ x: "200%" }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          />
        </div>
      )}
      <div className={cn("p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm relative z-10", config.color)}>
        <Icon size={18} className={cn(config.pulse && "animate-pulse", config.spin && "animate-spin")} />
        {config.pulse && <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-ping" />}
      </div>
      <div className="flex-1 min-w-0 z-10">
        <p className={cn("text-xs font-black uppercase tracking-widest", config.color)}>{config.text}</p>
        <p className="text-[10px] text-slate-400 font-bold truncate">
          {config.sub}
        </p>
      </div>
    </div>
  );
};


const PublicBillScreen = () => {
  const [bill, setBill] = useState<Bill | null>(null);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBill = async () => {
      const match = window.location.pathname.match(/\/public\/bill\/([^\/]+)/);
      if (match && match[1]) {
        try {
          const res = await fetch(`/api/public/bills/${match[1]}`);
          if (!res.ok) throw new Error('Bill not found');
          const data = await res.json();
          setBill({ ...data.bill, dateTime: new Date(data.bill.dateTime) });
          setSettings(data.settings);
        } catch (err) {
          setError('Failed to load bill');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBill();
  }, []);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('receipt');
    if (!element || !bill) return;
    
    // Scale up for better PDF quality
    const opt = {
      margin: 0,
      filename: `bill-${bill.uuid}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: [settings?.receiptWidth === 80 ? 80 : 58, 200] as [number, number], orientation: 'portrait' as const }
    };
    
    try {
      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error(e);
      alert("Could not generate PDF");
    }
  };

  if (loading) return <div className="h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error || !bill || !settings) return <div className="h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold">{error || 'Bill not found'}</div>;

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 text-center text-white">
          <div className="w-16 h-16 bg-white dark:bg-slate-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
             <CheckCircle2 size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">E-Receipt</h2>
          <p className="text-blue-100 mt-1 opacity-90">{settings.name || 'Store'} • {formatCurrency(bill.grandTotal)}</p>
        </div>

        {/* Receipt Container */}
        <div className="p-6 bg-slate-100 dark:bg-slate-900/50 flex justify-center overflow-x-auto">
           <ReceiptView bill={bill} settings={settings} />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  if (window.location.pathname.startsWith('/public/bill/')) {
    return <PublicBillScreen />;
  }
  if (window.location.pathname === '/public/terms') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-black mb-6">Terms and Conditions</h1>
          <div className="prose prose-slate">
            <p>Welcome to Alpha Mobile POS.</p>
            <h3>1. Terms</h3>
            <p>By accessing this website and application, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
            <h3>2. Use License</h3>
            <p>Permission is granted to temporarily download one copy of the materials on Alpha Mobile POS's website for personal, non-commercial transitory viewing only.</p>
            <h3>3. Disclaimer</h3>
            <p>The materials on Alpha Mobile POS's website are provided on an 'as is' basis. Alpha Mobile POS makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            <h3>4. Limitations</h3>
            <p>In no event shall Alpha Mobile POS or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Alpha Mobile POS's website.</p>
            <br/><br/>
            <button onClick={() => window.location.href = '/'} className="text-blue-500 font-bold hover:underline">Return Home</button>
          </div>
        </div>
      </div>
    );
  }
  if (window.location.pathname === '/public/privacy') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-black mb-6">Privacy Policy</h1>
          <div className="prose prose-slate">
            <p>Your privacy is important to us.</p>
            <h3>Information we collect</h3>
            <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
            <h3>Use of Information</h3>
            <p>We use the information we collect to operate and maintain our app, send you communications, and respond to your requests.</p>
            <h3>Information Sharing</h3>
            <p>We don't share any personally identifying information publicly or with third-parties, except when required to by law.</p>
            <h3>Data Security</h3>
            <p>We protect data within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
            <br/><br/>
            <button onClick={() => window.location.href = '/'} className="text-blue-500 font-bold hover:underline">Return Home</button>
          </div>
        </div>
      </div>
    );
  }
  if (window.location.pathname === '/public/returns') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-black mb-6">Return & Refund Policy</h1>
          <div className="prose prose-slate">
            <p>Thank you for shopping at Alpha Mobile POS.</p>
            <h3>Returns</h3>
            <p>You have 30 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging.</p>
            <h3>Refunds</h3>
            <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item. If your return is approved, we will initiate a refund to your credit card (or original method of payment).</p>
            <h3>Shipping</h3>
            <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.</p>
            <h3>Contact Us</h3>
            <p>If you have any questions on how to return your item to us, contact us.</p>
            <br/><br/>
            <button onClick={() => window.location.href = '/'} className="text-blue-500 font-bold hover:underline">Return Home</button>
          </div>
        </div>
      </div>
    );
  }

  


  const [activeTab, setActiveTab] = useState<'dashboard' | 'checkout' | 'transactions' | 'products' | 'customers' | 'reports' | 'settings' | 'printer-setup' | 'pending-prints' | 'staff' | 'expenses' | 'suppliers' | 'drawer' | 'coupons' | 'attendance' | 'adjustments' | 'giftcards' | 'quotes' | 'returns' | 'po' | 'barcode'>('dashboard');
  const { isOnline, isSyncing: isQueueSyncing, pendingCount, syncNow } = useSync();
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'idle'>('idle');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStaff, setCurrentStaff] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  useEffect(() => {
    if(currentUser) {
       api.get('/staff').then(res => setStaffList(res)).catch(e => {});
    }
  }, [currentUser]);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const fetchData = async () => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    try {
      const [productsData, billsData, customersData] = await Promise.all([
        api.get('/products'),
        api.get('/bills'),
        
        api.get('/customers')
      ]);
        
      setProducts(productsData || []);
      setBills(billsData.map((b: any) => ({...b, dateTime: new Date(b.dateTime)})) || []);
      
      setCustomers(customersData || []);
      setSyncStatus('synced');
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        // Ignore network errors when dev server is restarting
        setSyncStatus('error');
        return;
      }
      console.warn('Data fetch error:', err?.message || err);
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
      const interval = setInterval(fetchData, 30000); // Poll every 30s as fallback for real-time
      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const user = await api.get('/auth/me');
          setCurrentUser({
            id: user.id,
            username: user.email?.split('@')[0] || '',
            email: user.email || '',
            fullName: user.fullName || 'User',
            displayName: user.fullName || 'User',
            role: user.role || 'admin'
          });
          
          // Load settings only if logged in
          try {
            const s = await api.get('/settings');
            setSettings(s);
          } catch (err) {
            console.warn('Initial settings fetch error:', err?.message || err);
          }
        } catch (err) {
          console.warn('Auth check error:', err?.message || err);
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      
      setSettings(prev => prev || {
        name: 'Alpha Store',
        address: '123 Main St, City',
        phone: '555-0123',
        receiptHeader: 'Welcome to Alpha Store',
        receiptFooter: 'Thank you for shopping with us!',
        receiptFontSize: 14,
        receiptWidth: 58,
        receiptPaperSize: '58mm',
        showStoreName: true,
        showStoreDetails: true,
        showAddress: true,
        showPhone: true,
        showInvoiceNumber: true,
        showDateTime: true
      });
      
      setIsLoading(false);
    };

    checkAuth();

    

    return () => {
      
    };
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  if (isLoading || !settings) return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0A0A0A] flex items-center justify-center">
      <RefreshCw size={40} className="animate-spin text-blue-600 dark:text-blue-400" />
    </div>
  );

    if (!currentUser) {
    return <AuthScreen />;
  }
  if (currentUser.is_superadmin) {
    return <SuperAdminScreen onLogout={() => {
      localStorage.removeItem('token');
      setCurrentUser(null);
      window.location.reload();
    }} />;
  }

  if (currentUser && !currentUser.is_superadmin && staffList.length > 0 && !currentStaff) {
    return (
      <div className="flex h-[100dvh] bg-slate-50 dark:bg-slate-900 items-center justify-center">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-md w-full text-center shadow-xl">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Staff Unlock</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {staffList.map(s => (
              <button key={s.id} onClick={() => {
                const pin = prompt('Enter PIN for ' + s.full_name);
                if (pin === s.pin) setCurrentStaff(s);
                else alert('Incorrect PIN');
              }} className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold p-4 rounded-2xl flex flex-col items-center gap-2 transition-colors">
                 <UserCircle2 size={32} />
                 {s.full_name}
              </button>
            ))}
          </div>
          <button onClick={() => {
            localStorage.removeItem('token');
            setCurrentUser(null);
            window.location.reload();
          }} className="mt-8 text-slate-500 dark:text-slate-400 font-bold text-sm">Logout Tenant</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-8 flex-col gap-10">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 rotate-3">
            <ShoppingCart size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none">ALPHA</h1>
            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 tracking-[0.2em] uppercase">Mobile POS</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Plus} label="New Sale" active={activeTab === 'checkout'} onClick={() => setActiveTab('checkout')} />
          
              
          <SidebarItem icon={History} label="History" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
          {['admin', 'manager'].includes(currentUser.role) && (
            <>
              <SidebarItem icon={Package} label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
              
              <SidebarItem icon={Layers} label="Variants" active={activeTab === 'variants'} onClick={() => setActiveTab('variants')} />

              
              <SidebarItem icon={Clock} label="Shifts" active={activeTab === 'shifts'} onClick={() => setActiveTab('shifts')} />
              {currentUser?.package_type !== 'BASIC' && <SidebarItem icon={FileText} label="Invoices" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />}

              <SidebarItem icon={PackageMinus} label="Stock Audits" active={activeTab === 'adjustments'} onClick={() => setActiveTab('adjustments')} />
              <SidebarItem icon={ScanBarcode} label="Barcodes" active={activeTab === 'barcode'} onClick={() => setActiveTab('barcode')} />
              <SidebarItem icon={Users} label="Customers" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
              <SidebarItem icon={Wallet} label="Cash Drawer" active={activeTab === 'drawer'} onClick={() => setActiveTab('drawer')} />
              <SidebarItem icon={Ticket} label="Coupons" active={activeTab === 'coupons'} onClick={() => setActiveTab('coupons')} />
              <SidebarItem icon={Gift} label="Gift Cards" active={activeTab === 'giftcards'} onClick={() => setActiveTab('giftcards')} />
              <SidebarItem icon={Truck} label="Suppliers" active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} />
              <SidebarItem icon={PackageOpen} label="Purchase Orders" active={activeTab === 'po'} onClick={() => setActiveTab('po')} />
              <SidebarItem icon={RotateCcw} label="Returns" active={activeTab === 'returns'} onClick={() => setActiveTab('returns')} />
              <SidebarItem icon={FileText} label="Quotes" active={activeTab === 'quotes'} onClick={() => setActiveTab('quotes')} />
              <SidebarItem icon={UserCircle2} label="Staff" active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} />
              <SidebarItem icon={Clock} label="Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
              
              <SidebarItem icon={Store} label="Branches" active={activeTab === 'branches'} onClick={() => setActiveTab('branches')} />
              <SidebarItem icon={Tag} label="Promotions" active={activeTab === 'promotions'} onClick={() => setActiveTab('promotions')} />
              {currentUser?.package_type !== 'BASIC' && currentStaff?.role !== 'CASHIER' && <SidebarItem icon={Calculator} label="Payroll" active={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')} />}

              {currentStaff?.role !== 'CASHIER' && <SidebarItem icon={BarChart3} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />}
              <SidebarItem icon={Banknote} label="Expenses" active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} />
              {currentStaff?.role !== 'CASHIER' && <SidebarItem icon={Settings} label="Setup" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />}
            </>
          )}
        </nav>

        <div className="space-y-4">
          <SyncIndicator isOnline={isOnline} isSyncing={syncStatus === 'syncing' || isQueueSyncing} pendingCount={pendingCount} />
          
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={toggleTheme}
            className="w-full mb-4 flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-colors"
          >
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Theme</span>
            {theme === 'dark' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-blue-500" />}
          </button>

          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-4">
            <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm font-black">
              {(currentUser.displayName || currentUser.fullName).charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black truncate">{currentUser.displayName || currentUser.fullName}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{currentUser.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:bg-rose-900/20 rounded-2xl transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <ShoppingCart size={24} />
          </div>
          <h1 className="text-lg font-black tracking-tighter">ALPHA</h1>
        </div>
        <div className="flex items-center gap-3">
          <SyncIndicator isOnline={isOnline} isMobile isSyncing={syncStatus === 'syncing' || isQueueSyncing} pendingCount={pendingCount} />
          <button onClick={handleLogout} className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'dashboard' && <Dashboard bills={bills} products={products} onNewSale={() => setActiveTab('checkout')} onPendingPrints={() => setActiveTab('pending-prints')} />}
            {activeTab === 'checkout' && <Checkout products={products} settings={settings} customers={customers} currentUser={currentUser} onBack={() => setActiveTab('dashboard')} onSaleComplete={fetchData} onAddCustomer={fetchData} />}
            
            {activeTab === 'transactions' && <Transactions bills={bills} settings={settings} customers={customers} onRefresh={fetchData} currentUser={currentUser} />}
            {activeTab === 'products' && <Products products={products} />}
            {activeTab === 'customers' && <CustomersScreen customers={customers} onAddCustomer={fetchData} bills={bills} settings={settings} />}
            {activeTab === 'drawer' && <CashDrawerScreen bills={bills} />}
            {activeTab === 'coupons' && <CouponsScreen />}
            {activeTab === 'suppliers' && <SuppliersScreen products={products} />}
            {activeTab === 'reports' && <ReportsScreen bills={bills} products={products} currentUser={currentUser} />}
            {activeTab === 'expenses' && <ExpensesScreen />}
            {activeTab === 'attendance' && <AttendanceScreen />}
            
            {activeTab === 'variants' && <VariantsScreen products={products} />}

            
            {activeTab === 'shifts' && <ShiftsScreen />}
            {activeTab === 'invoices' && <InvoicesScreen />}

            {activeTab === 'adjustments' && <StockAdjustmentsScreen products={products} />}
            {activeTab === 'barcode' && <BarcodeScreen products={products} />}
            {activeTab === 'giftcards' && <GiftCardsScreen />}
            {activeTab === 'quotes' && <QuotesScreen customers={customers} />}
            {activeTab === 'returns' && <ReturnsScreen />}
            {activeTab === 'po' && <PurchaseOrdersScreen products={products} />}
            {activeTab === 'staff' && <StaffScreen />}

            {activeTab === 'payroll' && <PayrollScreen />}
            {activeTab === 'promotions' && <PromotionsScreen products={products} />}
            {activeTab === 'branches' && <BranchesScreen />}

            {activeTab === 'settings' && <ShopSettingsScreen onPrinterSetup={() => setActiveTab('printer-setup')} currentUser={currentUser} settings={settings} setSettings={setSettings} />}
            {activeTab === 'printer-setup' && <PrinterSetup onBack={() => setActiveTab('settings')} />}
            {activeTab === 'pending-prints' && <PendingPrints bills={bills} settings={settings} onBack={() => setActiveTab('dashboard')} onSaleComplete={fetchData} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-2 flex justify-around items-center sticky bottom-0 z-50">
        <SidebarItem icon={LayoutDashboard} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isMobile />
        <SidebarItem icon={Plus} label="Sale" active={activeTab === 'checkout'} onClick={() => setActiveTab('checkout')} isMobile />
        <SidebarItem icon={History} label="History" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} isMobile />
        {['admin', 'manager'].includes(currentUser.role) && (
          <>
            {currentStaff?.role !== 'CASHIER' && <SidebarItem icon={BarChart3} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} isMobile />}
            <SidebarItem icon={Banknote} label="Expenses" active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} isMobile />
            <SidebarItem icon={Package} label="Items" active={activeTab === 'products'} onClick={() => setActiveTab('products')} isMobile />
            {currentStaff?.role !== 'CASHIER' && <SidebarItem icon={Settings} label="Setup" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} isMobile />}
          </>
        )}
      </nav>
    </div>
  );
}
