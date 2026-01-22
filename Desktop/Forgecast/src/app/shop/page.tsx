'use client';

import React from 'react';
import BottomNav from '@/components/BottomNav';
import { ShoppingBag, Star, Package } from 'lucide-react';

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-background pb-20 text-foreground font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="text-primary" size={24} />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Platform
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        
        {/* Fees Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Fees</h2>
          <div className="bg-card border border-border rounded-xl p-4">
             <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Star size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Sign-In Fee</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    A small platform fee is required to verify identity and prevent spam.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-foreground">$0.20</span>
                    <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">ETH equivalent</span>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* Boosts Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Boosts</h2>
          
          <div className="grid grid-cols-1 gap-3">
            {/* 1 Hour Boost */}
            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-medium">1 Hour Boost</h3>
                  <p className="text-xs text-muted-foreground">Top of feed for 1h</p>
                </div>
              </div>
              <button className="bg-secondary hover:bg-secondary/90 text-white text-xs font-bold px-4 py-2 rounded-lg">
                $5.00
              </button>
            </div>

            {/* 24 Hour Boost */}
            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500">
                  <Rocket size={20} />
                </div>
                <div>
                  <h3 className="font-medium">24 Hour Boost</h3>
                  <p className="text-xs text-muted-foreground">Top of feed for 24h</p>
                </div>
              </div>
              <button className="bg-secondary hover:bg-secondary/90 text-white text-xs font-bold px-4 py-2 rounded-lg">
                $50.00
              </button>
            </div>
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  );
}
