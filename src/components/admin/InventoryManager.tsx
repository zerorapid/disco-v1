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
    image_url: ''
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
      setNewProduct({ name: '', category: 'Groceries', price: 0, discount_price: 0, weight: 0, stock: 0, image_url: '' });
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
      <div className="flex gap-4">
        {!showAddForm && !editingProduct && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex-1 h-16 bg-white border-2 border-dashed border-black/10 flex items-center justify-center gap-3 text-caption text-black hover:border-black transition-all active-scale shadow-sm"
          >
            <Plus size={24} />
            Initialize New Product
          </button>
        )}
        <button 
          onClick={() => setFilterDeals(!filterDeals)}
          className={`px-8 h-16 border-2 flex items-center justify-center gap-3 text-caption transition-all active-scale shadow-sm ${filterDeals ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-black/10 text-black/40'}`}
        >
          <Zap size={20} fill={filterDeals ? "white" : "none"} />
          {filterDeals ? 'Viewing ₹1 Deals' : 'Filter ₹1 Deals'}
        </button>
      </div>

      {/* ADD PRODUCT FORM */}
      {showAddForm && (
        <form onSubmit={handleAddProduct} className="bg-white border-2 border-black p-6 space-y-6 animate-in slide-in-from-top-4 duration-300 shadow-xl">
          <div className="flex justify-between items-center border-b border-uber-gray pb-4">
            <h3 className="text-heading-3">New Product Initialization</h3>
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
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-black text-white text-caption">
        <div className="col-span-5">Product Info</div>
        <div className="col-span-2 text-center">Category</div>
        <div className="col-span-2 text-center">Price (₹)</div>
        <div className="col-span-3 text-right">Rapid Controls</div>
      </div>

      {/* PRODUCT LIST */}
      <div className="space-y-2">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white border-thin p-4 lg:px-6 lg:py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center hover:border-black transition-all group">
            
            {/* PRODUCT INFO */}
            <div className="col-span-5 flex items-center gap-4">
              <div className="w-16 h-16 bg-uber-gray flex items-center justify-center p-2 border-thin group-hover:bg-white transition-all">
                <img src={p.image_url} className="max-w-full max-h-full object-contain mix-blend-multiply" alt=""/>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-body-primary truncate uppercase font-black">{p.name}</h4>
                <p className="text-body-secondary text-[11px] font-bold">{p.weight}g / ml</p>
                {p.discount_price === 1 && <span className="bg-green-600 text-white text-[8px] px-1 font-black uppercase">₹1 Deal</span>}
              </div>
            </div>

            {/* CATEGORY */}
            <div className="col-span-2 text-center hidden lg:block">
              <span className="px-3 py-1 bg-uber-gray text-[10px] font-black uppercase tracking-widest">{p.category}</span>
            </div>

            {/* PRICE DISPLAY */}
            <div className="col-span-2 text-center">
              <span className={`text-heading-3 ${p.discount_price === 1 ? 'text-green-600' : 'text-black'}`}>₹{p.discount_price}</span>
            </div>

            {/* ACTIONS */}
            <div className="col-span-3 flex items-center justify-between lg:justify-end gap-3">
              <div className="flex items-center gap-1 border-thin p-1 bg-uber-gray">
                <button 
                  onClick={() => updateStock(p.id, -1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white active-scale transition-all"
                >
                  <Minus size={14} />
                </button>
                <div className={`w-10 text-center font-black text-sm ${p.stock < 5 ? 'text-red-600' : 'text-black'}`}>
                  {p.stock}
                </div>
                <button 
                  onClick={() => updateStock(p.id, 1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white active-scale transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
              
              <button 
                onClick={() => setEditingProduct(p)}
                className="w-12 h-12 bg-black text-white flex items-center justify-center active-scale shadow-lg"
              >
                <Edit3 size={20} />
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
