'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, Info, Github, Share2, Gift, Palette, Settings } from 'lucide-react'
import { useState } from 'react'
import HoldingsView from '@/components/views/HoldingsView'
import AboutView from '@/components/views/AboutView'
import ShareEarnTab from '@/components/tabs/ShareEarnTab'
import PointsTab from '@/components/tabs/PointsTab'
import SkinsTab from '@/components/tabs/SkinsTab'

interface MoreSheetProps {
  isOpen: boolean
  onClose: () => void
}

type MoreView = 'menu' | 'holdings' | 'about' | 'github' | 'share' | 'points' | 'skins'

const menuItems = [
  { id: 'holdings', label: 'Holdings', icon: Wallet, description: 'View your tokens & boosted coins' },
  { id: 'about', label: 'About', icon: Info, description: 'Learn about ClawAI King' },
  { id: 'github', label: 'GitHub', icon: Github, description: 'View source code', external: true },
]

const featureItems = [
  { id: 'share', label: 'Share & Earn', icon: Share2, description: 'Complete tasks to earn points' },
  { id: 'points', label: 'Points Shop', icon: Gift, description: 'Redeem your earned points' },
  { id: 'skins', label: 'Skins', icon: Palette, description: 'Customize your profile' },
]

export default function MoreSheet({ isOpen, onClose }: MoreSheetProps) {
  const [currentView, setCurrentView] = useState<MoreView>('menu')

  const handleBack = () => {
    setCurrentView('menu')
  }

  const handleClose = () => {
    setCurrentView('menu')
    onClose()
  }

  const handleItemClick = (id: string, external?: boolean) => {
    if (external && id === 'github') {
      window.open('https://github.com/Maliot100X/openclaw.ai', '_blank')
      return
    }
    setCurrentView(id as MoreView)
  }

  const renderContent = () => {
    switch (currentView) {
      case 'holdings':
        return <HoldingsView onBack={handleBack} />
      case 'about':
        return <AboutView onBack={handleBack} />
      case 'share':
        return <ShareEarnTab onBack={handleBack} />
      case 'points':
        return <PointsTab onBack={handleBack} />
      case 'skins':
        return <SkinsTab onBack={handleBack} />
      default:
        return (
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">More</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id, item.external)}
                    className="w-full card-hover flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-claw-primary/20 flex items-center justify-center">
                      <Icon size={24} className="text-claw-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-3">Features</p>
              <div className="space-y-3">
                {featureItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className="w-full card-hover flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-claw-primary/20 to-claw-secondary/20 flex items-center justify-center">
                        <Icon size={24} className="text-claw-secondary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{item.label}</p>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-claw-dark rounded-t-3xl max-h-[90vh] overflow-auto"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
            </div>

            {renderContent()}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
