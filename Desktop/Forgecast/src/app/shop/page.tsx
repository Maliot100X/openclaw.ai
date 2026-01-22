'use client';

import React from 'react';
import BottomNav from '@/components/BottomNav';
import { ShoppingBag, Star, Package } from 'lucide-react';

export default function ShopPage() {
  const shopItems = [
    {
      id: 1,
      name: 'Forgecast Hoodie',
      price: '0.05 ETH',
      image: '👕',
      description: 'Limited edition developer hoodie.'
    },
    {
      id: 2,
      name: 'Early Access Pass',
      price: '0.01 ETH',
      image: '🎫',
      description: 'Get early access to Phase 5 features.'
    },
    {
      id: 3,
      name: 'Digital Sticker Pack',
      price: '0.001 ETH',
      image: '✨',
      description: 'Use these in your Farcaster casts.'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="text-primary" size={24} />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Shop
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Fee Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 w-full flex items-start gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-full text-yellow-500 mt-1">
            <Star size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-yellow-500 mb-1">Coming Soon</h3>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              A <strong>$0.20 platform sign-in fee</strong> will be required for full shop access in Phase 4.
            </p>
          </div>
        </div>

        {/* Featured Items */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package size={20} />
            Featured Items
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            {shopItems.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-secondary/30 rounded-lg flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {item.image}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-primary font-bold">{item.price}</span>
                    <button className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs px-3 py-1 rounded-full transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
