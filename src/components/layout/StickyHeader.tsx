"use client";

export default function StickyHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="sticky top-0 z-50 w-full">{children}</div>;
}
