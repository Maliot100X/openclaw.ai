'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import BottomNav from '@/components/navigation/BottomNav'
import BotPopup from '@/components/bot/BotPopup'
import HomeTab from '@/components/tabs/HomeTab'
import TokensTab from '@/components/tabs/TokensTab'
import LeaderboardTab from '@/components/tabs/LeaderboardTab'
import ShopTab from '@/components/tabs/ShopTab'
import ProfileTab from '@/components/tabs/ProfileTab'
import MoreSheet from '@/components/navigation/MoreSheet'
import type { MainTab } from '@/types'

export default function Home() {
  const [activeTab, setActiveTab] = useState<MainTab>('home')
  const [showMore, setShowMore] = useState(false)
  const [showBot, setShowBot] = useState(false)

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />
      case 'tokens':
        return <TokensTab />
      case 'leaderboard':
        return <LeaderboardTab />
      case 'shop':
        return <ShopTab />
      case 'profile':
        return <ProfileTab />
      default:
        return <HomeTab />
    }
  }

  return (
    <main className="min-h-screen min-h-dvh bg-claw-darker">
      {/* Tab Content */}
      <div className="tab-content">
        <AnimatePresence mode="wait">
          {renderTab()}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onMorePress={() => setShowMore(true)}
      />

      {/* More Sheet */}
      <MoreSheet
        isOpen={showMore}
        onClose={() => setShowMore(false)}
      />

      {/* AI Bot Popup Button */}
      <button
        onClick={() => setShowBot(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-gradient-to-br from-claw-primary to-claw-secondary rounded-full shadow-lg shadow-claw-primary/40 flex items-center justify-center animate-pulse-glow"
      >
        <span className="text-2xl">🤖</span>
      </button>

      {/* Bot Popup */}
      <BotPopup
        isOpen={showBot}
        onClose={() => setShowBot(false)}
      />
    </main>
  )
}
