import React from 'react';
import styles from './PrimaryButton.module.css';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: Variant;
  type?: 'button' | 'submit';
  'aria-label'?: string;
  'data-testid'?: string;
};

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  type = 'button',
  'aria-label': ariaLabel,
  'data-testid': testId,
}: Props) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {children}
    </button>
  );
}
