'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/miniapp-sdk';

type FrameContext = Awaited<typeof sdk.context>;

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();

  useEffect(() => {
    const load = async () => {
      setContext(await sdk.context);
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return <>{children}</>;
}
