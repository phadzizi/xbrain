import { useState, useEffect, useRef } from 'react';
import { GameLayout, PrimaryButton, ScoreDisplay } from '../../components';
import { useSettingsStore } from '../../store/useSettingsStore';
import { play } from '../../services/sound';
import { getBestScore, setBestScore } from '../../services/storage';
import {
  generateRound,
  checkAnswer,
  getPreviewDuration,
  calculateScore,
} from './objectDisappears.logic';
import type { GameStatus, ObjectDisappearsRound } from './objectDisappears.types';
import styles from './ObjectDisappearsGame.module.css';

const GAME_ID = 'object-disappears';
const CORRECT_DISPLAY_DURATION = 900;
const WRONG_DISPLAY_DURATION = 1500;

export default function ObjectDisappearsGame() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [currentRound, setCurrentRound] = useState<ObjectDisappearsRound | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bestScoreLocal, setBestScoreLocal] = useState<number | null>(null);

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

  function beginPreview(round: ObjectDisappearsRound, lvl: number) {
    setCurrentRound(round);
    setSelectedId(null);
    setStatus('preview');
    if (soundEnabled) play('tick');
    addTimeout(
      setTimeout(() => {
        setStatus('guessing');
      }, getPreviewDuration(lvl))
    );
  }

  function startGame() {
    clearAllTimeouts();
    const round = generateRound(1);
    setLevel(1);
    setScore(0);
    setRoundsCompleted(0);
    setBestScoreLocal(getBestScore(GAME_ID));
    beginPreview(round, 1);
  }

  function handleOptionTap(id: string) {
    if (status !== 'guessing' || !currentRound) return;
    setSelectedId(id);
    const isCorrect = checkAnswer(currentRound, id);

    if (isCorrect) {
      if (soundEnabled) play('correct');
      const nextRoundsCompleted = roundsCompleted + 1;
      const newScore = calculateScore(nextRoundsCompleted);
      setRoundsCompleted(nextRoundsCompleted);
      setScore(newScore);
      setStatus('correct');

      const nextLevel = level + 1;
      addTimeout(
        setTimeout(() => {
          const nextRound = generateRound(nextLevel);
          setLevel(nextLevel);
          beginPreview(nextRound, nextLevel);
        }, CORRECT_DISPLAY_DURATION)
      );
    } else {
      if (soundEnabled) play('wrong');
      const finalScore = calculateScore(roundsCompleted);
      setStatus('wrong');
      addTimeout(
        setTimeout(() => {
          setScore(finalScore);
          setBestScore(GAME_ID, finalScore);
          setBestScoreLocal(getBestScore(GAME_ID));
          setStatus('complete');
        }, WRONG_DISPLAY_DURATION)
      );
    }
  }

  function getOptionClassName(id: string): string {
    const base = styles.optionButton;
    if (status === 'correct' && id === selectedId) return `${base} ${styles.optionCorrect}`;
    if (status === 'wrong') {
      if (id === selectedId) return `${base} ${styles.optionWrong}`;
      if (currentRound && id === currentRound.missingItem.id)
        return `${base} ${styles.optionReveal}`;
    }
    return base;
  }

  const isInteractive = status === 'guessing';
  const showOptions = status === 'guessing' || status === 'correct' || status === 'wrong';
  const showVisibleItems = status === 'guessing' || status === 'correct' || status === 'wrong';

  // ── Idle ──────────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <GameLayout title="Object Disappears" backHref="/">
        <div className={styles.idleScreen}>
          <span className={styles.idleEmoji} aria-hidden="true">
            👁️
          </span>
          <h2 className={styles.idleTitle}>What vanished?</h2>
          <p className={styles.idleDesc}>
            A set of objects will appear briefly. One will disappear. Tap the missing one!
          </p>
          <PrimaryButton onClick={startGame} data-testid="start-button">
            Start
          </PrimaryButton>
        </div>
      </GameLayout>
    );
  }

  // ── Complete ───────────────────────────────────────────────────────
  if (status === 'complete') {
    return (
      <GameLayout title="Object Disappears" backHref="/">
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
    <GameLayout title="Object Disappears" backHref="/">
      {/* Hidden element exposes game state for E2E tests */}
      <div
        aria-hidden="true"
        data-testid="game-info"
        data-status={status}
        data-level={level}
        data-missing-item={currentRound ? currentRound.missingItem.id : ''}
        style={{ display: 'none' }}
      />

      <div className={styles.hud}>
        <div className={styles.hudStat} data-testid="level-indicator">
          <span className={styles.hudLabel}>Level</span>
          <span className={styles.hudValue}>{level}</span>
        </div>
        <div className={styles.hudStat} data-testid="score-display">
          <span className={styles.hudLabel}>Score</span>
          <span className={styles.hudValue}>{score}</span>
        </div>
      </div>

      <div className={styles.objectsSection}>
        <p className={styles.phaseLabel}>
          {status === 'preview' ? 'Remember these!' : 'Which one disappeared?'}
        </p>

        <div className={styles.objectsGrid} data-testid="objects-grid">
          {(status === 'preview'
            ? currentRound!.allItems
            : showVisibleItems
              ? currentRound!.visibleItems
              : []
          ).map((item) => (
            <span key={item.id} className={styles.objectEmoji} aria-hidden="true">
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {showOptions && currentRound && (
        <div className={styles.optionsSection}>
          <div className={styles.optionsRow} data-testid="options-row">
            {currentRound.options.map((item) => (
              <button
                key={item.id}
                className={getOptionClassName(item.id)}
                onClick={() => handleOptionTap(item.id)}
                disabled={!isInteractive}
                aria-label={item.label}
                data-testid="option-button"
                data-option-id={item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </GameLayout>
  );
}
