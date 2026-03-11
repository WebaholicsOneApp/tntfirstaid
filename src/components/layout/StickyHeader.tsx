'use client';

export default function StickyHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {children}
    </div>
  );
}
