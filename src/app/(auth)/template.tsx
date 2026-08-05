'use client';

import React, { useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function AuthTemplate({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      // Subtle auth page transition
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 8,
        duration: 0.35,
        ease: 'power2.out',
        clearProps: 'transform',
      });
    },
    { dependencies: [pathname], scope: containerRef }
  );

  return (
    <div ref={containerRef} className="will-change-transform w-full min-h-screen flex flex-col">
      {children}
    </div>
  );
}
