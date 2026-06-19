import { useState, useEffect, useRef } from 'react';
import { GameLayout, PrimaryButton, ScoreDisplay } from '../../components';
import { useSettingsStore } from '../../store/useSettingsStore';
import { play } from '../../services/sound';
import { hapticCorrect, hapticWrong } from '../../services/haptics';
import { getBestScore, setBestScore } from '../../services/storage';
import {
  generateSequence,
  checkAnswer,
  getPreviewDuration,
  calculateScore,
} from './numberSequence.logic';
import type { GameStatus } from './numberSequence.types';
import styles from './NumberSequenceGame.module.css';

const GAME_ID = 'number-sequence';
const COUNTDOWN_STEP = 1000;
const CORRECT_DISPLAY_DURATION = 900;
const WRONG_DISPLAY_DURATION = 1500;

export default function NumberSequenceGame() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScoreLocal, setBestScoreLocal] = useState<number | null>(null);
  const [countdownValue, setCountdownValue] = useState(3);
  const [userInput, setUserInput] = useState('');

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { soundEnabled } = useSettingsStore();

  function addTimeout(id: ReturnType<typeof setTimeout>) {
    timeoutsRef.current.push(id);
  }

  function clearAllTimeouts() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }

  useEffect(() => {
    return clearAllTimeouts;
  }, []);

  useEffect(() => {
    if (status === 'input') {
      inputRef.current?.focus();
    }
  }, [status]);

  function beginCountdownThenPreview(seq: number[]) {
    setStatus('countdown');
    setCountdownValue(3);

    addTimeout(setTimeout(() => setCountdownValue(2), COUNTDOWN_STEP));
    addTimeout(setTimeout(() => setCountdownValue(1), COUNTDOWN_STEP * 2));
    addTimeout(
      setTimeout(() => {
        setStatus('preview');
        if (soundEnabled) play('tick');
      }, COUNTDOWN_STEP * 3)
    );
    addTimeout(
      setTimeout(
        () => {
          setStatus('input');
          setUserInput('');
        },
        COUNTDOWN_STEP * 3 + getPreviewDuration(seq.length)
      )
    );
  }

  function startGame() {
    clearAllTimeouts();
    const seq = generateSequence(3);
    setSequence(seq);
    setRound(1);
    setScore(0);
    setBestScoreLocal(getBestScore(GAME_ID));
    beginCountdownThenPreview(seq);
  }

  function handleSubmit() {
    if (status !== 'input') return;
    const isCorrect = checkAnswer(sequence, userInput);

    if (isCorrect) {
      if (soundEnabled) play('correct');
      void hapticCorrect();
      const newScore = calculateScore(round);
      setScore(newScore);
      setStatus('correct');

      addTimeout(
        setTimeout(() => {
          const nextSeq = generateSequence(sequence.length + 1);
          const nextRound = round + 1;
          setSequence(nextSeq);
          setRound(nextRound);
          beginCountdownThenPreview(nextSeq);
        }, CORRECT_DISPLAY_DURATION)
      );
    } else {
      if (soundEnabled) play('wrong');
      void hapticWrong();
      setStatus('wrong');
      addTimeout(
        setTimeout(() => {
          const finalScore = calculateScore(round - 1);
          setScore(finalScore);
          setBestScore(GAME_ID, finalScore);
          setBestScoreLocal(getBestScore(GAME_ID));
          setStatus('complete');
        }, WRONG_DISPLAY_DURATION)
      );
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  // ── Idle ─────────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <GameLayout title="Number Sequence" backHref="/">
        <div className={styles.idleScreen}>
          <span className={styles.idleEmoji} aria-hidden="true">
            🔢
          </span>
          <h2 className={styles.idleTitle}>Remember the numbers</h2>
          <p className={styles.idleDesc}>
            A sequence of numbers will flash on screen. Memorize it, then type it back.
          </p>
          <PrimaryButton onClick={startGame} data-testid="start-button">
            Start
          </PrimaryButton>
        </div>
      </GameLayout>
    );
  }

  // ── Game over ─────────────────────────────────────────────────────
  if (status === 'complete') {
    return (
      <GameLayout title="Number Sequence" backHref="/">
        <div className={styles.completeScreen} data-testid="game-over-screen">
          <h2 className={styles.completeTitle}>Game Over</h2>
          <ScoreDisplay score={score} label="Rounds" data-testid="score-display" />
          {bestScoreLocal !== null && (
            <ScoreDisplay score={bestScoreLocal} label="Best" data-testid="best-score-display" />
          )}
          <div className={styles.completeButtons}>
            <PrimaryButton onClick={startGame} data-testid="start-button">
              Replay
            </PrimaryButton>
          </div>
        </div>
      </GameLayout>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────
  return (
    <GameLayout title="Number Sequence" backHref="/">
      {/* Hidden element exposes game state for E2E tests */}
      <div
        aria-hidden="true"
        data-testid="game-info"
        data-status={status}
        data-round={round}
        data-sequence={status === 'input' ? sequence.join(',') : ''}
        style={{ display: 'none' }}
      />

      <div className={styles.hud}>
        <div className={styles.hudStat} data-testid="round-indicator">
          <span className={styles.hudLabel}>Round</span>
          <span className={styles.hudValue}>{round}</span>
        </div>
        <div className={styles.hudStat} data-testid="score-display">
          <span className={styles.hudLabel}>Score</span>
          <span className={styles.hudValue}>{score}</span>
        </div>
      </div>

      {status === 'countdown' && (
        <div
          className={styles.countdownScreen}
          aria-live="assertive"
          aria-atomic="true"
          data-testid="countdown"
        >
          <p className={styles.countdownReady}>Ready…</p>
          <span className={styles.countdownNumber} key={countdownValue}>
            {countdownValue}
          </span>
        </div>
      )}

      {status === 'preview' && (
        <div className={styles.previewScreen}>
          <p className={styles.previewLabel}>Memorize this!</p>
          <div className={styles.sequenceDisplay} data-testid="sequence-display">
            {sequence.join(' ')}
          </div>
        </div>
      )}

      {status === 'input' && (
        <div className={styles.inputScreen}>
          <p className={styles.inputPrompt}>Type the sequence</p>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.inputField}
            placeholder="e.g. 4 9 2"
            aria-label="Enter the sequence"
            data-testid="sequence-input"
            autoComplete="off"
          />
          <PrimaryButton onClick={handleSubmit} data-testid="submit-button">
            Submit
          </PrimaryButton>
        </div>
      )}

      {status === 'correct' && (
        <div className={styles.feedbackScreen} data-testid="feedback-correct">
          <div className={styles.feedbackCorrect}>Correct!</div>
        </div>
      )}

      {status === 'wrong' && (
        <div className={styles.feedbackScreen} data-testid="feedback-wrong">
          <div className={styles.feedbackWrong}>The sequence was:</div>
          <div className={styles.feedbackSequence} data-testid="correct-sequence">
            {sequence.join(' ')}
          </div>
        </div>
      )}
    </GameLayout>
  );
}
