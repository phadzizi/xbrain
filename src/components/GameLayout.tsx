import React from 'react';
import styles from './GameLayout.module.css';

type Props = {
  children: React.ReactNode;
  /** Shown in the top bar. Omit for games that manage their own header. */
  title?: string;
  /** Renders a back arrow linking to the given path. */
  backHref?: string;
};

export default function GameLayout({ children, title, backHref }: Props) {
  return (
    <div className={styles.shell}>
      {(title || backHref) && (
        <header className={styles.header}>
          {backHref && (
            <a
              href={backHref}
              className={styles.back}
              aria-label="Go back"
              data-testid="back-button"
            >
              ←
            </a>
          )}
          {title && <h1 className={styles.title}>{title}</h1>}
        </header>
      )}
      <main className={styles.content}>{children}</main>
    </div>
  );
}
