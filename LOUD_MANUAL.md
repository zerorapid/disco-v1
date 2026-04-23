# LOUD | Operations Manual V5.4
## The Founder-Led Quick Commerce Suite

Congratulations. You have successfully deployed a high-intelligence quick commerce ecosystem. This manual explains how to utilize your new tools to maximize profit and delivery efficiency.

---

### 1. The "Arbitrage Sniper" (Competitive Pricing)
**Location:** `admin.html` -> Inventory Tab
**How it works:**
- When adding or editing a product, you will see fields for **Zepto Price** and **Blinkit Price**.
- Enter the current price of your competitors.
- **The Intelligence:** Your inventory list will now show a **Target Price Badge**.
  - 🟢 **WINNING**: Your price is lower than the competition.
  - 🔴 **OVERPRICED**: You are charging more than Zepto/Blinkit. Adjust your price to reclaim the market gap.

### 2. The "Operational Pulse" (Real-time Monitoring)
**Location:** `admin.html`
**How it works:**
- The Admin panel uses a **Real-time Listener** connected to Supabase.
- **Audible Alerts:** If you leave the Admin panel open on your phone or laptop (ideally with headphones), you will hear a **"Cha-ching" 💰 sound chime** the moment a new order is placed. 
- You no longer need to refresh the page to see new orders.

### 3. The "Bicycle Dispatcher" (Location Intelligence)
**Location:** `admin.html` -> Dispatcher Tab
**How it works:**
- This view plots all **Active Orders** on a heatmap.
- **Orange Hotspots:** Areas with high order density will pulse orange.
- **The Tactical Hub:** LOUD calculates the "Center Point" of all orders and tells you where to park your bicycle for the fastest possible multi-delivery run.

### 4. The "Live Tracker" (Customer Transparency)
**Location:** `admin.html` (Order View) & `track.html`
**How it works:**
- On every order in your Admin panel, there is a **"Copy Tracking Link"** button.
- **The Workflow:** 
  1. Receive Order.
  2. Copy Tracking Link.
  3. Send to Customer via WhatsApp.
- **The Result:** The customer sees a premium, Uber-style status bar (Packing -> Shipped -> Delivered) that updates in real-time as you change the status in your Admin panel.

### 5. The "Frictionless Store"
**Location:** `index.html`
**How it works:**
- **Search Logic:** Customers can search by name, category, or description.
- **Rich Details:** Products show MRP, Discount Price, and Weight (e.g. 500ml/1kg).
- **Checkout:** Integrated UPI payment with mandatory **UTR (Transaction ID) verification**. This ensures you don't dispatch "fake" or "pending" orders.

---

## Technical Summary (The Engine)
- **Frontend:** Vanilla JS + Tailwind CSS (Uber-style Geometric Layout).
- **Backend:** Supabase (PostgreSQL + Real-time).
- **Logic:** Custom "Profit Sniper" algorithm based on competitive pricing inputs.
- **Hosting:** Vercel (Auto-syncing with GitHub).

---

**Founder Note:** Start your run. Test the audible alerts. Trust the heatmap. Move fast. 🚀🚲💰
