'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, TrendingUp, Sparkles, Loader2, ChevronDown, Settings } from 'lucide-react'
import type { BotMessage, BotMode } from '@/types'

interface BotPopupProps {
  isOpen: boolean
  onClose: () => void
}

const botModes: { id: BotMode; name: string; icon: typeof Bot; description: string; welcomeMessage: string }[] = [
  { 
    id: 'openclaw', 
    name: 'OpenClaw AI', 
    icon: Sparkles, 
    description: 'Crypto & Farcaster help',
    welcomeMessage: "Hey! 🦀 I'm OpenClaw AI, your crypto companion. Ask me about tokens, Farcaster, boosting, or anything else!"
  },
  { 
    id: 'market', 
    name: 'Market Intel', 
    icon: TrendingUp, 
    description: 'Real-time market data & signals',
    welcomeMessage: "📊 Market Intel here! I can fetch real-time stock and crypto data via AlphaVantage. Try asking about $NVDA, $BTC, or any ticker!"
  },
]

// Initialize separate chat histories for each mode
const initialChats: Record<BotMode, BotMessage[]> = {
  openclaw: [
    {
      id: 'oc-1',
      role: 'assistant',
      content: botModes[0].welcomeMessage,
      timestamp: new Date().toISOString(),
    },
  ],
  market: [
    {
      id: 'mi-1',
      role: 'assistant',
      content: botModes[1].welcomeMessage,
      timestamp: new Date().toISOString(),
    },
  ],
}

export default function BotPopup({ isOpen, onClose }: BotPopupProps) {
  const [mode, setMode] = useState<BotMode>('openclaw')
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // SEPARATE chat histories for each mode
  const [chatHistories, setChatHistories] = useState<Record<BotMode, BotMessage[]>>(initialChats)
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get current mode's messages
  const messages = chatHistories[mode]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: BotMessage = {
      id: `${mode}-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    // Add message to current mode's history
    setChatHistories(prev => ({
      ...prev,
      [mode]: [...prev[mode], userMessage]
    }))
    
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          mode,
          history: chatHistories[mode].slice(-10), // Last 10 messages of this mode
        }),
      })

      const data = await response.json()

      const botMessage: BotMessage = {
        id: `${mode}-${Date.now() + 1}`,
        role: 'assistant',
        content: data.response || "Sorry, I couldn't process that. Please try again!",
        provider: data.provider,
        timestamp: new Date().toISOString(),
      }

      setChatHistories(prev => ({
        ...prev,
        [mode]: [...prev[mode], botMessage]
      }))
    } catch (error) {
      const errorMessage: BotMessage = {
        id: `${mode}-${Date.now() + 1}`,
        role: 'assistant',
        content: "Oops! Something went wrong. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      }
      setChatHistories(prev => ({
        ...prev,
        [mode]: [...prev[mode], errorMessage]
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const currentMode = botModes.find((m) => m.id === mode)!
  const CurrentIcon = currentMode.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:bottom-24 md:right-4 md:w-96 md:h-[500px] bg-claw-dark rounded-2xl z-50 flex flex-col shadow-2xl border border-white/10 overflow-hidden"
          >
            {/* Header with Mode Tabs */}
            <div className="border-b border-white/10">
              {/* Mode Tabs */}
              <div className="flex">
                {botModes.map((m) => {
                  const Icon = m.icon
                  const isActive = mode === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all ${
                        isActive 
                          ? 'bg-claw-primary/20 border-b-2 border-claw-primary' 
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-claw-primary' : 'text-gray-400'} />
                      <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {m.name}
                      </span>
                    </button>
                  )
                })}
              </div>
              
              {/* Header Bar */}
              <div className="flex items-center justify-between px-4 py-2">
                <p className="text-xs text-gray-400">{currentMode.description}</p>
                <div className="flex items-center gap-2">
                  {mode === 'market' && (
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                      title="Auto-posting settings"
                    >
                      <Settings size={16} className="text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Market Intel Settings Panel */}
            <AnimatePresence>
              {showSettings && mode === 'market' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-white/10 overflow-hidden"
                >
                  <div className="p-4 bg-claw-darker/50">
                    <h4 className="text-sm font-medium mb-3">Auto-Post Settings</h4>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Post signals to Farcaster</span>
                        <input type="checkbox" className="rounded" disabled />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Post signals to Twitter</span>
                        <input type="checkbox" className="rounded" disabled />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Post signals to Telegram</span>
                        <input type="checkbox" className="rounded" disabled />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Connect accounts in Profile tab first</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-claw-primary text-white'
                        : 'bg-white/10'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.provider && (
                      <p className="text-xs text-gray-400 mt-1 text-right">
                        via {message.provider}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 rounded-2xl px-4 py-3">
                    <Loader2 size={20} className="animate-spin text-claw-primary" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={mode === 'market' ? 'Ask about $NVDA, $BTC...' : `Ask ${currentMode.name}...`}
                  className="flex-1 px-4 py-3 bg-claw-darker border border-white/10 rounded-xl focus:outline-none focus:border-claw-primary transition-colors"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-claw-primary rounded-xl hover:bg-claw-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {mode === 'market' ? 'Powered by AlphaVantage + AI fallback' : 'Powered by multi-AI fallback system'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
