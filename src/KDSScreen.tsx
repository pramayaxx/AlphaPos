import React, { useState, useEffect } from 'react';
import { ChefHat, Check, Clock, Utensils } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const KDSScreen = () => {
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await (window as any).api.get('/kds');
      setOrders(res);
    } catch(err) { console.error(err); }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await (window as any).api.put(`/kds/${id}/status`, { status });
      fetchOrders();
    } catch(err) { alert(err.message); }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      <div className="px-8 py-6 border-b border-slate-800 shrink-0 flex justify-between items-center z-10 sticky top-0 bg-slate-900">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3"><ChefHat /> Kitchen Display System</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{orders.length} Active Orders</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 flex gap-6 overflow-x-auto snap-x">
        {orders.map(order => {
          let items = [];
          try { items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items; } catch(e){}
          const isPending = order.status === 'PENDING';
          const isPreparing = order.status === 'PREPARING';
          const isReady = order.status === 'READY';
          
          return (
            <div key={order.id} className={`snap-center shrink-0 w-80 rounded-2xl flex flex-col overflow-hidden border-2 
              ${isPending ? 'border-amber-500/50 bg-amber-500/10' : 
                isPreparing ? 'border-blue-500/50 bg-blue-500/10' : 'border-emerald-500/50 bg-emerald-500/10'}`}>
              
              <div className={`p-4 border-b-2 flex justify-between items-center
                ${isPending ? 'border-amber-500/50 bg-amber-500/20' : 
                  isPreparing ? 'border-blue-500/50 bg-blue-500/20' : 'border-emerald-500/50 bg-emerald-500/20'}`}>
                <div className="font-black text-xl">Table {order.table_name}</div>
                <div className="text-xs font-bold flex items-center gap-1"><Clock size={12}/> {formatDistanceToNow(new Date(order.created_at))}</div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-start border-b border-slate-700/50 pb-2">
                    <div>
                      <div className="font-bold text-lg">{item.quantity}x {item.product.name}</div>
                      {item.variant && <div className="text-sm text-slate-400">{item.variant.name}</div>}
                    </div>
                  </div>
                ))}
                {order.notes && (
                  <div className="mt-4 p-3 bg-red-500/20 text-red-200 rounded-xl font-medium text-sm">
                    <strong>Notes:</strong> {order.notes}
                  </div>
                )}
              </div>
              
              <div className="p-4 grid grid-cols-2 gap-2 mt-auto">
                {isPending && (
                  <button onClick={() => updateStatus(order.id, 'PREPARING')} className="col-span-2 bg-blue-600 hover:bg-blue-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <Utensils size={18} /> Start Preparing
                  </button>
                )}
                {isPreparing && (
                  <button onClick={() => updateStatus(order.id, 'READY')} className="col-span-2 bg-emerald-600 hover:bg-emerald-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <Check size={18} /> Mark Ready
                  </button>
                )}
                {isReady && (
                  <button onClick={() => updateStatus(order.id, 'SERVED')} className="col-span-2 bg-slate-700 hover:bg-slate-600 font-bold py-3 rounded-xl">
                    Served / Clear
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {orders.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center text-slate-500 font-bold">
            <ChefHat size={64} className="mb-4 opacity-50" />
            <p className="text-2xl">No active orders</p>
            <p className="font-medium text-sm">Kitchen is clear!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KDSScreen;
