// SDK initialization - fires readiness signal IMMEDIATELY
// This must run BEFORE React hydration to pass Base Mini App validation
import sdk from '@farcaster/frame-sdk'

if (typeof window !== 'undefined') {
  // Signal ready IMMEDIATELY - don't wait for anything
  // This is safe to call multiple times, but earlier is better
  try {
    sdk.actions.ready()
    console.log('[SDK] Readiness signal sent immediately')
  } catch (err) {
    console.error('[SDK] Failed to signal ready:', err)
  }
}

export { }
