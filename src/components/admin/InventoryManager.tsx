'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Minus, X, Package, Loader2, Edit3, Save, Trash2, Zap } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  discount_price: number;
  category: string;
  weight: number;
  stock: number;
  image_url: string;
  sourcing_cost: number;
}

export default function InventoryManager({ products: initialProducts, onUpdate }: { products: Product[], onUpdate: () => void }) {
  const [products, setProducts] = useState(initialProducts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterDeals, setFilterDeals] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Groceries',
    price: 0,
    discount_price: 0,
    weight: 0,
    stock: 0,
    image_url: '',
    sourcing_cost: 0
  });

  const filteredProducts = filterDeals 
    ? products.filter(p => p.discount_price === 1) 
    : products;

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { error } = await supabase.from('products').insert([newProduct]);
    
    if (!error) {
      setShowAddForm(false);
      setNewProduct({ name: '', category: 'Groceries', price: 0, discount_price: 0, weight: 0, stock: 0, image_url: '', sourcing_cost: 0 });
      onUpdate();
    } else {
      alert("Error adding product: " + error.message);
    }
    setIsSubmitting(false);
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmitting(true);
    
    const { id, ...updateData } = editingProduct;
    const { error } = await supabase.from('products').update(updateData).eq('id', id);
    
    if (!error) {
      setEditingProduct(null);
      onUpdate();
    } else {
      alert("Error updating product: " + error.message);
    }
    setIsSubmitting(false);
  }

  async function updateStock(id: number, delta: number) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const newStock = Math.max(0, p.stock + delta);
    
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id);
    if (!error) {
      setProducts(products.map(x => x.id === id ? { ...x, stock: newStock } : x));
      onUpdate();
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) onUpdate();
  }

  return (
    <div className="space-y-6">
      {/* ACTION HEADER */}
      <div className="flex flex-col md:flex-row gap-4">
        {!showAddForm && !editingProduct && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex-1 h-16 md:h-20 bg-white border border-black/10 flex items-center justify-center gap-4 text-[12px] md:text-[13px] font-black uppercase tracking-widest text-black hover:border-black transition-all active-scale shadow-sm"
          >
            <Plus size={24} />
            Register SKU
          </button>
        )}
        <button 
          onClick={() => setFilterDeals(!filterDeals)}
          className={`flex-1 md:flex-none md:px-10 h-16 md:h-20 border flex items-center justify-center gap-4 text-[12px] md:text-[13px] font-black uppercase tracking-widest transition-all active-scale shadow-sm ${filterDeals ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-black/10 text-black/40'}`}
        >
          <Zap size={22} fill={filterDeals ? "white" : "none"} />
          {filterDeals ? 'Promotions Active' : 'Filter Deals'}
        </button>
      </div>

      {/* ADD PRODUCT FORM */}
      {showAddForm && (
        <form onSubmit={handleAddProduct} className="bg-white border-2 border-black p-4 md:p-6 space-y-4 md:space-y-6 animate-in slide-in-from-top-4 duration-300 shadow-xl">
          <div className="flex justify-between items-center border-b border-uber-gray pb-4">
            <h3 className="text-xl md:text-heading-3">Initialization</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-black/20 hover:text-black"><X size={24} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-caption text-black/40">Product Name</label>
              <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full h-12 bg-uber-gray px-4 font-bold" placeholder="e.g. Fresh Milk" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-black/40">Category</label>
              <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full h-12 bg-uber-gray px-4 font-bold">
                <option>Groceries</option>
                <option>Dairy & Eggs</option>
                <option>Fresh Produce</option>
                <option>Beverages</option>
                <option>Snacks</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-caption text-black/40">Weight (Numeric grams/ml)</label>
              <input required type="number" value={newProduct.weight || ''} onChange={e => setNewProduct({...newProduct, weight: parseInt(e.target.value) || 0})} className="w-full h-12 bg-uber-gray px-4 font-bold" placeholder="500" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-black/40">Image URL</label>
              <input required type="text" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} className="w-full h-12 bg-uber-gray px-4 font-bold" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-black/40">MRP Price</label>
              <input required type="number" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: parseInt(e.target.value) || 0})} className="w-full h-12 bg-uber-gray px-4 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-black/40">DISCO Price (Set to 1 for Deals)</label>
              <input required type="number" value={newProduct.discount_price || ''} onChange={e => setNewProduct({...newProduct, discount_price: parseInt(e.target.value) || 0})} className="w-full h-12 bg-uber-gray px-4 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-black/40">Initial Stock</label>
              <input required type="number" value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})} className="w-full h-12 bg-uber-gray px-4 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-black/40">Sourcing Cost (Internal)</label>
              <input required type="number" value={newProduct.sourcing_cost || ''} onChange={e => setNewProduct({...newProduct, sourcing_cost: parseInt(e.target.value) || 0})} className="w-full h-12 bg-white border-2 border-black/10 px-4 font-black text-blue-600" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-14 bg-black text-white text-caption flex items-center justify-center gap-2 active-scale"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
            Finalize Initialization
          </button>
        </form>
      )}

      {/* EDIT PRODUCT MODAL-STYLE FORM */}
      {editingProduct && (
        <form onSubmit={handleUpdateProduct} className="bg-white border-2 border-green-600 p-6 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl">
          <div className="flex justify-between items-center border-b border-uber-gray pb-4">
            <h3 className="text-heading-3">Edit: {editingProduct.name}</h3>
            <button type="button" onClick={() => setEditingProduct(null)} className="text-black/20 hover:text-black"><X size={24} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-caption text-black/40">Product Name</label>
              <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full h-12 bg-uber-gray px-4 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-black/40">Category</label>
              <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full h-12 bg-uber-gray px-4 font-bold">
                <option>Groceries</option>
                <option>Dairy & Eggs</option>
                <option>Fresh Produce</option>
                <option>Beverages</option>
                <option>Snacks</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-caption text-black/40">Weight (Numeric)</label>
              <input required type="number" value={editingProduct.weight || ''} onChange={e => setEditingProduct({...editingProduct, weight: parseInt(e.target.value) || 0})} className="w-full h-12 bg-uber-gray px-4 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-black/40">Image URL</label>
              <input required type="text" value={editingProduct.image_url} onChange={e => setEditingProduct({...editingProduct, image_url: e.target.value})} className="w-full h-12 bg-uber-gray px-4 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-black/40">MRP</label>
              <input required type="number" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: parseInt(e.target.value) || 0})} className="w-full h-12 bg-uber-gray px-4 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-black/40">DISCO Price (Set to 1 for Deals)</label>
              <input required type="number" value={editingProduct.discount_price || ''} onChange={e => setEditingProduct({...editingProduct, discount_price: parseInt(e.target.value) || 0})} className="w-full h-12 bg-uber-gray px-4 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-black/40">Sourcing Cost (Protect your 1.5%)</label>
              <input required type="number" value={editingProduct.sourcing_cost || ''} onChange={e => setEditingProduct({...editingProduct, sourcing_cost: parseInt(e.target.value) || 0})} className="w-full h-12 bg-white border-2 border-black/10 px-4 font-black text-blue-600" />
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => deleteProduct(editingProduct.id)}
              className="px-6 h-14 bg-red-50 text-red-600 text-caption flex items-center justify-center gap-2 active-scale"
            >
              <Trash2 size={20} />
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 h-14 bg-green-600 text-white text-caption flex items-center justify-center gap-2 active-scale"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Save Modifications
            </button>
          </div>
        </form>
      )}

      {/* TABLE HEADER - HIDDEN ON MOBILE */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em]">
        <div className="col-span-5">Product Details / SKU</div>
        <div className="col-span-2 text-center">Category</div>
        <div className="col-span-2 text-center">Pricing Ledger</div>
        <div className="col-span-3 text-right">Inventory / Stock Control</div>
      </div>

      {/* PRODUCT LIST - Tactic 47, 49 */}
      <div className="bg-white shadow-xl overflow-hidden border border-black/5">
        {filteredProducts.map((p, idx) => (
          <div 
            key={p.id} 
            className={`px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center hover:bg-uber-gray/30 transition-all group ${
              idx !== filteredProducts.length - 1 ? 'border-b border-black/5' : ''
            } ${p.stock < 5 ? 'border-l-4 border-red-600' : 'border-l-4 border-transparent'}`}
          >
            
            {/* PRODUCT INFO */}
            <div className="col-span-5 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
              <div className="w-24 h-24 md:w-20 md:h-20 bg-white border border-black/10 flex items-center justify-center p-2 transition-transform group-hover:scale-105 shrink-0">
                <img src={p.image_url} className="max-w-full max-h-full object-contain mix-blend-multiply" alt=""/>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[20px] md:text-[18px] font-black uppercase tracking-tight truncate">{p.name}</h4>
                <p className="text-[12px] md:text-[13px] font-bold text-black/40 uppercase tracking-widest mt-1.5">
                  {p.weight}g / ml • Cost: ₹{p.sourcing_cost || 0}
                </p>
                {p.discount_price === 1 && (
                  <span className="inline-block mt-3 bg-green-600 text-white text-[10px] px-3 py-1 font-black uppercase tracking-widest">PROMO ACTIVE</span>
                )}
              </div>
            </div>

            {/* CATEGORY */}
            <div className="col-span-2 text-center hidden lg:block">
              <span className="px-3 py-1 bg-uber-gray text-[11px] font-semibold uppercase tracking-widest text-black/60">{p.category}</span>
            </div>

            {/* PRICE DISPLAY */}
            <div className="col-span-2 text-center flex lg:block justify-between items-center">
              <span className="lg:hidden text-[11px] font-black text-black/40 uppercase tracking-widest">Unit Price</span>
              <div className="flex flex-col lg:items-center">
                <span className={`text-[28px] font-black tracking-tighter ${p.discount_price === 1 ? 'text-green-700' : 'text-black'}`}>₹{p.discount_price}</span>
                <span className="text-[12px] font-bold text-black/20 line-through">MRP ₹{p.price}</span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="col-span-3 flex flex-col md:flex-row items-center justify-between lg:justify-end gap-6 md:gap-8">
              <div className="flex items-center gap-3 bg-white border border-black/10 p-1 w-full md:w-auto justify-between md:justify-start">
                <button 
                  onClick={() => updateStock(p.id, -1)}
                  aria-label="Decrease stock"
                  className="w-14 h-14 md:w-12 md:h-12 flex items-center justify-center hover:bg-uber-gray active-scale transition-all"
                >
                  <Minus size={20} />
                </button>
                <div className="flex items-center gap-2 px-4">
                  <div className={`text-center font-black text-[22px] md:text-[20px] ${p.stock < 5 ? 'text-red-600' : 'text-black'}`}>
                    {p.stock}
                  </div>
                  {p.stock < 5 && <span className="text-red-600 text-[18px]" aria-hidden="true">⚠️</span>}
                </div>
                <button 
                  onClick={() => updateStock(p.id, 1)}
                  aria-label="Increase stock"
                  className="w-14 h-14 md:w-12 md:h-12 flex items-center justify-center hover:bg-uber-gray active-scale transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <button 
                onClick={() => setEditingProduct(p)}
                className="w-full md:w-14 h-14 bg-black text-white flex items-center justify-center hover:bg-black/80 transition-all active-scale"
              >
                <Edit3 size={20} />
                <span className="md:hidden ml-3 text-[11px] font-black uppercase tracking-widest">Edit SKU</span>
              </button>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="py-20 border-2 border-dashed border-uber-gray flex flex-col items-center justify-center text-caption text-black/10">
            No products found matching filters
          </div>
        )}
      </div>
    </div>
  );
}
