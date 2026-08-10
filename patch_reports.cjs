const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const additionalStats = `
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label={dateRange === 'today' ? "Today's Revenue" : "Total Revenue"} value={formatCurrency(totalSales)} icon={DollarSign} color="blue" />
        <StatCard label="Total Orders" value={totalOrders.toString()} icon={ShoppingCart} color="emerald" />
        <StatCard label="Avg. Order Value" value={formatCurrency(avgOrder)} icon={TrendingUp} color="amber" />
        <StatCard label="Net Profit" value={formatCurrency(netProfit)} icon={DollarSign} color="purple" />
      </div>
`;
code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-3 gap-6">[\s\S]*?<\/div>/, additionalStats);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched reports successfully");
