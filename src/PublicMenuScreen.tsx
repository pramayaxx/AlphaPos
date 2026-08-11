import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, CheckCircle, CreditCard } from 'lucide-react';

export const PublicMenuScreen = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const tenantId = window.location.pathname.split('/public/menu/')[1];

  useEffect(() => {
    fetch(`/api/public/menu/${tenantId}`)
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(console.error);
  }, [tenantId]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const ex = prev.find(p => p.product.id === product.id);
      if (ex) return prev.map(p => p.product.id === product.id ? {...p, quantity: p.quantity + 1} : p);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, q: number) => {
    if (q <= 0) {
      setCart(prev => prev.filter(p => p.product.id !== id));
    } else {
      setCart(prev => prev.map(p => p.product.id === id ? {...p, quantity: q} : p));
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const checkout = async () => {
    if (!customer.name || !customer.phone) return alert('Please enter name and phone');
    if (cart.length === 0) return;
    
    try {
      const res = await fetch(`/api/public/orders/${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(c => ({ name: c.product.name, quantity: c.quantity })),
          customer_name: customer.name,
          customer_phone: customer.phone,
          total_amount: total,
          order_type: 'online'
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrderPlaced(true);
        setCart([]);
      }
    } catch (err) {
      alert('Failed to place order');
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800">Order Placed Successfully!</h1>
        <p className="text-slate-600 mt-2 text-center">Your order has been sent to the kitchen. We will contact you shortly.</p>
        <button onClick={() => setOrderPlaced(false)} className="mt-8 text-indigo-600 underline">Place another order</button>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center">Loading menu...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-indigo-600 text-white p-6 shadow-md">
        <h1 className="text-2xl font-bold">Online Menu</h1>
        <p className="opacity-80">Place your order directly</p>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">{p.name}</h3>
                <p className="text-indigo-600 font-semibold">${Number(p.price).toFixed(2)}</p>
                {p.category && <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full mt-1 inline-block">{p.category}</span>}
              </div>
              <button 
                onClick={() => addToCart(p)}
                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
              >
                <Plus size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 max-h-[50vh] overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><ShoppingCart size={20}/> Your Order</h2>
            <div className="space-y-3 mb-4">
              {cart.map(c => (
                <div key={c.product.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{c.product.name}</p>
                    <p className="text-sm text-slate-500">${(c.product.price * c.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(c.product.id, c.quantity - 1)} className="p-1 bg-slate-100 rounded-md"><Minus size={16}/></button>
                    <span className="font-medium">{c.quantity}</span>
                    <button onClick={() => updateQuantity(c.product.id, c.quantity + 1)} className="p-1 bg-slate-100 rounded-md"><Plus size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <input 
                placeholder="Your Name" 
                value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}
                className="w-full p-2 border rounded-lg"
              />
              <input 
                placeholder="Your Phone Number" 
                value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}
                className="w-full p-2 border rounded-lg"
              />
              <button 
                onClick={checkout}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex justify-center items-center gap-2"
              >
                <CreditCard size={20} /> Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
