'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { ChevronRight, Share2, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const { cart, addToCart, updateQuantity } = useCart();
  
  const cartItem = cart.find(item => item.id === Number(resolvedParams.id));

  useEffect(() => {
    async function fetchProduct() {
      try {
        const productId = parseInt(resolvedParams.id);
        if (isNaN(productId)) throw new Error("Invalid Product ID");

        const { data, error: dbError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
        
        if (dbError) throw dbError;
        
        if (data) {
          setProduct(data);
          setActiveImage(data.image_url);
          
          // Intelligence: Fetch Similar Products
          const { data: similar } = await supabase
            .from('products')
            .select('*')
            .eq('category', data.category)
            .neq('id', productId)
            .limit(4);
          if (similar) setSimilarProducts(similar);
        }
      } catch (err: any) {
        console.error("PDP Error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="animate-spin text-green-600" size={48} />
        <span className="font-black text-[15px] uppercase tracking-widest text-black/40">Syncing Warehouse...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center gap-6">
        <h2 className="text-3xl font-black text-black">Product Not Available</h2>
        <p className="text-black/50 font-medium max-w-md">This item might be out of stock at your nearest warehouse or the link has expired.</p>
        <Link href="/" className="h-14 px-8 bg-black text-white rounded-xl flex items-center justify-center font-black">Back to Store</Link>
      </div>
    );
  }

  const discountPercent = product.price > product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
    : 0;

  const titleCase = (str: string) => {
    if (!str) return "";
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <main className="bg-white min-h-screen">
      <Header />
      
      <div className="pt-[80px] md:pt-[120px] pb-20 px-4 lg:px-24 max-w-[1600px] mx-auto">
        {/* BREADCRUMB REMOVED FOR CLEANER LOOK */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-24">
          {/* LEFT: IMAGES */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="order-2 md:order-1 flex flex-row md:flex-col gap-3 overflow-x-auto no-scrollbar md:overflow-visible">
              {[product.image_url, product.image_url, product.image_url].map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveImage(img)}
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 border-2 rounded-lg overflow-hidden bg-uber-gray cursor-pointer transition-all p-2 ${
                    activeImage === img ? 'border-green-600 shadow-md' : 'border-transparent hover:border-black/10'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              ))}
            </div>
            <div className="order-1 md:order-2 flex-1 relative aspect-square bg-uber-gray rounded-2xl overflow-hidden p-4 md:p-16 border border-border">
              <img 
                src={activeImage || product.image_url} 
                alt={product.name} 
                className="w-full h-full object-contain mix-blend-multiply animate-in fade-in duration-300" 
              />
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8">
            <div>
              <h1 className="text-[22px] md:text-[32px] font-black text-black leading-tight mb-2">{titleCase(product.name)}</h1>
              <div className="flex items-center gap-4">
                <span className="text-[14px] md:text-[15px] font-bold text-black/40">Net: {product.weight} {product.weight > 10 ? 'g' : 'kg'}</span>
                <span className="text-[12px] font-black text-green-700 uppercase tracking-widest bg-green-50 px-2 py-1">In Stock</span>
              </div>
            </div>

            <div className="p-5 md:p-6 border-2 border-green-600/10 bg-green-50/30 rounded-2xl space-y-5 md:space-y-6">
              <div className="flex items-end gap-3">
                <span className="text-[32px] md:text-[36px] font-black leading-none text-black">₹{product.discount_price}</span>
                {discountPercent > 0 && (
                  <span className="text-[16px] md:text-[18px] text-black/30 line-through font-bold mb-1">₹{product.price}</span>
                )}
                <span className="bg-green-700 text-white text-[10px] md:text-[11px] font-black px-2 py-0.5 rounded ml-2">
                  {discountPercent}% OFF
                </span>
              </div>

              {cartItem ? (
                <div className="h-12 md:h-14 flex items-center bg-black text-white rounded-xl font-black overflow-hidden shadow-xl">
                  <button onClick={() => updateQuantity(product.id, -1)} className="w-16 md:w-20 h-full hover:bg-white/10 transition-colors flex items-center justify-center border-r border-white/10">
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <span className="flex-1 text-center text-[16px] md:text-lg">{cartItem.quantity}</span>
                  <button onClick={() => updateQuantity(product.id, 1)} className="w-16 md:w-20 h-full hover:bg-white/10 transition-colors flex items-center justify-center border-l border-white/10">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full h-12 md:h-14 bg-green-700 hover:bg-green-800 text-white rounded-xl font-black text-[15px] md:text-[16px] shadow-lg active:scale-[0.98] transition-all"
                >
                  Add To Cart
                </button>
              )}
            </div>

            {/* OFFERS SECTION */}
            <div className="space-y-4">
              <h4 className="text-[14px] md:text-[15px] font-black text-black uppercase tracking-widest">Coupons & Offers</h4>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { title: "AMAZONPAY50", desc: "Get upto ₹50 Cashback on Amazon Pay" },
                  { title: "CRED10", desc: "Get 10% off with CRED above ₹499" }
                ].map((offer, i) => (
                  <div key={i} className="p-4 border border-border rounded-xl flex items-center justify-between group cursor-pointer hover:border-green-600 transition-colors bg-white">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black rounded">{offer.title}</span>
                        <span className="text-[13px] font-black text-black">Apply</span>
                      </div>
                      <span className="text-[11px] text-black/50 font-medium">{offer.desc}</span>
                    </div>
                    <ChevronRight size={16} className="text-black/20 group-hover:text-green-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 border-t border-border pt-12 md:pt-16">
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-[18px] md:text-[20px] font-black text-black uppercase tracking-tighter">Description</h3>
              <p className="text-[14px] md:text-[15px] text-black/60 leading-relaxed font-medium">
                {product.description || "No description provided for this item."}
              </p>
            </div>

            <h3 className="text-[18px] md:text-[20px] font-black text-black uppercase tracking-tighter pt-4">Highlights</h3>
            <div className="space-y-4">
              {[
                { label: "Brand", value: "DISCO Premium" },
                { label: "Category", value: product.category || "General" },
                { label: "Weight", value: product.weight >= 1000 ? `${product.weight/1000} kg` : `${product.weight} g` }
              ].map((item, i) => (
                <div key={i} className="flex border-b border-border pb-4 last:border-0">
                  <span className="w-1/3 text-[13px] md:text-[14px] font-bold text-black/40">{item.label}</span>
                  <span className="w-2/3 text-[13px] md:text-[14px] font-black text-black">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-[18px] md:text-[20px] font-black text-black uppercase tracking-tighter">Information</h3>
            <div className="p-6 bg-uber-gray rounded-2xl space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black text-black/40 uppercase">Disclaimer</span>
                <p className="text-[12px] text-black/60 leading-relaxed">Images for representational purposes only. Check batch details on arrival.</p>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-black/40 uppercase">Seller</span>
                <span className="text-[13px] font-black text-black">DISCO Convenience Pvt Ltd</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIMILAR PRODUCTS */}
        <div className="mt-20 md:mt-24 space-y-8">
          <h3 className="text-[20px] md:text-[24px] font-black text-black tracking-tighter uppercase">You May Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {similarProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
