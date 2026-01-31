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
  '🦀 Hey! Welcome!',
  '💪 Boost now!',
  '🌟 Shine bright!',
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
      }, 12000) // 12 seconds to walk across
    }

    // Initial show after 5 seconds for testing (user can see it quickly)
    const initialTimer = setTimeout(showCrab, 5000)
    
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
          x: startFromLeft ? -150 : '100vw',
          opacity: 1
        }}
        animate={{ 
          x: startFromLeft ? '100vw' : -150,
        }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 12,
          ease: 'linear'
        }}
        className="fixed z-[9999] pointer-events-none"
        style={{ bottom: 120 }}
      >
        <div className="relative">
          {/* Speech bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div className="bg-gradient-to-r from-claw-primary to-claw-secondary px-5 py-2.5 rounded-full text-base font-bold shadow-xl shadow-claw-primary/50 border border-white/20">
              {message}
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-claw-primary rotate-45" />
          </motion.div>
          
          {/* Crab emoji with walking animation */}
          <motion.div
            animate={{ 
              rotate: [0, -10, 0, 10, 0],
              y: [0, -8, 0, -8, 0]
            }}
            transition={{ 
              duration: 0.35,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="drop-shadow-2xl filter"
            style={{ 
              fontSize: '80px',
              transform: startFromLeft ? 'scaleX(1)' : 'scaleX(-1)',
              textShadow: '0 4px 20px rgba(255, 120, 50, 0.5)'
            }}
          >
            🦀
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
