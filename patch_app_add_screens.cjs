const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/import StockAdjustmentsScreen from '.\/StockAdjustmentsScreen';/, 
  "import StockAdjustmentsScreen from './StockAdjustmentsScreen';\nimport GiftCardsScreen from './GiftCardsScreen';\nimport QuotesScreen from './QuotesScreen';");

code = code.replace(
  /const \[activeTab, setActiveTab\] = useState\<'dashboard' \| 'checkout' \| 'transactions' \| 'products' \| 'customers' \| 'reports' \| 'settings' \| 'printer-setup' \| 'pending-prints' \| 'staff' \| 'expenses' \| 'suppliers' \| 'drawer' \| 'coupons' \| 'attendance' \| 'adjustments'\>\('dashboard'\);/,
  "const [activeTab, setActiveTab] = useState<'dashboard' | 'checkout' | 'transactions' | 'products' | 'customers' | 'reports' | 'settings' | 'printer-setup' | 'pending-prints' | 'staff' | 'expenses' | 'suppliers' | 'drawer' | 'coupons' | 'attendance' | 'adjustments' | 'giftcards' | 'quotes'>('dashboard');"
);

// Add to sidebar under coupons
code = code.replace(
  /<SidebarItem icon=\{Ticket\} label="Coupons" active=\{activeTab === 'coupons'\} onClick=\{\(\) => setActiveTab\('coupons'\)\} \/>/,
  `<SidebarItem icon={Ticket} label="Coupons" active={activeTab === 'coupons'} onClick={() => setActiveTab('coupons')} />
              <SidebarItem icon={Gift} label="Gift Cards" active={activeTab === 'giftcards'} onClick={() => setActiveTab('giftcards')} />`
);

// Add quotes to sidebar under transactions
code = code.replace(
  /<SidebarItem icon=\{History\} label="Transactions" active=\{activeTab === 'transactions'\} onClick=\{\(\) => setActiveTab\('transactions'\)\} \/>/,
  `<SidebarItem icon={History} label="Transactions" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
              <SidebarItem icon={FileText} label="Quotes" active={activeTab === 'quotes'} onClick={() => setActiveTab('quotes')} />`
);

// Add routing
code = code.replace(
  /\{activeTab === 'adjustments' && <StockAdjustmentsScreen products=\{products\} \/>\}/,
  `{activeTab === 'adjustments' && <StockAdjustmentsScreen products={products} />}
            {activeTab === 'giftcards' && <GiftCardsScreen />}
            {activeTab === 'quotes' && <QuotesScreen customers={customers} />}`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with GC and Quotes screens");
