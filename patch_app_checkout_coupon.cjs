const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const applyCouponCode = `
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    try {
      const coupon = await api.post('/coupons/validate', { code: couponCode });
      if (subtotal < coupon.min_purchase) {
        alert(\`Minimum purchase of $\${coupon.min_purchase} required for this coupon.\`);
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
`;

code = code.replace(/const \[paymentMethod, setPaymentMethod\] = useState\<'cash' \| 'card' \| 'mobile'\>\('cash'\);/, 
  "const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');\n" + applyCouponCode);

const uiCode = `
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
`;

code = code.replace(/<div className="flex justify-between text-xs text-slate-400">[\s\S]*?<\/div>/, match => match + '\n' + uiCode);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for Coupon in Checkout");
