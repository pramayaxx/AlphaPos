const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetToRemove = `  const [lang, setLang] = useState<'EN' | 'SI' | 'TA'>('EN');

  const dict: any = {
    'EN': { pos: 'ALPHA POS', dash: 'Dashboard', checkout: 'Checkout', prod: 'Products', cust: 'Customers' },
    'SI': { pos: 'ඇල්ෆා POS', dash: 'පාලක පුවරුව', checkout: 'අයකැමි', prod: 'භාණ්ඩ', cust: 'පාරිභෝගිකයින්' },
    'TA': { pos: 'ஆல்ஃபா POS', dash: 'முகப்பு', checkout: 'காசாளர்', prod: 'பொருட்கள்', cust: 'வாடிக்கையாளர்கள்' }
  };
  const t = dict[lang];`;

code = code.replace(targetToRemove, '');

// Also search for t.pos, t.dash and replace with generic 'ALPHA POS', etc since I changed the translation dictionary structure
code = code.replace(/t\.pos/g, "'ALPHA POS'");
code = code.replace(/t\.dash/g, "t('dashboard')");
code = code.replace(/t\.checkout/g, "t('checkout')");
code = code.replace(/t\.prod/g, "t('products')");
code = code.replace(/t\.cust/g, "t('customers')");

fs.writeFileSync('src/App.tsx', code);
