'use client';

import React, { useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function MainTemplate({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      // Smooth page transition
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 12,
        duration: 0.35,
        ease: 'power2.out',
        clearProps: 'all',
      });
    },
    { dependencies: [pathname], scope: containerRef, revertOnUpdate: true }
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col will-change-transform"
    >
      {children}
    </div>
  );
}
