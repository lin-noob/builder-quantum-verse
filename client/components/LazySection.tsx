import React, { useState, useRef, useEffect } from "react";

interface LazySectionProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  placeholder?: React.ReactNode;
}

export default function LazySection({
  children,
  className = "",
  threshold = 0.1,
  placeholder,
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={className}>
      {isVisible
        ? children
        : placeholder || (
            <div className="h-96 bg-gray-50 animate-pulse rounded-lg" />
          )}
    </div>
  );
}
