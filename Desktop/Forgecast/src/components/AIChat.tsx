'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Loader2, HelpCircle } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ZORA_FACTORY_ABI } from '@/lib/chain/abi';

// Zora Factory Address on Base
const FACTORY_ADDRESS = '0x777777751622c0d3258f214F9DF38E35BF45baF3';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'coin-list' | 'error' | 'transaction';
  data?: any;
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your Forgecast AI Agent. I can help you explore the Zora chain. Try asking for "recent coins", "my holdings", or "help".',
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();

  // Wagmi hooks for writing to contract
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Watch for transaction success
  useEffect(() => {
    if (isConfirmed && hash) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Success! Coin deployed. Transaction Hash: ${hash}`,
        type: 'text'
      }]);
      setIsLoading(false);
    }
  }, [isConfirmed, hash]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const lowerInput = userMessage.content.toLowerCase();
      let response: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        type: 'text'
      };

      if (lowerInput.includes('help')) {
        response.content = "Here's what I can do:\n- 'recent': Show recently created coins\n- 'holdings': Show your token holdings\n- 'create [name] [ticker]': Deploy a new coin on Zora (Base)\n- 'status': Check system status";
      } 
      else if (lowerInput.includes('recent') || lowerInput.includes('new coins')) {
        try {
          const res = await fetch('/api/zora/recent');
          const data = await res.json();
          if (data.coins && data.coins.length > 0) {
            response.content = "Here are the most recent coins launched on Zora:";
            response.type = 'coin-list';
            response.data = data.coins.slice(0, 5);
          } else {
            response.content = "I couldn't find any recent coins at the moment.";
          }
        } catch (error) {
          response.content = "Failed to fetch recent coins. Please try again.";
          response.type = 'error';
        }
      } 
      else if (lowerInput.includes('holdings') || lowerInput.includes('my coins')) {
        if (!isConnected || !address) {
          response.content = "Please connect your wallet first to view your holdings.";
        } else {
          try {
            const res = await fetch(`/api/zora/holdings?address=${address}`); 
            const data = await res.json();
            if (data.holdings && data.holdings.length > 0) {
              response.content = "Here are your current holdings:";
              response.type = 'coin-list'; 
              response.data = data.holdings;
            } else {
              response.content = "You don't seem to have any Zora coins yet.";
            }
          } catch (error) {
            response.content = "Failed to fetch holdings. Please try again.";
            response.type = 'error';
          }
        }
      }
      else if (lowerInput.startsWith('create')) {
        const parts = userMessage.content.split(' ');
        if (parts.length >= 3) {
          const name = parts[1];
          const ticker = parts[2];
          
          if (!isConnected) {
            response.content = "Please connect your wallet to deploy a coin.";
          } else {
             // Phase 5: Real Transaction Logic
             try {
                writeContract({
                  address: FACTORY_ADDRESS,
                  abi: ZORA_FACTORY_ABI,
                  functionName: 'deploy',
                  args: [name, ticker.toUpperCase(), 1000000n], // Default 1M supply
                });
                
                response.content = `Initiating deployment for ${name} ($${ticker.toUpperCase()})... Please confirm in your wallet.`;
                // Don't set isLoading to false here, wait for tx
             } catch (err) {
                console.error(err);
                response.content = "Failed to initiate transaction.";
                response.type = 'error';
             }
          }
        } else {
          response.content = "Usage: create [name] [ticker]";
        }
      }
      else {
        response.content = "I didn't understand that command. Type 'help' to see what I can do.";
      }

      setMessages(prev => [...prev, response]);
      if (response.type !== 'transaction' && !lowerInput.startsWith('create')) {
         setIsLoading(false);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error processing your request.",
        type: 'error'
      }]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-secondary/5 border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-secondary/10 p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-primary" />
          <span className="font-semibold text-sm">Forgecast AI</span>
        </div>
        <div className="flex items-center gap-2">
          {isPending || isConfirming ? (
             <div className="flex items-center gap-1 text-xs text-yellow-500">
               <Loader2 size={12} className="animate-spin" />
               Processing
             </div>
          ) : (
            <div className="text-xs text-muted-foreground bg-secondary/20 px-2 py-1 rounded-full">
              Phase 5
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[85%] rounded-lg p-3 text-sm
                ${msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-br-none' 
                  : 'bg-card border border-border text-card-foreground rounded-bl-none'}
              `}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              
              {msg.type === 'coin-list' && msg.data && (
                <div className="mt-2 space-y-2">
                  {msg.data.map((coin: any, idx: number) => (
                    <div key={idx} className="bg-background/50 p-2 rounded border border-border/50 text-xs">
                      <div className="font-bold">{coin.name} <span className="opacity-70">({coin.symbol})</span></div>
                      <div className="text-muted-foreground truncate">{coin.address}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border p-3 rounded-lg rounded-bl-none">
              <Loader2 size={16} className="animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-card border-t border-border flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          className="flex-1 bg-secondary/10 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={isLoading || isPending || isConfirming}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim() || isPending || isConfirming}
          className="bg-primary text-primary-foreground p-2 rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
