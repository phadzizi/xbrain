import React from 'react';
import styles from './GameCard.module.css';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function GameCard({ children, className }: Props) {
  return <div className={`${styles.card} ${className ?? ''}`}>{children}</div>;
}
