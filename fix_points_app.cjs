const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const pointValue = 0\.01;/g, 
  "const pointValue = settings?.valuePerPoint || 0.01;");

code = code.replace(/const grandTotal = Math\.max\(0, baseGrandTotal - pointsDiscount\);/g, 
  "const grandTotal = Math.max(0, baseGrandTotal - pointsDiscount);\n  const pointsEarned = settings?.enableLoyalty && settings?.amountPerPoint && settings.amountPerPoint > 0 ? Math.floor(grandTotal / settings.amountPerPoint) : 0;");

code = code.replace(/status: paymentMethod === 'credit' \? 'unpaid' : 'paid'\n\s*};\n\n\s*const savedBill/g, 
  "status: paymentMethod === 'credit' ? 'unpaid' : 'paid',\n        pointsRedeemed: usePoints ? maxPointsToUse : 0,\n        pointsEarned: pointsEarned\n      };\n\n      const savedBill");

code = code.replace(/<p className="text-sm font-bold text-blue-700 dark:text-blue-400">Available: \{cust.loyalty_points\} Points<\/p>/g,
  `<p className="text-sm font-bold text-blue-700 dark:text-blue-400">Available: {cust.loyalty_points} Points (Valued at {(cust.loyalty_points * (settings?.valuePerPoint || 0.01)).toFixed(2)})</p>`);

fs.writeFileSync('src/App.tsx', code);
