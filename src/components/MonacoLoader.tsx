import styles from './MonacoLoader.module.css';

export function MonacoLoader() {
  return (
    <div className={styles.loader}>
      <div className={styles.ring} />
      <span className={styles.text}>Loading editor…</span>
    </div>
  );
}
