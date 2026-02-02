// SDK initialization - fires readiness signal IMMEDIATELY
// This must run BEFORE React hydration to pass Base Mini App validation
import sdk from '@farcaster/frame-sdk'

if (typeof window !== 'undefined') {
  // Signal ready IMMEDIATELY - Critical for Base Mini App validation
  try {
    sdk.actions.ready()
    console.log('[SDK] Readiness signal sent immediately')

    // Safety backup: Send again after a short delay to ensure it's caught
    setTimeout(() => {
      sdk.actions.ready()
      console.log('[SDK] Readiness backup signal sent')
    }, 500)
  } catch (err) {
    console.error('[SDK] Failed to signal ready:', err)
  }
}

export { }
