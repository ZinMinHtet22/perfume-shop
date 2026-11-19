"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "characters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, number> | null;
  animationTo?: Record<string, number> | null;
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
};

const BlurText = ({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom = null,
  animationTo = null,
  easing,
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [inView, setInView] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- respect prefers-reduced-motion immediately
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, reduceMotion]);

  if (reduceMotion) {
    return (
      <p ref={ref} className={className}>
        {text}
      </p>
    );
  }

  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const fromSnap = animationFrom ?? {
    filter: "blur(10px)",
    opacity: 0,
    y: direction === "top" ? -50 : 50,
  };
  const toSnap = animationTo ?? {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
  };

  return (
    <p
      ref={ref}
      aria-label={text}
      className={className}
      style={{ display: "flex", flexWrap: "wrap", columnGap: "0.28em" }}
    >
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          className="inline-block"
          style={{ willChange: "transform, filter, opacity" }}
          initial={fromSnap}
          animate={inView ? toSnap : fromSnap}
          transition={{
            duration: stepDuration,
            ease: easing ?? "easeOut",
            delay: (index * delay) / 1000,
          }}
          onAnimationComplete={
            inView && index === elements.length - 1 ? onAnimationComplete : undefined
          }
        >
          {segment}
        </motion.span>
      ))}
    </p>
  );
};

export default BlurText;
