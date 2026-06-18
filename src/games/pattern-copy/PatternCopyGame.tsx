import { useState, useRef, useEffect } from 'react';
import { GameLayout, PrimaryButton, ScoreDisplay } from '../../components';
import { useSettingsStore } from '../../store/useSettingsStore';
import { play } from '../../services/sound';
import { getBestScore, setBestScore } from '../../services/storage';
import {
  generatePattern,
  checkPattern,
  getPointsForRound,
  getDifficulty,
} from './patternCopy.logic';
import type { GameStatus, PatternCopyRound, CellColor } from './patternCopy.types';
import styles from './PatternCopyGame.module.css';

const GAME_ID = 'pattern-copy';
const CORRECT_FLASH_MS = 800;
const WRONG_REVEAL_MS = 1500;
const COUNTDOWN_STEP = 1000;

const COLOR_VAR: Record<CellColor, string> = {
  red: 'var(--color-game-red)',
  blue: 'var(--color-game-blue)',
  green: 'var(--color-game-green)',
  yellow: 'var(--color-game-yellow)',
  purple: 'var(--color-game-purple)',
};

const COLOR_LABEL: Record<CellColor, string> = {
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  yellow: 'Yellow',
  purple: 'Purple',
};

export default function PatternCopyGame() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [level, setLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [round, setRound] = useState<PatternCopyRound | null>(null);
  const [playerGrid, setPlayerGrid] = useState<(CellColor | null)[]>([]);
  const [selectedColor, setSelectedColor] = useState<CellColor | null>(null);
  const [countdownValue, setCountdownValue] = useState(3);
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
    return () => clearAllTimeouts();
  }, []);

  function beginCountdownThenPreview(newRound: PatternCopyRound, lvl: number) {
    setRound(newRound);
    setPlayerGrid(Array(newRound.pattern.length).fill(null));
    setSelectedColor(null);
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
      setTimeout(() => setStatus('copy'), COUNTDOWN_STEP * 3 + getDifficulty(lvl).previewMs)
    );
  }

  function startGame() {
    clearAllTimeouts();
    const newRound = generatePattern(1);
    setLevel(1);
    setTotalScore(0);
    setBestScoreLocal(getBestScore(GAME_ID));
    beginCountdownThenPreview(newRound, 1);
  }

  function handleCellClick(index: number) {
    if (!selectedColor) return;
    setPlayerGrid((prev) => {
      const next = [...prev];
      next[index] = next[index] === selectedColor ? null : selectedColor;
      return next;
    });
  }

  function handleSubmit() {
    if (!round) return;
    const correct = checkPattern(round.pattern, playerGrid);
    if (correct) {
      const points = getPointsForRound(level);
      const newScore = totalScore + points;
      setTotalScore(newScore);
      setStatus('correct');
      if (soundEnabled) play('correct');
      addTimeout(
        setTimeout(() => {
          const nextLevel = level + 1;
          const newRound = generatePattern(nextLevel);
          setLevel(nextLevel);
          beginCountdownThenPreview(newRound, nextLevel);
        }, CORRECT_FLASH_MS)
      );
    } else {
      setStatus('wrong');
      if (soundEnabled) play('wrong');
      addTimeout(
        setTimeout(() => {
          setBestScore(GAME_ID, totalScore);
          setBestScoreLocal(getBestScore(GAME_ID));
          setStatus('complete');
        }, WRONG_REVEAL_MS)
      );
    }
  }

  function getCellColor(index: number): CellColor | null {
    if (status === 'preview' || status === 'correct' || status === 'wrong') {
      return round?.pattern[index] ?? null;
    }
    return playerGrid[index] ?? null;
  }

  // ── Idle ──────────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <GameLayout title="Pattern Copy" backHref="/">
        <div className={styles.idleScreen}>
          <span className={styles.idleEmoji} aria-hidden="true">
            🎨
          </span>
          <h2 className={styles.idleTitle}>Copy the Pattern</h2>
          <p className={styles.idleDesc}>Watch the colored grid, then recreate it from memory.</p>
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
      <GameLayout title="Pattern Copy" backHref="/">
        <div className={styles.completeScreen} data-testid="game-over-screen">
          <h2 className={styles.completeTitle}>Game Over</h2>
          <ScoreDisplay score={totalScore} label="Score" data-testid="score-display" />
          {bestScoreLocal !== null && (
            <ScoreDisplay score={bestScoreLocal} label="Best" data-testid="best-score-display" />
          )}
          <PrimaryButton onClick={startGame} data-testid="start-button">
            Play Again
          </PrimaryButton>
        </div>
      </GameLayout>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────
  const gridSize = round?.gridSize ?? 3;

  return (
    <GameLayout title="Pattern Copy" backHref="/">
      {/* Hidden element for E2E test polling */}
      <div
        aria-hidden="true"
        data-testid="game-info"
        data-status={status}
        data-level={level}
        data-pattern={round ? round.pattern.map((c) => c ?? 'null').join(',') : ''}
        data-grid-size={gridSize}
        style={{ display: 'none' }}
      />

      <div className={styles.hud}>
        <div className={styles.hudStat} data-testid="level-indicator">
          <span className={styles.hudLabel}>Level</span>
          <span className={styles.hudValue}>{level}</span>
        </div>
        <div className={styles.hudStat} data-testid="score-display">
          <span className={styles.hudLabel}>Score</span>
          <span className={styles.hudValue}>{totalScore}</span>
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

      {(status === 'preview' || status === 'copy' || status === 'correct' || status === 'wrong') &&
        round && (
          <div className={styles.gameArea}>
            <div
              className={[
                styles.grid,
                status === 'correct' && styles.gridCorrect,
                status === 'wrong' && styles.gridWrong,
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
              data-testid="pattern-grid"
            >
              {Array.from({ length: round.pattern.length }, (_, i) => {
                const color = getCellColor(i);
                return (
                  <button
                    key={i}
                    className={[styles.cell, !color && styles.cellEmpty].filter(Boolean).join(' ')}
                    style={color ? { backgroundColor: COLOR_VAR[color] } : undefined}
                    onClick={status === 'copy' ? () => handleCellClick(i) : undefined}
                    disabled={status !== 'copy'}
                    aria-label={color ? `${COLOR_LABEL[color]} cell` : 'empty cell'}
                    data-testid="grid-cell"
                    data-index={i}
                    data-color={color ?? 'null'}
                  />
                );
              })}
            </div>

            {status === 'wrong' && (
              <p className={styles.wrongLabel} aria-live="polite">
                Correct pattern shown above
              </p>
            )}

            {status === 'copy' && (
              <>
                <div className={styles.palette} role="group" aria-label="Color palette">
                  {round.colorsUsed.map((color) => (
                    <button
                      key={color}
                      className={[styles.swatch, selectedColor === color && styles.swatchSelected]
                        .filter(Boolean)
                        .join(' ')}
                      style={{ backgroundColor: COLOR_VAR[color] }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select ${COLOR_LABEL[color]}`}
                      aria-pressed={selectedColor === color}
                      data-testid="color-swatch"
                      data-color={color}
                    />
                  ))}
                </div>

                <div className={styles.submitRow}>
                  <PrimaryButton onClick={handleSubmit} data-testid="submit-button">
                    Submit
                  </PrimaryButton>
                </div>
              </>
            )}
          </div>
        )}
    </GameLayout>
  );
}
