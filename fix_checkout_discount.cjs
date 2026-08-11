const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = "const [discountValue, setDiscountValue] = useState(0);";
const replacement = `const [discountValue, setDiscountValue] = useState(0);
  
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
`;

code = code.replace(target, replacement);

// find where setDiscountValue is called inside JSX
code = code.replace(/setDiscountValue\(parseFloat\(e\.target\.value\) \|\| 0\)/g, "handleDiscountChange(parseFloat(e.target.value) || 0, discountType)");

fs.writeFileSync('src/App.tsx', code);
