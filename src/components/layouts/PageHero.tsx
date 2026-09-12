import React from 'react';

interface PageHeroProps {
  eyebrow?: string;
  eyebrowIcon?: React.ReactNode;
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHero: React.FC<PageHeroProps> = ({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  children,
  className,
}) => {
  return (
    <section
      className={`relative overflow-hidden bg-slate-950 border-b border-slate-800 ${className ?? ''}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.14),transparent_55%)]" />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.15) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse_at_center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse_at_center, black 30%, transparent 75%)',
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/6 text-indigo-300 rounded-full border border-indigo-500/30 text-xs font-semibold w-fit backdrop-blur-md shadow-lg shadow-indigo-500/10">
            {eyebrowIcon}
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mt-4 leading-[1.15]">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
        <div className="w-16 h-1 bg-linear-to-r from-indigo-500 to-violet-500 rounded-full mt-6" />
        {children}
      </div>
    </section>
  );
};