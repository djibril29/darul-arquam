"use client";

import { useEffect } from "react";
import gsap from "gsap";

const INTERACTIVE_SELECTOR = "button, a, [role='button']";

function findInteractiveTarget(node: EventTarget | null): HTMLElement | null {
  if (!(node instanceof Element)) return null;
  const el = node.closest<HTMLElement>(INTERACTIVE_SELECTOR);
  if (!el || el.getAttribute("aria-disabled") === "true" || (el as HTMLButtonElement).disabled) {
    return null;
  }
  return el;
}

function press(el: HTMLElement) {
  gsap.killTweensOf(el);
  gsap.to(el, { scale: 0.96, duration: 0.12, ease: "power2.out" });
}

function release(el: HTMLElement) {
  gsap.killTweensOf(el);
  gsap.to(el, { scale: 1, duration: 0.2, ease: "power2.out" });
}

/**
 * Retour tactile global : applique un léger effet d'appui (GSAP) à tout
 * bouton/lien de l'app, sans avoir à instrumenter chaque composant un par un.
 */
export function ClickFeedback() {
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = findInteractiveTarget(e.target);
      if (el) press(el);
    };
    const onPointerUp = (e: PointerEvent) => {
      const el = findInteractiveTarget(e.target);
      if (el) release(el);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("pointerleave", onPointerUp, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("pointerleave", onPointerUp, true);
    };
  }, []);

  return null;
}
