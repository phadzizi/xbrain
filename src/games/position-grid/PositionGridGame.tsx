import { useState, useRef, useEffect } from 'react';
import { GameLayout, PrimaryButton, ScoreDisplay } from '../../components';
import { useSettingsStore } from '../../store/useSettingsStore';
import { play } from '../../services/sound';
import { hapticCorrect, hapticWrong } from '../../services/haptics';
import { getBestScore, setBestScore } from '../../services/storage';
import type { ObjectItem } from '../object-disappears/objectDisappears.types';
import {
  generatePlacement,
  checkPlacements,
  isGameOver,
  buildCorrectGrid,
  getDifficulty,
} from './positionGrid.logic';
import type { CheckResult, GameStatus, PositionGridRound } from './positionGrid.types';
import styles from './PositionGridGame.module.css';

const GAME_ID = 'position-grid';
const COUNTDOWN_STEP = 1000;

export default function PositionGridGame() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [level, setLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [round, setRound] = useState<PositionGridRound | null>(null);
  const [playerGrid, setPlayerGrid] = useState<(ObjectItem | null)[]>([]);
  const [selectedObject, setSelectedObject] = useState<ObjectItem | null>(null);
  const [countdownValue, setCountdownValue] = useState(3);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
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

  function beginCountdownThenPreview(newRound: PositionGridRound, lvl: number) {
    setRound(newRound);
    setPlayerGrid(Array(newRound.gridSize * newRound.gridSize).fill(null));
    setSelectedObject(null);
    setCheckResult(null);
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
      setTimeout(() => setStatus('recall'), COUNTDOWN_STEP * 3 + getDifficulty(lvl).previewMs)
    );
  }

  function startGame() {
    clearAllTimeouts();
    const newRound = generatePlacement(1);
    setLevel(1);
    setTotalScore(0);
    setBestScoreLocal(getBestScore(GAME_ID));
    beginCountdownThenPreview(newRound, 1);
  }

  function handleSidebarClick(obj: ObjectItem) {
    setSelectedObject((prev) => (prev?.id === obj.id ? null : obj));
  }

  function handleCellClick(index: number) {
    if (!selectedObject) return;
    setPlayerGrid((prev) => {
      const next = [...prev];
      next[index] = next[index]?.id === selectedObject.id ? null : selectedObject;
      return next;
    });
  }

  function handleSubmit() {
    if (!round) return;
    const result = checkPlacements(round, playerGrid);
    const gameOver = isGameOver(result.roundScore, result.totalObjects);
    setCheckResult(result);
    setTotalScore((prev) => prev + result.roundScore);
    setStatus('results');
    if (soundEnabled) play(gameOver ? 'wrong' : 'correct');
    void (gameOver ? hapticWrong() : hapticCorrect());
  }

  function handleNextRound() {
    const nextLevel = level + 1;
    const newRound = generatePlacement(nextLevel);
    setLevel(nextLevel);
    beginCountdownThenPreview(newRound, nextLevel);
  }

  function handleGameOver() {
    setBestScore(GAME_ID, totalScore);
    setBestScoreLocal(getBestScore(GAME_ID));
    setStatus('complete');
  }

  // ── Idle ──────────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <GameLayout title="Position Grid" backHref="/">
        <div className={styles.idleScreen}>
          <span className={styles.idleEmoji} aria-hidden="true">
            🗺️
          </span>
          <h2 className={styles.idleTitle}>Remember the Positions</h2>
          <p className={styles.idleDesc}>
            Study where each object is placed in the grid, then put them back in the right spots.
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
      <GameLayout title="Position Grid" backHref="/">
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
  const totalCells = gridSize * gridSize;

  // Compute preview grid (correct positions)
  const previewGrid: (ObjectItem | null)[] = (() => {
    if (!round || status !== 'preview') return [];
    return buildCorrectGrid(round);
  })();

  // Set of object ids currently placed on the player grid
  const placedIds = new Set(playerGrid.filter(Boolean).map((o) => o!.id));

  // Determine if results phase is game over
  const gameOverThisRound =
    checkResult !== null && isGameOver(checkResult.roundScore, checkResult.totalObjects);

  return (
    <GameLayout title="Position Grid" backHref="/">
      {/* Hidden element for E2E test polling */}
      <div
        aria-hidden="true"
        data-testid="game-info"
        data-status={status}
        data-level={level}
        data-placements={
          round ? round.placements.map((p) => `${p.objectId}:${p.cellIndex}`).join(',') : ''
        }
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

      {(status === 'preview' || status === 'recall' || status === 'results') && round && (
        <div className={styles.gameArea}>
          {/* ── Grid ── */}
          <div
            className={styles.grid}
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
            data-testid="position-grid"
          >
            {Array.from({ length: totalCells }, (_, i) => {
              let cellClass = styles.cellEmpty;
              let cellEmoji: string | null = null;
              let isGlowing = false;
              let placedObjId = '';

              if (status === 'preview') {
                const obj = previewGrid[i];
                if (obj) {
                  cellClass = styles.cellPreview;
                  cellEmoji = obj.label;
                  isGlowing = true;
                }
              } else if (status === 'recall') {
                const obj = playerGrid[i];
                if (obj) {
                  cellClass = styles.cellFilled;
                  cellEmoji = obj.label;
                  placedObjId = obj.id;
                }
              } else if (status === 'results' && checkResult) {
                const r = checkResult.cellResults[i];
                if (r.status === 'correct') {
                  cellClass = styles.cellCorrect;
                  cellEmoji = r.playerObject!.label;
                } else if (r.status === 'wrong') {
                  cellClass = styles.cellWrong;
                  cellEmoji = r.playerObject!.label;
                } else if (r.status === 'missed') {
                  cellClass = styles.cellMissed;
                  cellEmoji = r.correctObject!.label;
                }
              }

              return (
                <button
                  key={i}
                  className={`${styles.cell} ${cellClass}`}
                  onClick={status === 'recall' ? () => handleCellClick(i) : undefined}
                  disabled={status !== 'recall'}
                  aria-label={cellEmoji ? `${cellEmoji} cell` : 'empty cell'}
                  data-testid="grid-cell"
                  data-index={i}
                  data-placed-object={placedObjId}
                >
                  {cellEmoji && (
                    <span
                      className={`${styles.cellEmoji} ${isGlowing ? styles.cellEmojiGlow : ''}`}
                      aria-hidden="true"
                    >
                      {cellEmoji}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Results summary ── */}
          {status === 'results' && checkResult && (
            <p className={styles.resultsSummary} data-testid="results-summary">
              {checkResult.roundScore === checkResult.totalObjects
                ? 'Perfect!'
                : `${checkResult.roundScore} / ${checkResult.totalObjects} correct`}
            </p>
          )}

          {/* ── Object sidebar (recall phase) ── */}
          {status === 'recall' && (
            <div className={styles.sidebar} role="group" aria-label="Objects to place">
              {round.objects.map((obj) => (
                <button
                  key={obj.id}
                  className={[
                    styles.sidebarObj,
                    selectedObject?.id === obj.id && styles.sidebarObjSelected,
                    placedIds.has(obj.id) && styles.sidebarObjPlaced,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleSidebarClick(obj)}
                  aria-label={`${selectedObject?.id === obj.id ? 'Deselect' : 'Select'} ${obj.id}`}
                  aria-pressed={selectedObject?.id === obj.id}
                  data-testid="sidebar-object"
                  data-object-id={obj.id}
                >
                  <span className={styles.sidebarEmoji} aria-hidden="true">
                    {obj.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ── Submit (recall) / Next actions (results) ── */}
          {status === 'recall' && (
            <div className={styles.actionsRow}>
              <PrimaryButton onClick={handleSubmit} data-testid="submit-button">
                Submit
              </PrimaryButton>
            </div>
          )}

          {status === 'results' && (
            <div className={styles.actionsRow}>
              {!gameOverThisRound && (
                <PrimaryButton onClick={handleNextRound} data-testid="next-round-button">
                  Next Round
                </PrimaryButton>
              )}
              <button
                className={styles.quitButton}
                onClick={handleGameOver}
                data-testid="quit-button"
              >
                {gameOverThisRound ? 'See Final Score' : 'Quit'}
              </button>
            </div>
          )}
        </div>
      )}
    </GameLayout>
  );
}
