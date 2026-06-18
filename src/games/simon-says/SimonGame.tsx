import { useState, useEffect, useRef } from 'react';
import { GameLayout, PrimaryButton, ScoreDisplay } from '../../components';
import { useSettingsStore } from '../../store/useSettingsStore';
import { play } from '../../services/sound';
import { getBestScore, setBestScore } from '../../services/storage';
import {
  generateSequence,
  extendSequence,
  checkTap,
  getPlaybackInterval,
  calculateScore,
  SIMON_COLORS,
} from './simon.logic';
import type { SimonColor, GameStatus } from './simon.types';
import styles from './SimonGame.module.css';

const GAME_ID = 'simon-says';
const INITIAL_SEQ_LENGTH = 3;
const PREVIEW_START_DELAY = 800; // ms before first flash after Start / round complete
const BETWEEN_ROUNDS_DELAY = 1000; // ms pause between round end and next preview
const TAP_FLASH_DURATION = 300; // ms visual flash on player tap
const GAME_OVER_FLASH_DURATION = 700; // ms all-buttons flash before showing score

export default function SimonGame() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [sequence, setSequence] = useState<SimonColor[]>([]);
  const [round, setRound] = useState(0);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScoreLocal, setBestScoreLocal] = useState<number | null>(null);
  const [activeColor, setActiveColor] = useState<SimonColor | null>(null);
  const [flashAll, setFlashAll] = useState(false);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
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

  function playSound(color: SimonColor) {
    if (soundEnabled) play(color);
  }

  // Plays the sequence one flash at a time using a setTimeout chain.
  // All timeout IDs are tracked so they can be cancelled on unmount or restart.
  function beginPreview(seq: SimonColor[], roundNum: number) {
    const interval = getPlaybackInterval(roundNum);
    const flashDuration = Math.round(interval * 0.65);

    seq.forEach((color, i) => {
      addTimeout(
        setTimeout(() => {
          setActiveColor(color);
          playSound(color);
        }, i * interval)
      );

      addTimeout(
        setTimeout(
          () => {
            setActiveColor(null);
          },
          i * interval + flashDuration
        )
      );
    });

    addTimeout(
      setTimeout(
        () => {
          setActiveColor(null);
          setPlayerIndex(0);
          setStatus('input');
        },
        seq.length * interval + 200
      )
    );
  }

  function startGame() {
    clearAllTimeouts();
    setFlashAll(false);
    setActiveColor(null);

    const initialSeq = generateSequence(INITIAL_SEQ_LENGTH);
    setSequence(initialSeq);
    setRound(1);
    setPlayerIndex(0);
    setScore(0);
    setStatus('preview');
    setBestScoreLocal(getBestScore(GAME_ID));

    addTimeout(
      setTimeout(() => {
        beginPreview(initialSeq, 1);
      }, PREVIEW_START_DELAY)
    );
  }

  function handleColorTap(color: SimonColor) {
    if (status !== 'input') return;

    // Brief visual + audio feedback on the tapped button
    setActiveColor(color);
    playSound(color);
    addTimeout(
      setTimeout(() => {
        setActiveColor((prev) => (prev === color ? null : prev));
      }, TAP_FLASH_DURATION)
    );

    const isCorrect = checkTap(sequence, playerIndex, color);

    if (!isCorrect) {
      if (soundEnabled) play('wrong');
      setFlashAll(true);
      addTimeout(
        setTimeout(() => {
          setFlashAll(false);
          const finalScore = calculateScore(round - 1);
          setScore(finalScore);
          setBestScore(GAME_ID, finalScore);
          setBestScoreLocal(getBestScore(GAME_ID));
          setStatus('complete');
          if (soundEnabled) play('complete');
        }, GAME_OVER_FLASH_DURATION)
      );
      return;
    }

    const nextIndex = playerIndex + 1;

    if (nextIndex < sequence.length) {
      setPlayerIndex(nextIndex);
      return;
    }

    // Round complete — extend sequence and start the next round
    const nextRound = round + 1;
    const newScore = calculateScore(round);
    const nextSeq = extendSequence(sequence);

    setScore(newScore);
    setRound(nextRound);
    setSequence(nextSeq);
    setStatus('preview');

    addTimeout(
      setTimeout(() => {
        beginPreview(nextSeq, nextRound);
      }, BETWEEN_ROUNDS_DELAY)
    );
  }

  const isPlaybackActive = status === 'preview' || flashAll;

  // ── Idle ────────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <GameLayout title="Simon Says" backHref="/">
        <div className={styles.idleScreen}>
          <span className={styles.idleEmoji} aria-hidden="true">
            🔴
          </span>
          <h2 className={styles.idleTitle}>Repeat the sequence</h2>
          <p className={styles.idleDesc}>
            Watch the colors light up, then tap them in the same order. Each round adds one more.
          </p>
          <PrimaryButton onClick={startGame} data-testid="start-button">
            Start
          </PrimaryButton>
        </div>
      </GameLayout>
    );
  }

  // ── Game over ────────────────────────────────────────────────────
  if (status === 'complete') {
    return (
      <GameLayout title="Simon Says" backHref="/">
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

  // ── Playing (preview or input) ───────────────────────────────────
  return (
    <GameLayout title="Simon Says" backHref="/">
      {/* Hidden element that exposes game state for E2E tests */}
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

      <p
        className={styles.statusText}
        aria-live="polite"
        aria-atomic="true"
        data-testid="status-text"
      >
        {status === 'preview' ? 'Watch…' : 'Your turn!'}
      </p>

      <div className={`${styles.grid} ${flashAll ? styles.flashAll : ''}`}>
        {SIMON_COLORS.map((color) => {
          const isActive = flashAll || activeColor === color;
          return (
            <button
              key={color}
              className={`${styles.colorButton} ${styles[color]} ${isActive ? styles.active : ''}`}
              onClick={() => handleColorTap(color)}
              disabled={isPlaybackActive}
              aria-label={`${color} button`}
              data-testid="color-button"
              data-color={color}
            />
          );
        })}
      </div>
    </GameLayout>
  );
}
