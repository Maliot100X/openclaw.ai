'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const CRAB_MESSAGES = [
  '🦀 Boost your coin!',
  '🚀 Try boosting!',
  '👋 Hey there!',
  '💰 Time to boost?',
  '⭐ Get featured!',
  '🔥 Go viral!',
  '🏆 Top the charts!',
  '🦀 ClawKing time!',
  '💎 HODL strong!',
  '📈 Moon soon?',
]

export default function WalkingCrab() {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [startFromLeft, setStartFromLeft] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Show crab function
    const showCrab = () => {
      // Random message
      const randomMessage = CRAB_MESSAGES[Math.floor(Math.random() * CRAB_MESSAGES.length)]
      setMessage(randomMessage)
      
      // Random starting side
      setStartFromLeft(Math.random() > 0.5)
      
      setIsVisible(true)
      
      // Hide after walking across
      setTimeout(() => {
        setIsVisible(false)
      }, 10000) // 10 seconds to walk across
    }

    // Initial show after 10 seconds (faster for demo)
    const initialTimer = setTimeout(showCrab, 10000)
    
    // Then every 5 minutes
    const interval = setInterval(showCrab, 5 * 60 * 1000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [mounted])

  if (!mounted || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        key="walking-crab"
        initial={{ 
          x: startFromLeft ? -120 : '100vw',
          opacity: 1
        }}
        animate={{ 
          x: startFromLeft ? '100vw' : -120,
        }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 10,
          ease: 'linear'
        }}
        className="fixed z-[100] pointer-events-none"
        style={{ bottom: 100 }}
      >
        <div className="relative">
          {/* Speech bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div className="bg-gradient-to-r from-claw-primary to-claw-secondary px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-claw-primary/50">
              {message}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-claw-primary rotate-45" />
          </motion.div>
          
          {/* Crab emoji with walking animation */}
          <motion.div
            animate={{ 
              rotate: [0, -8, 0, 8, 0],
              y: [0, -5, 0, -5, 0]
            }}
            transition={{ 
              duration: 0.4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="text-6xl drop-shadow-lg"
            style={{ transform: startFromLeft ? 'scaleX(1)' : 'scaleX(-1)' }}
          >
            🦀
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
