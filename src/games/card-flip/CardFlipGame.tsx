import { useState, useEffect, useRef, useCallback } from 'react';
import { GameLayout, PrimaryButton, ScoreDisplay } from '../../components';
import { useSettingsStore } from '../../store/useSettingsStore';
import { play, type SoundType } from '../../services/sound';
import { hapticCorrect } from '../../services/haptics';
import { getBestScore, setBestScore } from '../../services/storage';
import { createDeck, checkMatch, calculateScore, getGridSize } from './cardFlip.logic';
import type { Card, GameStatus } from './cardFlip.types';
import styles from './CardFlipGame.module.css';

const GAME_ID = 'card-flip';
const MAX_LEVEL = 5;
const FLIP_BACK_DELAY = 900;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CardFlipGame() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScoreState] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flipBackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { soundEnabled } = useSettingsStore();

  const playSound = useCallback(
    (type: SoundType) => {
      if (soundEnabled) play(type);
    },
    [soundEnabled]
  );

  function stopTimer() {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startGame(newLevel: number) {
    stopTimer();

    setGameStatus('playing');
    setLevel(newLevel);
    setCards(createDeck(newLevel));
    setFlippedIds([]);
    setMoves(0);
    setElapsed(0);
    setScore(0);
    setBestScoreState(getBestScore(GAME_ID));

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }

  useEffect(() => {
    return () => {
      stopTimer();
      if (flipBackRef.current !== null) clearTimeout(flipBackRef.current);
    };
  }, []);

  function handleCardClick(card: Card) {
    if (gameStatus !== 'playing') return;
    if (flippedIds.length >= 2) return;
    if (card.status !== 'hidden') return;

    playSound('flip');

    if (flippedIds.length === 0) {
      setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, status: 'flipped' } : c)));
      setFlippedIds([card.id]);
      return;
    }

    // Second card flipped — evaluate the pair
    const firstId = flippedIds[0];
    const firstCard = cards.find((c) => c.id === firstId)!;
    const newMoves = moves + 1;
    setMoves(newMoves);

    if (checkMatch(firstCard, card)) {
      playSound('correct');
      void hapticCorrect();
      const updatedCards = cards.map((c) =>
        c.id === firstId || c.id === card.id ? { ...c, status: 'matched' as const } : c
      );
      setCards(updatedCards);
      setFlippedIds([]);

      if (updatedCards.every((c) => c.status === 'matched')) {
        stopTimer();
        const finalScore = calculateScore(newMoves, elapsed);
        setScore(finalScore);
        setBestScore(GAME_ID, finalScore);
        setBestScoreState(getBestScore(GAME_ID));
        setGameStatus('complete');
        playSound('complete');
      }
    } else {
      setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, status: 'flipped' } : c)));
      setFlippedIds([firstId, card.id]);

      flipBackRef.current = setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === firstId || c.id === card.id ? { ...c, status: 'hidden' as const } : c
          )
        );
        setFlippedIds([]);
        flipBackRef.current = null;
      }, FLIP_BACK_DELAY);
    }
  }

  const { cols } = getGridSize(level);
  const isLocked = flippedIds.length >= 2;

  if (gameStatus === 'idle') {
    return (
      <GameLayout title="Card Flip" backHref="/">
        <div className={styles.idleScreen}>
          <span className={styles.idleEmoji} aria-hidden="true">
            🃏
          </span>
          <h2 className={styles.idleTitle}>Find the matching pairs</h2>
          <p className={styles.idleDesc}>
            Flip cards two at a time. Match all pairs to complete the level.
          </p>
          <PrimaryButton onClick={() => startGame(1)} data-testid="start-button">
            Start
          </PrimaryButton>
        </div>
      </GameLayout>
    );
  }

  if (gameStatus === 'complete') {
    return (
      <GameLayout title="Card Flip" backHref="/">
        <div className={styles.completeScreen} data-testid="game-over-screen">
          <h2 className={styles.completeTitle}>Level {level} Complete!</h2>
          <ScoreDisplay score={score} label="Score" data-testid="score-display" />
          {bestScore !== null && (
            <ScoreDisplay score={bestScore} label="Best Score" data-testid="best-score-display" />
          )}
          <p className={styles.completeStats}>
            {moves} moves · {formatTime(elapsed)}
          </p>
          <div className={styles.completeButtons}>
            <PrimaryButton onClick={() => startGame(level)} data-testid="start-button">
              Replay
            </PrimaryButton>
            {level < MAX_LEVEL && (
              <PrimaryButton onClick={() => startGame(level + 1)} variant="secondary">
                Next Level
              </PrimaryButton>
            )}
          </div>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="Card Flip" backHref="/">
      <div className={styles.hud}>
        <div className={styles.hudStat}>
          <span className={styles.hudLabel}>Level</span>
          <span className={styles.hudValue}>{level}</span>
        </div>
        <div className={styles.hudStat} data-testid="move-counter">
          <span className={styles.hudLabel}>Moves</span>
          <span className={styles.hudValue}>{moves}</span>
        </div>
        <div className={styles.hudStat}>
          <span className={styles.hudLabel}>Time</span>
          <span className={styles.hudValue} data-testid="timer-display">
            {formatTime(elapsed)}
          </span>
        </div>
      </div>

      <div
        className={styles.grid}
        style={{ '--grid-cols': cols } as React.CSSProperties}
        role="grid"
        aria-label={`Card grid, level ${level}`}
      >
        <div aria-live="polite" aria-atomic="true" className={styles.srOnly}>
          {flippedIds.length === 2 ? 'Checking pair…' : ''}
        </div>
        {cards.map((card) => (
          <button
            key={card.id}
            className={`${styles.cardWrapper} ${styles[card.status]}`}
            onClick={() => handleCardClick(card)}
            disabled={card.status !== 'hidden' || isLocked}
            aria-label={
              card.status === 'hidden'
                ? 'Hidden card'
                : card.status === 'matched'
                  ? `Matched: ${card.emoji}`
                  : `Flipped: ${card.emoji}`
            }
            data-testid="card"
            data-card-id={card.id}
            data-card-status={card.status}
          >
            <div className={styles.cardInner}>
              <div className={styles.cardBack} aria-hidden="true">
                ?
              </div>
              <div className={styles.cardFace} aria-hidden="true">
                {card.emoji}
              </div>
            </div>
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
