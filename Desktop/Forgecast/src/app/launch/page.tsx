'use client';

import React, { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { Rocket, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LaunchPage() {
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    supply: '',
    description: ''
  });
  const [errors, setErrors] = useState<{name?: string; ticker?: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: {name?: string; ticker?: string} = {};
    if (!formData.name.trim()) newErrors.name = 'Token name is required';
    if (!formData.ticker.trim()) newErrors.ticker = 'Ticker symbol is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Phase 6: Connect to Real Transaction
      console.log("Submitting transaction...", formData);
      // Placeholder for actual writeContract call
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Rocket className="text-primary" size={24} />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Launch
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-1">Create Token</h2>
          <p className="text-sm text-muted-foreground mb-6">Deploy a new ERC-20 token on Zora</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Token Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex justify-between">
                Token Name
                {errors.name && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={10} /> {errors.name}</span>}
              </label>
              <input 
                type="text" 
                placeholder="e.g. Based Pup" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${errors.name ? 'border-red-500 focus:ring-red-500/30' : 'border-input'}`}
              />
            </div>

            {/* Ticker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex justify-between">
                Ticker Symbol
                {errors.ticker && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={10} /> {errors.ticker}</span>}
              </label>
              <input 
                type="text" 
                placeholder="e.g. PUP" 
                value={formData.ticker}
                onChange={(e) => setFormData({...formData, ticker: e.target.value.toUpperCase()})}
                className={`w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase transition-all ${errors.ticker ? 'border-red-500 focus:ring-red-500/30' : 'border-input'}`}
                maxLength={6}
              />
            </div>

            {/* Supply */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Total Supply</label>
              <input 
                type="number" 
                placeholder="e.g. 1000000" 
                value={formData.supply}
                onChange={(e) => setFormData({...formData, supply: e.target.value})}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Image Upload Placeholder */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Token Image</label>
              <div className="border-2 border-dashed border-input hover:border-primary/50 rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-secondary/5">
                <Upload size={24} className="mb-2" />
                <span className="text-xs">Tap to upload image</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>Launching...</>
              ) : (
                <>Launch Token <Rocket size={18} /></>
              )}
            </button>
          </form>
        </div>
        
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Deploying on Zora Network • Base Mainnet</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
