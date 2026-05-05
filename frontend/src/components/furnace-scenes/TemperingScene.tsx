import styles from './FurnaceScenes.module.css';

export function TemperingScene() {
  return (
    <div className={`${styles.sceneRoot} ${styles.temperingScene}`} data-mode="flow">
      <svg
        viewBox="0 0 900 620"
        className={styles.scene}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="回火炉工作示意动画"
      >
        <defs>
          <linearGradient id="bgTemperCard" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#102334" />
            <stop offset="100%" stopColor="#081018" />
          </linearGradient>
          <linearGradient id="temperHeatCard" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff6a2c" />
            <stop offset="100%" stopColor="#ff9a3c" />
          </linearGradient>
        </defs>

        <rect width="900" height="620" fill="url(#bgTemperCard)" />
        <rect x="146" y="132" width="566" height="314" rx="30" fill="#526477" />
        <rect x="232" y="178" width="412" height="222" rx="22" fill="#1b2430" />
        <rect x="244" y="190" width="388" height="198" rx="18" fill="url(#temperHeatCard)" opacity="0.84" />
        <rect x="168" y="170" width="92" height="236" rx="18" fill="#94a6b7" className={styles.temperDoor} />
        <rect x="102" y="432" width="666" height="26" rx="13" fill="#314150" />

        <g className={styles.temperTray}>
          <rect x="92" y="370" width="210" height="28" rx="12" fill="#6886a3" />
          <rect x="130" y="330" width="48" height="34" rx="8" fill="#d4dde5" className={styles.temperLoad} />
          <rect x="186" y="318" width="62" height="46" rx="8" fill="#d4dde5" className={styles.temperLoad} />
        </g>

        <g>
          <path
            d="M340 250 C410 220, 492 220, 560 250"
            fill="none"
            stroke="#ffd6a4"
            strokeWidth="10"
            strokeLinecap="round"
            className={styles.temperHeatPath}
          />
          <path
            d="M560 320 C488 350, 418 350, 348 320"
            fill="none"
            stroke="#ffb06a"
            strokeWidth="10"
            strokeLinecap="round"
            className={styles.temperHeatPath}
          />
        </g>

        <g className={styles.temperFan}>
          <circle r="4" fill="#fff3c8" opacity="0.6" />
          <path
            d="M0,-28 A28,28 0 0 1 24,14"
            fill="none"
            stroke="#fff3c8"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M0,28 A28,28 0 0 1 -24,-14"
            fill="none"
            stroke="#fff3c8"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>
      </svg>
    </div>
  );
}
