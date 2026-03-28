"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function usePageAnimation() {
  const pathname = usePathname();

  useEffect(() => {
    // Dynamically import gsap to avoid SSR issues
    import("gsap").then(({ gsap }) => {
      gsap.from(".card-stat", {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.4,
        ease: "power2.out",
        clearProps: "all",
      });
      gsap.from(".card:not(.card-stat)", {
        opacity: 0,
        y: 16,
        stagger: 0.06,
        duration: 0.35,
        ease: "power2.out",
        clearProps: "all",
      });
    });
  }, [pathname]);
}

export function useStatCountUp(targetValue: number, selector: string) {
  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetValue,
        duration: 1.2,
        ease: "power2.out",
        snap: { val: 1 },
        onUpdate() {
          el.textContent = String(Math.round(obj.val));
        },
      });
    });
  }, [targetValue, selector]);
}
