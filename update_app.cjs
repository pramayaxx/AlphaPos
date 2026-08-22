const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import for useSync at top
if (!code.includes("import { useSync } from './useSync';")) {
  code = code.replace(/import React, { useState, useEffect, useRef, useMemo, memo } from 'react';/, 
    "import React, { useState, useEffect, useRef, useMemo, memo } from 'react';\nimport { useSync } from './useSync';");
}

// 2. Update SyncIndicator
code = code.replace(/const SyncIndicator = \(\{ isOnline, isMobile, isSyncing \}: \{ isOnline: boolean, isMobile\?: boolean, isSyncing\?: boolean \}\) => \{[\s\S]*?const config = getStatusConfig\(\);/, 
`const SyncIndicator = ({ isOnline, isMobile, isSyncing, pendingCount = 0 }: { isOnline: boolean, isMobile?: boolean, isSyncing?: boolean, pendingCount?: number }) => {
  const getStatusConfig = () => {
    if (!isOnline) return { icon: Lock, text: 'Offline Mode', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', pulse: true, spin: false, sub: pendingCount > 0 ? \`\${pendingCount} items pending\` : 'Working offline' };
    if (isSyncing) return { icon: RefreshCw, text: 'Syncing...', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', pulse: false, spin: true, sub: 'Fetching data...' };
    if (pendingCount > 0) return { icon: RefreshCw, text: 'Pending Sync', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', pulse: true, spin: false, sub: \`\${pendingCount} items waiting\` };
    return { icon: CheckCircle2, text: 'Database Online', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', pulse: false, spin: false, sub: 'Connected' };
  };

  const config = getStatusConfig();`);

// 3. Update main App hook
// Remove existing isOnline state and add useSync
code = code.replace(/const \[isOnline, setIsOnline\] = useState\(navigator.onLine\);/, 
  "const { isOnline, isSyncing: isQueueSyncing, pendingCount, syncNow } = useSync();");

// Remove window event listeners for online/offline
code = code.replace(/const handleOnline = \(\) => setIsOnline\(true\);\s*const handleOffline = \(\) => setIsOnline\(false\);\s*window\.addEventListener\('online', handleOnline\);\s*window\.addEventListener\('offline', handleOffline\);/g, 
  "");
code = code.replace(/window\.removeEventListener\('online', handleOnline\);\s*window\.removeEventListener\('offline', handleOffline\);/g, "");

// Replace SyncIndicator usage
code = code.replace(/<SyncIndicator isOnline={isOnline} isSyncing={syncStatus === 'syncing'} \/>/g, 
  "<SyncIndicator isOnline={isOnline} isSyncing={syncStatus === 'syncing' || isQueueSyncing} pendingCount={pendingCount} />");

code = code.replace(/<SyncIndicator isOnline={isOnline} isMobile isSyncing={syncStatus === 'syncing'} \/>/g, 
  "<SyncIndicator isOnline={isOnline} isMobile isSyncing={syncStatus === 'syncing' || isQueueSyncing} pendingCount={pendingCount} />");

fs.writeFileSync('src/App.tsx', code);
