'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, TrendingUp, Sparkles, Loader2, ChevronDown } from 'lucide-react'
import type { BotMessage, BotMode } from '@/types'

interface BotPopupProps {
  isOpen: boolean
  onClose: () => void
}

const botModes: { id: BotMode; name: string; icon: typeof Bot; description: string }[] = [
  { id: 'openclaw', name: 'OpenClaw AI', icon: Sparkles, description: 'Crypto & Farcaster help' },
  { id: 'market', name: 'Market Intel', icon: TrendingUp, description: 'Real-time market data' },
]

export default function BotPopup({ isOpen, onClose }: BotPopupProps) {
  const [mode, setMode] = useState<BotMode>('openclaw')
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [messages, setMessages] = useState<BotMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey! 🦀 I'm OpenClaw AI, your crypto companion. Ask me about tokens, Farcaster, boosting, or anything else!",
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: BotMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          mode,
          history: messages.slice(-10), // Last 10 messages for context
        }),
      })

      const data = await response.json()

      const botMessage: BotMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "Sorry, I couldn't process that. Please try again!",
        provider: data.provider,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage: BotMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! Something went wrong. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
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
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <button
                    onClick={() => setShowModeSelector(!showModeSelector)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <CurrentIcon size={20} className="text-claw-primary" />
                    <span className="font-medium">{currentMode.name}</span>
                    <ChevronDown size={16} className={`transition-transform ${showModeSelector ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Mode Selector Dropdown */}
                  <AnimatePresence>
                    {showModeSelector && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-claw-darker rounded-xl border border-white/10 shadow-xl overflow-hidden z-10"
                      >
                        {botModes.map((m) => {
                          const Icon = m.icon
                          return (
                            <button
                              key={m.id}
                              onClick={() => {
                                setMode(m.id)
                                setShowModeSelector(false)
                              }}
                              className={`w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors ${
                                mode === m.id ? 'bg-claw-primary/20' : ''
                              }`}
                            >
                              <Icon size={20} className="text-claw-primary" />
                              <div className="text-left">
                                <p className="font-medium">{m.name}</p>
                                <p className="text-xs text-gray-400">{m.description}</p>
                              </div>
                            </button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

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
                  placeholder={`Ask ${currentMode.name}...`}
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
                Powered by multi-AI fallback system
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
