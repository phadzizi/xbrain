import { GameLayout } from '../components';
import styles from './PrivacyPage.module.css';

export default function PrivacyPage() {
  return (
    <GameLayout title="Privacy Policy" backHref="/">
      <article className={styles.article}>
        <p className={styles.updated}>Last updated: June 2026</p>

        <section className={styles.section}>
          <h2 className={styles.heading}>Overview</h2>
          <p className={styles.body}>
            xbrain is a collection of offline memory-training games. We designed it with privacy as
            a default: the app collects no personal data, creates no accounts, and never contacts
            any external server.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Data we collect</h2>
          <p className={styles.body}>
            <strong className={styles.strong}>None.</strong> Your best scores are saved in your
            device&apos;s local storage (<code className={styles.code}>localStorage</code>). This
            data never leaves your device, is not transmitted to us or any third party, and is
            deleted when you clear your browser&apos;s site data.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Third-party services</h2>
          <p className={styles.body}>
            xbrain uses no analytics, advertising, crash-reporting, or social login services. There
            are no trackers, no cookies, and no third-party SDKs that phone home.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Permissions</h2>
          <p className={styles.body}>
            The app requests no device permissions beyond what is required to run a web application
            (audio playback for optional sound effects). No microphone, camera, contacts, or
            location access is requested.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Children</h2>
          <p className={styles.body}>
            Because no data is collected, xbrain is safe for users of all ages. We do not knowingly
            collect any information from children or anyone else.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Contact</h2>
          <p className={styles.body}>
            If you have any questions about this privacy policy, please email{' '}
            <a className={styles.link} href="mailto:PiyazheH@vertice.software">
              PiyazheH@vertice.software
            </a>
            .
          </p>
        </section>
      </article>
    </GameLayout>
  );
}
