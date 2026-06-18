import { useState, useEffect, useRef } from 'react';
import { GameLayout, PrimaryButton, ScoreDisplay } from '../../components';
import { useSettingsStore } from '../../store/useSettingsStore';
import { play } from '../../services/sound';
import { getBestScore, setBestScore } from '../../services/storage';
import {
  drawWords,
  getResults,
  calculateRoundScore,
  getPreviewDuration,
  isGameOver,
  normalizeWord,
} from './wordRecall.logic';
import type { GameStatus, RecallResult } from './wordRecall.types';
import styles from './WordRecallGame.module.css';

const GAME_ID = 'word-recall';
const RECALL_SECONDS = 30;
const COUNTDOWN_STEP = 1000;

export default function WordRecallGame() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [level, setLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [recalled, setRecalled] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [countdownValue, setCountdownValue] = useState(3);
  const [timeLeft, setTimeLeft] = useState(RECALL_SECONDS);
  const [results, setResults] = useState<RecallResult[]>([]);
  const [roundScore, setRoundScore] = useState(0);
  const [bestScoreLocal, setBestScoreLocal] = useState<number | null>(null);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordsRef = useRef<string[]>([]);
  const recalledRef = useRef<string[]>([]);
  const timeLeftRef = useRef(RECALL_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);
  const { soundEnabled } = useSettingsStore();

  function addTimeout(id: ReturnType<typeof setTimeout>) {
    timeoutsRef.current.push(id);
  }

  function clearAllTimeouts() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }

  function stopTimer() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function finishRecall() {
    stopTimer();
    const recallResults = getResults(wordsRef.current, recalledRef.current);
    const rScore = calculateRoundScore(wordsRef.current, recalledRef.current);
    setResults(recallResults);
    setRoundScore(rScore);
    setTotalScore((prev) => prev + rScore);
    setStatus('results');
  }

  function startTimer() {
    timeLeftRef.current = RECALL_SECONDS;
    setTimeLeft(RECALL_SECONDS);
    intervalRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        finishRecall();
      }
    }, 1000);
  }

  useEffect(() => {
    return () => {
      clearAllTimeouts();
      stopTimer();
    };
  }, []);

  useEffect(() => {
    if (status === 'recall') {
      inputRef.current?.focus();
    }
  }, [status]);

  function beginCountdownThenPreview(roundWords: string[], lvl: number) {
    wordsRef.current = roundWords;
    setWords(roundWords);
    setRecalled([]);
    recalledRef.current = [];
    setInputValue('');
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
          setStatus('recall');
          startTimer();
        },
        COUNTDOWN_STEP * 3 + getPreviewDuration(lvl)
      )
    );
  }

  function startGame() {
    clearAllTimeouts();
    stopTimer();
    const newWords = drawWords(1);
    setLevel(1);
    setTotalScore(0);
    setRoundScore(0);
    setResults([]);
    setUsedWords(newWords);
    setBestScoreLocal(getBestScore(GAME_ID));
    beginCountdownThenPreview(newWords, 1);
  }

  function handleAddWord() {
    const norm = normalizeWord(inputValue);
    if (!norm) return;
    const alreadyAdded = recalledRef.current.some((r) => r.toLowerCase() === norm);
    if (alreadyAdded) {
      setInputValue('');
      return;
    }
    recalledRef.current = [...recalledRef.current, norm];
    setRecalled([...recalledRef.current]);
    setInputValue('');
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddWord();
    }
  }

  function handleNextRound() {
    const nextLevel = level + 1;
    const newWords = drawWords(nextLevel, usedWords);
    const newUsed = [...usedWords, ...newWords];
    setUsedWords(newUsed);
    setLevel(nextLevel);
    beginCountdownThenPreview(newWords, nextLevel);
  }

  function handleQuit(currentTotal: number) {
    setBestScore(GAME_ID, currentTotal);
    setBestScoreLocal(getBestScore(GAME_ID));
    setStatus('complete');
  }

  // ── Idle ──────────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <GameLayout title="Word Recall" backHref="/">
        <div className={styles.idleScreen}>
          <span className={styles.idleEmoji} aria-hidden="true">
            📝
          </span>
          <h2 className={styles.idleTitle}>Remember the words</h2>
          <p className={styles.idleDesc}>
            Study a list of words, then recall as many as you can before the timer runs out.
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
      <GameLayout title="Word Recall" backHref="/">
        <div className={styles.completeScreen} data-testid="game-over-screen">
          <h2 className={styles.completeTitle}>Game Over</h2>
          <ScoreDisplay score={totalScore} label="Words" data-testid="score-display" />
          {bestScoreLocal !== null && (
            <ScoreDisplay score={bestScoreLocal} label="Best" data-testid="best-score-display" />
          )}
          <div className={styles.completeButtons}>
            <PrimaryButton onClick={startGame} data-testid="start-button">
              Play Again
            </PrimaryButton>
          </div>
        </div>
      </GameLayout>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────
  const progressPct = (timeLeft / RECALL_SECONDS) * 100;

  return (
    <GameLayout title="Word Recall" backHref="/">
      {/* Hidden element exposes game state for E2E tests */}
      <div
        aria-hidden="true"
        data-testid="game-info"
        data-status={status}
        data-level={level}
        data-words={status === 'recall' || status === 'results' ? words.join(',') : ''}
        data-time-left={status === 'recall' ? timeLeft : ''}
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

      {status === 'recall' && (
        <div
          className={`${styles.timerBar}`}
          role="progressbar"
          aria-label="Time remaining"
          aria-valuenow={timeLeft}
          aria-valuemin={0}
          aria-valuemax={RECALL_SECONDS}
        >
          <div
            className={`${styles.timerProgress} ${timeLeft <= 10 ? styles.timerProgressLow : ''}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

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
        <div className={styles.previewScreen} data-testid="word-list">
          <p className={styles.previewLabel}>Memorize these words!</p>
          <div className={styles.wordList} aria-live="polite">
            {words.map((word) => (
              <span key={word} className={styles.previewWord}>
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {status === 'recall' && (
        <div className={styles.recallScreen}>
          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className={styles.wordInput}
              placeholder="Type a word…"
              aria-label="Type a word you remember"
              data-testid="word-input"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
            />
            <button
              className={styles.addButton}
              onClick={handleAddWord}
              aria-label="Add word"
              data-testid="add-button"
            >
              Add
            </button>
          </div>

          <div className={styles.chipList} aria-live="polite" aria-label="Words entered">
            {recalled.map((word) => (
              <span key={word} className={styles.chip} data-testid="recalled-chip">
                {word}
              </span>
            ))}
          </div>

          <div className={styles.doneRow}>
            <PrimaryButton onClick={finishRecall} data-testid="done-button">
              Done
            </PrimaryButton>
          </div>
        </div>
      )}

      {status === 'results' && (
        <div className={styles.resultsScreen} data-testid="results-screen">
          <div className={styles.roundScoreBanner}>
            <p
              className={`${styles.roundScoreLabel} ${roundScore === 0 ? styles.roundScoreZero : ''}`}
            >
              {roundScore === 0
                ? 'No words recalled'
                : `+${roundScore} word${roundScore === 1 ? '' : 's'}!`}
            </p>
          </div>

          <div className={styles.resultsColumns}>
            <div className={styles.resultsColumn}>
              <p className={styles.columnHeading}>You got</p>
              {results
                .filter((r) => r.recalled)
                .map((r) => (
                  <span
                    key={r.word}
                    className={styles.resultChipCorrect}
                    data-testid="correct-chip"
                  >
                    {r.word}
                  </span>
                ))}
            </div>
            <div className={styles.resultsColumn}>
              <p className={styles.columnHeading}>You missed</p>
              {results
                .filter((r) => !r.recalled)
                .map((r) => (
                  <span key={r.word} className={styles.resultChipMissed} data-testid="missed-chip">
                    {r.word}
                  </span>
                ))}
            </div>
          </div>

          <div className={styles.resultsActions}>
            {!isGameOver(roundScore) && (
              <PrimaryButton onClick={handleNextRound} data-testid="next-round-button">
                Next Round
              </PrimaryButton>
            )}
            <button
              className={styles.quitButton}
              onClick={() => handleQuit(totalScore)}
              data-testid="quit-button"
            >
              {isGameOver(roundScore) ? 'See Final Score' : 'Quit'}
            </button>
          </div>
        </div>
      )}
    </GameLayout>
  );
}
