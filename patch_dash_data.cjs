const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const \[stats, setStats\] = useState\(\{[\s\S]*?const \[lowStockProducts, setLowStockProducts\] = useState<Product\[\]>\(\[\]\);/;

const replacement = `const [stats, setStats] = useState({
    todayBills: 0,
    monthlyIncome: 0,
    totalProducts: 0,
    lowStock: 0,
    pendingPrints: 0
  });
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<{name: string, uv: number}[]>([]);
  const [topProducts, setTopProducts] = useState<{name: string, sales: number}[]>([]);`;

code = code.replace(regex, replacement);

const useEffRegex = /setStats\(\{[\s\S]*?setLowStockProducts\(lowStockItems\.slice\(0, 5\)\);\s*\}, \[bills, products\]\);/;
const useEffRep = `setStats({
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
  }, [bills, products]);`;

code = code.replace(useEffRegex, useEffRep);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched dashboard data successfully!");
