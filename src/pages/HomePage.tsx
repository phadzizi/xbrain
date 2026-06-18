import { Link } from 'react-router-dom';
import { GameLayout, GameCard } from '../components';
import { useSettingsStore } from '../store/useSettingsStore';
import styles from './HomePage.module.css';

type Game = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  path: string;
  ready: boolean;
};

const GAMES: Game[] = [
  {
    id: 'card-flip',
    name: 'Card Flip',
    emoji: '🃏',
    description: 'Find matching pairs before time runs out.',
    path: '/games/card-flip',
    ready: true,
  },
  {
    id: 'simon-says',
    name: 'Simon Says',
    emoji: '🔴',
    description: 'Repeat the color sequence without making a mistake.',
    path: '/games/simon-says',
    ready: true,
  },
  {
    id: 'number-sequence',
    name: 'Number Sequence',
    emoji: '🔢',
    description: 'Memorize and type back a sequence of numbers.',
    path: '/games/number-sequence',
    ready: true,
  },
  {
    id: 'object-disappears',
    name: 'Object Disappears',
    emoji: '👀',
    description: 'Spot which object vanished from the group.',
    path: '/games/object-disappears',
    ready: true,
  },
  {
    id: 'word-recall',
    name: 'Word Recall',
    emoji: '📝',
    description: 'Remember as many words as you can.',
    path: '/games/word-recall',
    ready: true,
  },
  {
    id: 'pattern-copy',
    name: 'Pattern Copy',
    emoji: '🎨',
    description: 'Recreate the color pattern from memory.',
    path: '/games/pattern-copy',
    ready: false,
  },
  {
    id: 'position-grid',
    name: 'Position Grid',
    emoji: '🗺️',
    description: 'Remember where each object was placed.',
    path: '/games/position-grid',
    ready: false,
  },
];

export default function HomePage() {
  const { soundEnabled, toggleSound } = useSettingsStore();

  return (
    <GameLayout>
      <div className={styles.header}>
        <div>
          <h1 className={styles.appName}>xbrain</h1>
          <p className={styles.tagline}>Train your memory, one game at a time.</p>
        </div>
        <button
          className={styles.soundToggle}
          onClick={toggleSound}
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          data-testid="sound-toggle"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <ul className={styles.grid} aria-label="Games">
        {GAMES.map((game) => (
          <li key={game.id}>
            {game.ready ? (
              <Link to={game.path} className={styles.gameLink}>
                <GameCard>
                  <span className={styles.gameEmoji} aria-hidden="true">
                    {game.emoji}
                  </span>
                  <h2 className={styles.gameName}>{game.name}</h2>
                  <p className={styles.gameDesc}>{game.description}</p>
                </GameCard>
              </Link>
            ) : (
              <GameCard className={styles.comingSoon}>
                <span className={styles.gameEmoji} aria-hidden="true">
                  {game.emoji}
                </span>
                <h2 className={styles.gameName}>{game.name}</h2>
                <p className={styles.gameDesc}>{game.description}</p>
                <span className={styles.badge}>Coming soon</span>
              </GameCard>
            )}
          </li>
        ))}
      </ul>
    </GameLayout>
  );
}
