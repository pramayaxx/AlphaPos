const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const ReportsScreen = \(\{ bills, products, currentUser \}: \{ bills: Bill\[\], products: Product\[\], currentUser: User \| null \}\) => \{[\s\S]*?const todayIncome = bills\n    \.filter\(b => isSameDay\(b\.dateTime, new Date\(\)\)\)\n    \.reduce\(\(sum, b\) => sum \+ b\.grandTotal, 0\);/;

const replacement = `const ReportsScreen = ({ bills, products, currentUser }: { bills: Bill[], products: Product[], currentUser: User | null }) => {
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
    .reduce((sum, b) => sum + b.grandTotal, 0);`;

code = code.replace(regex, replacement);

const statGridRegex = /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">[\s\S]*?<\/div>/;

const statGridReplacement = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          <StatCard label="Total Revenue" value={formatCurrency(totalSales)} icon={TrendingUp} color="emerald" />
          <StatCard label="Total Expenses" value={formatCurrency(totalExpenses)} icon={Banknote} color="rose" />
          <StatCard label="Net Profit" value={formatCurrency(netProfit)} icon={Wallet} color="blue" />
          <StatCard label="Orders" value={totalOrders.toString()} icon={Receipt} color="blue" />
          <StatCard label="Average Order" value={formatCurrency(avgOrder)} icon={Activity} color="amber" />
        </div>`;

code = code.replace(statGridRegex, statGridReplacement);

// Find StatCard and add 'rose' color support
const statCardRegex = /const StatCard = \(\{ label, value, icon: Icon, color \}: \{ label: string, value: string, icon: any, color: 'blue' \| 'emerald' \| 'amber' \}\) => \{/;
code = code.replace(statCardRegex, `const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: 'blue' | 'emerald' | 'amber' | 'rose' }) => {`);

const statCardColorsRegex = /const colors = \{\n\s*blue: "bg-blue-50 text-blue-600 shadow-blue-100",\n\s*emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100",\n\s*amber: "bg-amber-50 text-amber-600 shadow-amber-100"\n\s*\};/;
code = code.replace(statCardColorsRegex, `const colors = {
    blue: "bg-blue-50 text-blue-600 shadow-blue-100 dark:bg-blue-900/20 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100 dark:bg-amber-900/20 dark:text-amber-400",
    rose: "bg-rose-50 text-rose-600 shadow-rose-100 dark:bg-rose-900/20 dark:text-rose-400"
  };`);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched Reports");
