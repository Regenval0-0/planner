import type { ReactNode } from 'react';

interface SlideProps {
  title: string;
  children: ReactNode;
  slideNumber: number;
  totalSlides: number;
}

export default function Slide({ title, children, slideNumber, totalSlides }: SlideProps) {
  return (
    <div className="slide-container animate-fadeIn">
      <h1 className="slide-title">{title}</h1>
      <div className="slide-content">{children}</div>
      <div className="slide-number">{slideNumber} / {totalSlides}</div>
    </div>
  );
}
