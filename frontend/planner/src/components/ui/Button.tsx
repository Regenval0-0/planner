import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const styles = {
    primary: 'bg-sky-600 hover:bg-sky-500 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    ghost: 'bg-neutral-700 hover:bg-neutral-600 text-neutral-200',
  };
  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
