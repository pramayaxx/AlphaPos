const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-inner">
                      <button 
                        onClick={() => updateQuantity(item.product_id, -1)} 
`;

const insert = `
                    <div className="flex items-center gap-2">
                      {settings?.scale_integration && (
                        <button 
                          onClick={() => {
                            const weight = parseFloat((Math.random() * 5).toFixed(2));
                            setCart(prev => prev.map(c => c.product_id === item.product_id ? { ...c, quantity: weight } : c));
                          }} 
                          className="text-xs bg-indigo-100 text-indigo-700 px-2 py-2 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-300"
                          title="Read from scale"
                        >
                          ⚖️ Scale
                        </button>
                      )}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-inner">
                      <button 
                        onClick={() => updateQuantity(item.product_id, -1)} 
`;

code = code.replace(target, insert);

// also close the extra div
const closeTarget = `
                      </button>
                    </div>
                  </div>
`;
const closeInsert = `
                      </button>
                    </div>
                    </div>
                  </div>
`;
code = code.replace(closeTarget, closeInsert);

fs.writeFileSync('src/App.tsx', code);
