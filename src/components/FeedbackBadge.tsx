import styles from './FeedbackBadge.module.css';

type Variant = 'correct' | 'wrong' | 'neutral';

type Props = {
  variant: Variant;
  children: React.ReactNode;
};

const LABELS: Record<Variant, string> = {
  correct: 'Correct',
  wrong: 'Wrong',
  neutral: '',
};

export default function FeedbackBadge({ variant, children }: Props) {
  return (
    <span
      className={`${styles.badge} ${styles[variant]}`}
      role="status"
      aria-label={LABELS[variant]}
    >
      {children}
    </span>
  );
}
