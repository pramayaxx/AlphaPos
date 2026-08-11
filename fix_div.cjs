const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const errPart = `
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{formatCurrency(item.price)} each</p>
                      <p className="font-black text-blue-600">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
`;
const fixedPart = `
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{formatCurrency(item.price)} each</p>
                      <p className="font-black text-blue-600">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
`;
code = code.replace(errPart, fixedPart);

// Let's also remove the extra </div> I added earlier if I did.
// Let's find out how many </div> are trailing.
fs.writeFileSync('src/App.tsx', code);
