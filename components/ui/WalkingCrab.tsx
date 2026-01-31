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
]

export default function WalkingCrab() {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [position, setPosition] = useState({ x: -100, direction: 1 })

  useEffect(() => {
    // Show crab every 5 minutes
    const showCrab = () => {
      // Random message
      const randomMessage = CRAB_MESSAGES[Math.floor(Math.random() * CRAB_MESSAGES.length)]
      setMessage(randomMessage)
      
      // Random starting side (left or right)
      const startFromLeft = Math.random() > 0.5
      setPosition({ 
        x: startFromLeft ? -100 : window.innerWidth + 100, 
        direction: startFromLeft ? 1 : -1 
      })
      
      setIsVisible(true)
      
      // Hide after walking across
      setTimeout(() => {
        setIsVisible(false)
      }, 8000) // 8 seconds to walk across
    }

    // Initial show after 30 seconds
    const initialTimer = setTimeout(showCrab, 30000)
    
    // Then every 5 minutes
    const interval = setInterval(showCrab, 5 * 60 * 1000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ 
          x: position.x,
          y: typeof window !== 'undefined' ? window.innerHeight - 150 : 500
        }}
        animate={{ 
          x: position.direction === 1 
            ? (typeof window !== 'undefined' ? window.innerWidth + 100 : 500) 
            : -100
        }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 8,
          ease: 'linear'
        }}
        className="fixed z-40 pointer-events-none"
        style={{ bottom: 80 }}
      >
        <div className="relative">
          {/* Speech bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div className="bg-claw-primary px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
              {message}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-claw-primary rotate-45" />
          </motion.div>
          
          {/* Crab emoji with walking animation */}
          <motion.div
            animate={{ 
              rotate: [0, -5, 0, 5, 0],
              y: [0, -3, 0, -3, 0]
            }}
            transition={{ 
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="text-5xl"
            style={{ transform: position.direction === -1 ? 'scaleX(-1)' : 'scaleX(1)' }}
          >
            🦀
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
