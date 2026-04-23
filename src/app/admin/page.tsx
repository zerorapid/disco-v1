'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, discount_price: 0, category: 'Groceries', weight: '500', stock: 10, image_url: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  }

  async function updateStock(id: number, delta: number) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const newStock = Math.max(0, p.stock + delta);
    
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id);
    if (!error) {
      setProducts(products.map(x => x.id === id ? { ...x, stock: newStock } : x));
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.from('products').insert([newProduct]).select();
    if (!error && data) {
      setProducts([data[0], ...products]);
      setNewProduct({ name: '', price: 0, discount_price: 0, category: 'Groceries', weight: '500', stock: 10, image_url: '' });
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-24 pb-32 max-width">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="!text-4xl mb-2">OWNER PORTAL</h1>
            <p className="text-muted font-bold uppercase tracking-widest text-[12px]">Warehouse Inventory Management</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* ADD PRODUCT FORM */}
          <div className="lg:col-span-1">
            <div className="border border-black p-8">
              <h2 className="!text-xl mb-8 uppercase font-black">Add New Product</h2>
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-muted">Product Name</label>
                  <input 
                    required
                    className="w-full h-12 border border-border px-4 font-bold focus:border-black outline-none transition-colors"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-muted">MRP (₹)</label>
                    <input 
                      type="number"
                      required
                      className="w-full h-12 border border-border px-4 font-bold focus:border-black outline-none transition-colors"
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-muted">Deal (₹)</label>
                    <input 
                      type="number"
                      required
                      className="w-full h-12 border border-border px-4 font-bold focus:border-black outline-none transition-colors"
                      value={newProduct.discount_price}
                      onChange={e => setNewProduct({...newProduct, discount_price: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-muted">Image URL</label>
                  <input 
                    required
                    placeholder="https://unsplash..."
                    className="w-full h-12 border border-border px-4 font-bold focus:border-black outline-none transition-colors"
                    value={newProduct.image_url}
                    onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full bg-black text-white h-14 font-black uppercase tracking-widest">
                  Inject into Warehouse
                </button>
              </form>
            </div>
          </div>

          {/* INVENTORY LIST */}
          <div className="lg:col-span-2">
            <div className="border border-border">
              <div className="bg-uber-gray p-4 border-b border-border grid grid-cols-6 text-[10px] font-black uppercase tracking-widest">
                <div className="col-span-3">Product</div>
                <div className="text-center">Stock</div>
                <div className="text-right col-span-2">Action</div>
              </div>
              
              {loading ? (
                <div className="p-20 text-center opacity-30 font-black uppercase tracking-widest">Scanning...</div>
              ) : products.map(p => (
                <div key={p.id} className="p-6 border-b border-border grid grid-cols-6 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-3 flex items-center gap-4">
                    <div className="w-12 h-12 bg-uber-gray flex items-center justify-center p-2">
                      <img src={p.image_url} className="max-w-full max-h-full object-contain" alt=""/>
                    </div>
                    <div>
                      <div className="font-bold text-[14px] leading-tight">{p.name}</div>
                      <div className="text-[10px] text-muted uppercase font-black tracking-widest">{p.category} • {p.weight}g</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <span className={`px-3 py-1 font-black text-[14px] ${p.stock < 5 ? 'bg-red-500 text-white' : 'bg-black text-white'}`}>
                      {p.stock}
                    </span>
                  </div>
                  
                  <div className="col-span-2 flex justify-end gap-2">
                    <button onClick={() => updateStock(p.id, -1)} className="w-10 h-10 border border-border flex items-center justify-center hover:bg-black hover:text-white transition-all">-</button>
                    <button onClick={() => updateStock(p.id, 1)} className="w-10 h-10 border border-border flex items-center justify-center hover:bg-black hover:text-white transition-all">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
