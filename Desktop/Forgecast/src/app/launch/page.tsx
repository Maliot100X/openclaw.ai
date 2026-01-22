'use client';

import { Rocket, Upload } from 'lucide-react';

export default function LaunchPage() {
  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-primary/10 rounded-full">
          <Rocket className="text-primary" size={24} />
        </div>
        <h1 className="text-2xl font-bold">Launch Token</h1>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Token Name</label>
            <input 
              type="text" 
              placeholder="e.g. Based Pup" 
              className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Ticker Symbol</label>
            <input 
              type="text" 
              placeholder="e.g. PUP" 
              className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Initial Supply</label>
            <input 
              type="number" 
              placeholder="1,000,000,000" 
              className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Token Image</label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
              <Upload size={24} className="mb-2" />
              <span className="text-sm">Tap to upload image</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            <strong>Phase 1 Preview:</strong> Contract deployment is currently disabled. Wallet integration is active for testing.
          </p>
        </div>

        <button 
          disabled
          className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-bold text-lg opacity-50 cursor-not-allowed"
        >
          Launch Token (Soon)
        </button>
      </div>
    </div>
  );
}
