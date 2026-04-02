import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.main}>
      <div className={styles.code}>404</div>
      <p className={styles.message}>That alias doesn&apos;t exist.</p>
      <Link href="/" className={styles.link}>
        ← Back to MP-5
      </Link>
    </main>
  );
}
