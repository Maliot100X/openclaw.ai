'use client';

export default function MorePage() {
  return (
    <div className="p-4 space-y-6 pb-24">
      <h1 className="text-2xl font-bold">More</h1>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">About Forgecast</h2>
        <p className="text-sm text-muted-foreground">
          Forgecast is a Farcaster Mini App built on Base.
        </p>
      </div>
    </div>
  );
}
