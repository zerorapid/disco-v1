'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Package, Tag, Wallet, Percent, Truck } from 'lucide-react';

export default function AnalyticsView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    const [prodRes, orderRes] = await Promise.all([
      supabase.from('products').select('price, stock'),
      supabase.from('orders').select('*')
    ]);

    if (!prodRes.error && !orderRes.error) {
      // Stock Investment
      const totalStockInvestment = prodRes.data.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
      
      // Sales Breakdown
      let totalSales = 0;
      let totalDiscount = 0;
      let totalGST = 0;
      let totalFees = 0;
      let ordersWithCoupon = 0;
      let ordersWithoutCoupon = 0;

      orderRes.data.forEach(order => {
        totalSales += order.total_amount;
        totalDiscount += (order.coupon_discount || 0);
        totalGST += (order.gst_amount || 0);
        totalFees += (order.platform_fee || 0) + (order.handling_fee || 0) + (order.delivery_fee || 0) + (order.carry_bag_fee || 0);
        
        if (order.coupon) ordersWithCoupon++;
        else ordersWithoutCoupon++;
      });

      setData({
        stockInvestment: totalStockInvestment,
        sales: totalSales,
        discount: totalDiscount,
        gst: totalGST,
        fees: totalFees,
        ordersWithCoupon,
        ordersWithoutCoupon,
        totalOrders: orderRes.data.length
      });
    }
    setLoading(false);
  }

  if (loading) return <div className="h-64 flex items-center justify-center text-caption animate-pulse">Calculating Financial Metrics...</div>;
  if (!data) return <div>Error loading analytics</div>;

  const MetricCard = ({ icon: Icon, label, value, subtext, color = "black" }: any) => (
    <div className="bg-white border-thin p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className={`p-3 bg-uber-gray text-${color}`}>
          <Icon size={24} />
        </div>
        <div className="text-right">
          <p className="text-caption text-black/40">{label}</p>
          <h2 className="text-heading-2">₹{value.toLocaleString()}</h2>
        </div>
      </div>
      {subtext && <p className="text-[11px] font-bold text-black/40 uppercase tracking-widest border-t border-uber-gray pt-4">{subtext}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard 
          icon={Package} 
          label="Total Stock Investment" 
          value={data.stockInvestment} 
          subtext="Value of all inventory currently in warehouse"
        />
        <MetricCard 
          icon={TrendingUp} 
          label="Gross Revenue" 
          value={data.sales} 
          subtext={`Total from ${data.totalOrders} successful orders`}
          color="green-600"
        />
        <MetricCard 
          icon={Wallet} 
          label="Net Earnings (Est.)" 
          value={data.sales - data.gst - data.fees} 
          subtext="Revenue excluding GST and Operational Fees"
          color="blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DISCOUNTS & OFFERS */}
        <div className="bg-white border-thin p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-uber-gray pb-4">
            <Tag size={20} className="text-black/40" />
            <h3 className="text-caption">Discount Intelligence</h3>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-heading-2">₹{data.discount.toLocaleString()}</p>
                <p className="text-body-secondary text-xs uppercase font-black">Total Discount Given</p>
              </div>
              <div className="text-right">
                <p className="text-heading-3">{Math.round((data.ordersWithCoupon / data.totalOrders) * 100) || 0}%</p>
                <p className="text-body-secondary text-[10px] uppercase font-black text-green-600">Coupon Usage Rate</p>
              </div>
            </div>
            <div className="h-2 w-full bg-uber-gray overflow-hidden flex">
              <div className="h-full bg-black" style={{ width: `${(data.ordersWithCoupon / data.totalOrders) * 100}%` }} />
              <div className="h-full bg-black/10" style={{ width: `${(data.ordersWithoutCoupon / data.totalOrders) * 100}%` }} />
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
              <span className="flex items-center gap-2"><div className="w-2 h-2 bg-black"></div> With Coupons ({data.ordersWithCoupon})</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 bg-black/10"></div> Without Coupons ({data.ordersWithoutCoupon})</span>
            </div>
          </div>
        </div>

        {/* TAXES & FEES */}
        <div className="bg-white border-thin p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-uber-gray pb-4">
            <Percent size={20} className="text-black/40" />
            <h3 className="text-caption">Fees & Taxes Breakdown</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-uber-gray border-dashed">
              <span className="text-body-secondary font-bold uppercase text-[11px]">GST Collected (5%)</span>
              <span className="font-black">₹{data.gst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-uber-gray border-dashed">
              <span className="text-body-secondary font-bold uppercase text-[11px]">Platform & Handling Fees</span>
              <span className="font-black">₹{data.fees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 pt-4">
              <span className="text-caption">Total Non-Inventory Income</span>
              <span className="text-heading-3">₹{(data.gst + data.fees).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
