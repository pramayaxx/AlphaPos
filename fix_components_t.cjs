const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const compsToFix = ['Dashboard', 'CustomersScreen', 'ReportsScreen', 'SettingsScreen'];

code = code.replace(
  "const Dashboard = ({ bills, products, onNewSale, onPendingPrints }: { bills: Bill[], products: Product[], onNewSale: () => void, onPendingPrints: () => void }) => {",
  "const Dashboard = ({ bills, products, onNewSale, onPendingPrints }: { bills: Bill[], products: Product[], onNewSale: () => void, onPendingPrints: () => void }) => {\n  const { t } = useTranslation();"
);

code = code.replace(
  "const CustomersScreen = ({ customers, onAddCustomer, bills, settings }: { customers: Customer[], onAddCustomer: () => void, bills: Bill[], settings: ShopSettings | null }) => {",
  "const CustomersScreen = ({ customers, onAddCustomer, bills, settings }: { customers: Customer[], onAddCustomer: () => void, bills: Bill[], settings: ShopSettings | null }) => {\n  const { t } = useTranslation();"
);

// find Reports and Settings declaration
// let's just do a regex replace
code = code.replace(/const ReportsScreen = \(\{[^\}]+\}: \{[^\}]+\}\) => \{/g, match => match + "\n  const { t } = useTranslation();");
code = code.replace(/const SettingsScreen = \(\{[^\}]+\}: \{[^\}]+\}\) => \{/g, match => match + "\n  const { t } = useTranslation();");

// Maybe they don't have props?
code = code.replace(/const ReportsScreen = \(\) => \{/g, match => match + "\n  const { t } = useTranslation();");
code = code.replace(/const SettingsScreen = \(\) => \{/g, match => match + "\n  const { t } = useTranslation();");

fs.writeFileSync('src/App.tsx', code);
