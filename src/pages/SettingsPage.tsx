import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { GameLayout } from '../components';
import { clearBestScore } from '../services/storage';
import { useSettingsStore } from '../store/useSettingsStore';
import styles from './SettingsPage.module.css';

const GAME_IDS = [
  'card-flip',
  'simon-says',
  'number-sequence',
  'object-disappears',
  'word-recall',
  'pattern-copy',
  'position-grid',
];

export default function SettingsPage() {
  const { soundEnabled, toggleSound } = useSettingsStore();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [cleared, setCleared] = useState(false);
  const clearedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearedTimerRef.current !== null) clearTimeout(clearedTimerRef.current);
    };
  }, []);

  function handleClearAll() {
    GAME_IDS.forEach((id) => clearBestScore(id));
    setConfirmingClear(false);
    setCleared(true);
    if (clearedTimerRef.current !== null) clearTimeout(clearedTimerRef.current);
    clearedTimerRef.current = setTimeout(() => setCleared(false), 2000);
  }

  return (
    <GameLayout title="Settings" backHref="/">
      <div className={styles.page}>
        <section className={styles.section} aria-labelledby="sound-heading">
          <h2 className={styles.sectionHeading} id="sound-heading">
            Sound
          </h2>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Sound effects</span>
            <button
              className={styles.toggle}
              onClick={toggleSound}
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              data-testid="settings-sound-toggle"
            >
              <span className={styles.toggleEmoji} aria-hidden="true">
                {soundEnabled ? '🔊' : '🔇'}
              </span>
              <span className={styles.toggleLabel}>{soundEnabled ? 'On' : 'Off'}</span>
            </button>
          </div>
        </section>

        <div className={styles.divider} role="separator" />

        <section className={styles.section} aria-labelledby="scores-heading">
          <h2 className={styles.sectionHeading} id="scores-heading">
            Best Scores
          </h2>
          <p className={styles.sectionDesc}>Remove all saved best scores from this device.</p>

          {confirmingClear ? (
            <div className={styles.confirmBox} role="alert">
              <p className={styles.confirmText}>This will delete all best scores. Are you sure?</p>
              <div className={styles.confirmActions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setConfirmingClear(false)}
                  data-testid="clear-scores-cancel"
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmBtn}
                  onClick={handleClearAll}
                  data-testid="clear-scores-confirm"
                >
                  Yes, clear all
                </button>
              </div>
            </div>
          ) : cleared ? (
            <p className={styles.clearedMsg} role="status" data-testid="scores-cleared-msg">
              All scores cleared ✓
            </p>
          ) : (
            <button
              className={styles.dangerBtn}
              onClick={() => setConfirmingClear(true)}
              data-testid="clear-scores-button"
            >
              Clear all scores
            </button>
          )}
        </section>

        <div className={styles.divider} role="separator" />

        <section className={styles.section} aria-labelledby="legal-heading">
          <h2 className={styles.sectionHeading} id="legal-heading">
            Legal
          </h2>
          <Link to="/privacy" className={styles.link} data-testid="privacy-link">
            Privacy Policy
          </Link>
        </section>
      </div>
    </GameLayout>
  );
}
