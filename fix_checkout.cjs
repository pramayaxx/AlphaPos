const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                      >
`;

const insertStr = `
                    <div className="flex items-center space-x-2">
                      {settings?.scale_integration && item.product.allow_partial_quantities && (
                        <button 
                          onClick={() => updateQuantity(item.product.id, parseFloat((Math.random() * 5).toFixed(2)))} 
                          className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded dark:bg-indigo-900/30 dark:text-indigo-300"
                          title="Read from scale"
                        >
                          ⚖️ Read Scale
                        </button>
                      )}
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                      >
`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, insertStr);
  fs.writeFileSync('src/App.tsx', code);
} else {
  console.log("Could not find checkout cart item string");
}

