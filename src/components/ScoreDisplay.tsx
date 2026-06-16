import styles from './ScoreDisplay.module.css';

type Props = {
  score: number;
  label?: string;
  'data-testid'?: string;
};

export default function ScoreDisplay({ score, label = 'Score', 'data-testid': testId }: Props) {
  return (
    <div className={styles.wrapper} data-testid={testId ?? 'score-display'}>
      <span className={styles.number}>{score}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
