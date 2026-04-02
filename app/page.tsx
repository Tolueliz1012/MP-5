"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult("");
    setCopied(false);

    // Basic client-side URL validation
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setError("URL must start with http:// or https://");
        return;
      }
    } catch {
      setError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, alias }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        const shortened = `${window.location.origin}/${data.alias}`;
        setResult(shortened);
        setUrl("");
        setAlias("");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logo}>MP-5</div>
          <p className={styles.tagline}>Paste long. Share short.</p>
        </header>

        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="url">
                Long URL
              </label>
              <input
                id="url"
                type="text"
                className={styles.input}
                placeholder="https://example.com/very/long/url/goes/here"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="alias">
                Custom Alias
              </label>
              <div className={styles.aliasWrapper}>
                <span className={styles.aliasPrefix}>snip/</span>
                <input
                  id="alias"
                  type="text"
                  className={`${styles.input} ${styles.aliasInput}`}
                  placeholder="my-link"
                  value={alias}
                  onChange={(e) =>
                    setAlias(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  required
                  autoComplete="off"
                />
              </div>
              <span className={styles.hint}>
                Letters, numbers, and hyphens only
              </span>
            </div>

            {error && (
              <div className={styles.error}>
                <span className={styles.errorIcon}>!</span>
                {error}
              </div>
            )}

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : "Shorten URL →"}
            </button>
          </form>
        </div>

        {result && (
          <div className={styles.resultCard}>
            <p className={styles.resultLabel}>Your shortened URL</p>
            <div className={styles.resultRow}>
              <code className={styles.resultUrl}>{result}</code>
              <button
                className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        <footer className={styles.footer}>
          Built for CS391 · Next.js + MongoDB
        </footer>
      </div>
    </main>
  );
}
