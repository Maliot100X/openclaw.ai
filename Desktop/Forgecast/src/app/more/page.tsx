'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Loader2 } from 'lucide-react';

export default function MorePage() {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">More</h1>
      
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Wallet Status</h2>
        
        {isConnecting ? (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="animate-spin" size={16} />
            <span>Connecting...</span>
          </div>
        ) : isConnected ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Connected Address</p>
              <p className="font-mono text-sm break-all">{address}</p>
            </div>
            <button
              onClick={() => disconnect()}
              className="px-4 py-2 text-sm font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Not connected</p>
            <div className="flex flex-col gap-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors text-left"
                >
                  Connect {connector.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">About Forgecast</h2>
        <p className="text-sm text-muted-foreground">
          Forgecast is a Farcaster Mini App built on Base.
        </p>
      </div>
    </div>
  );
}
