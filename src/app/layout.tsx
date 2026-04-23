import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AccountProvider } from "@/context/AccountContext";
import { UIProvider } from "@/context/UIContext";
import Footer from "@/components/Footer";
import Overlays from "@/components/Overlays";

export const metadata: Metadata = {
  title: "LOUD | Quick Commerce Enterprise",
  description: "Elite 10-minute delivery warehouse ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased no-scrollbar">
        <UIProvider>
          <AccountProvider>
            <CartProvider>
              {children}
              <Footer />
              <Overlays />
            </CartProvider>
          </AccountProvider>
        </UIProvider>
      </body>
    </html>
  );
}
