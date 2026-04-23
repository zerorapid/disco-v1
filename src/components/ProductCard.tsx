'use client';

interface ProductProps {
  product: {
    id: number;
    name: string;
    price: number;
    discount_price: number;
    image_url: string;
    weight: string;
  };
}

export default function ProductCard({ product }: ProductProps) {
  return (
    <div className="bg-white border border-border p-6 flex flex-col group cursor-pointer transition-all hover:bg-gray-50">
      <div className="relative aspect-square bg-uber-gray mb-8 flex items-center justify-center p-8 overflow-hidden">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-contain transition-transform group-hover:scale-105"
          loading="lazy"
        />
        {product.price > product.discount_price && (
          <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-black px-4 py-2 uppercase">
            -{Math.round((1 - product.discount_price/product.price)*100)}%
          </span>
        )}
      </div>
      
      <div className="flex flex-col flex-1">
        <h3 className="font-medium text-[16px] lg:text-[20px] mb-2 leading-tight text-black line-clamp-2">
          {product.name}
        </h3>
        <p className="text-[13px] font-bold uppercase text-muted mb-8 tracking-wider">
          {product.weight}g
        </p>
        
        <div className="mt-auto min-h-[110px] flex flex-col justify-end">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <span className="text-[20px] lg:text-[24px] font-black text-black">
                ₹{product.discount_price}
              </span>
              {product.price > product.discount_price && (
                <span className="text-[13px] text-muted line-through opacity-50">
                  ₹{product.price}
                </span>
              )}
            </div>
          </div>
          
          <button className="w-full bg-black text-white h-[60px] font-black uppercase text-[13px] tracking-widest active:scale-95 transition-all">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
