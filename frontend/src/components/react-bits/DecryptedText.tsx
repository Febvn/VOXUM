import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface DecryptedTextProps extends HTMLMotionProps<'span'> {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  animateOn?: 'view' | 'hover' | 'click' | 'inViewHover';
  clickMode?: 'once' | 'toggle';
}

export function DecryptedText({
  text,
  speed = 40,
  maxIterations = 10,
  sequential = true,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+~`|}{[]:;?><,./-=',
  className = '',
  encryptedClassName = 'text-emerald-500/50 font-mono',
  parentClassName = '',
  animateOn = 'hover',
  clickMode = 'once',
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);

  const containerRef = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<any>(null);

  const shuffleText = useCallback(
    (originalText: string, currentRevealed: Set<number>) => {
      const chars = useOriginalCharsOnly
        ? Array.from(new Set(originalText)).join('')
        : characters;

      return originalText
        .split('')
        .map((char, index) => {
          if (char === ' ' || currentRevealed.has(index)) {
            return char;
          }
          const randomIndex = Math.floor(Math.random() * chars.length);
          return chars[randomIndex];
        })
        .join('');
    },
    [characters, useOriginalCharsOnly]
  );

  const triggerDecrypt = useCallback(() => {
    setIsAnimating(true);
    setRevealedIndices(new Set());
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    let iteration = 0;
    const currentIndices = new Set<number>();

    intervalRef.current = setInterval(() => {
      if (sequential) {
        if (currentIndices.size < text.length) {
          const nextIndex =
            revealDirection === 'start'
              ? currentIndices.size
              : revealDirection === 'end'
              ? text.length - 1 - currentIndices.size
              : Math.floor(text.length / 2) +
                (currentIndices.size % 2 === 0 ? 1 : -1) *
                  Math.ceil(currentIndices.size / 2);

          currentIndices.add(Math.max(0, Math.min(text.length - 1, nextIndex)));
          setRevealedIndices(new Set(currentIndices));
          setDisplayText(shuffleText(text, currentIndices));
        } else {
          clearInterval(intervalRef.current);
          setIsAnimating(false);
          setDisplayText(text);
        }
      } else {
        iteration++;
        setDisplayText(shuffleText(text, new Set()));
        if (iteration >= maxIterations) {
          clearInterval(intervalRef.current);
          setIsAnimating(false);
          setDisplayText(text);
        }
      }
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [isAnimating, text, speed, sequential, revealDirection, shuffleText, maxIterations]);

  useEffect(() => {
    if (animateOn === 'view' && !hasAnimated) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            triggerDecrypt();
            setHasAnimated(true);
          }
        },
        { threshold: 0.1 }
      );

      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [animateOn, hasAnimated, triggerDecrypt]);

  return (
    <motion.span
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap cursor-default ${parentClassName}`}
      onMouseEnter={() => {
        if (animateOn === 'hover' || animateOn === 'inViewHover') {
          triggerDecrypt();
        }
      }}
      onClick={() => {
        if (animateOn === 'click') {
          triggerDecrypt();
        }
      }}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => {
          const isRevealed = revealedIndices.has(index) || !isAnimating;
          return (
            <span key={index} className={isRevealed ? className : encryptedClassName}>
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}

export default DecryptedText;

