const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add currentUser to Transactions props
const oldProps = "const Transactions = ({ bills, settings, customers, onRefresh }: { bills: Bill[], settings: ShopSettings, customers: Customer[], onRefresh: () => void }) => {";
const newProps = "const Transactions = ({ bills, settings, customers, onRefresh, currentUser }: { bills: Bill[], settings: ShopSettings, customers: Customer[], onRefresh: () => void, currentUser: any }) => {";
code = code.replace(oldProps, newProps);

// Check permission
const oldRefund = "const handleRefund = async (uuid: string) => {";
const newRefund = `const handleRefund = async (uuid: string) => {
    if (currentUser?.role === 'cashier') return alert('You do not have permission to refund bills. Please ask a manager.');`;
code = code.replace(oldRefund, newRefund);

// Pass currentUser in render
const oldRender = "{activeTab === 'transactions' && <Transactions bills={bills} settings={settings} customers={customers} onRefresh={fetchData} />}";
const newRender = "{activeTab === 'transactions' && <Transactions bills={bills} settings={settings} customers={customers} onRefresh={fetchData} currentUser={currentUser} />}";
code = code.replace(oldRender, newRender);

fs.writeFileSync('src/App.tsx', code);
