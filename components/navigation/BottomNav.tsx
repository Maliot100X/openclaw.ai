'use client'

import { motion } from 'framer-motion'
import { Home, Coins, Trophy, ShoppingBag, User, MoreHorizontal } from 'lucide-react'
import type { MainTab } from '@/types'

interface BottomNavProps {
  activeTab: MainTab
  onTabChange: (tab: MainTab) => void
  onMorePress: () => void
}

const tabs: { id: MainTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tokens', label: 'Tokens', icon: Coins },
  { id: 'leaderboard', label: 'Ranks', icon: Trophy },
  { id: 'shop', label: 'Shop', icon: ShoppingBag },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function BottomNav({ activeTab, onTabChange, onMorePress }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10">
      <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-claw-primary/20 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon
                size={24}
                className={`transition-colors duration-200 ${
                  isActive ? 'text-claw-primary' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-xs mt-1 transition-colors duration-200 ${
                  isActive ? 'text-claw-primary font-medium' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
        
        {/* More Button */}
        <button
          onClick={onMorePress}
          className="flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200"
        >
          <MoreHorizontal size={24} className="text-gray-400" />
          <span className="text-xs mt-1 text-gray-400">More</span>
        </button>
      </div>
    </nav>
  )
}
