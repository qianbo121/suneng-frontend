import styles from './FurnaceScenes.module.css';

export function BoxScene() {
  return (
    <div className={`${styles.sceneRoot} ${styles.boxScene}`} data-mode="flow">
      <svg
        viewBox="0 0 900 620"
        className={styles.scene}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="箱式炉工作示意动画"
      >
        <defs>
          <linearGradient id="bgBox" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#102334" />
            <stop offset="100%" stopColor="#081018" />
          </linearGradient>
          <linearGradient id="boxHeat" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff8f39" />
            <stop offset="100%" stopColor="#ffd36e" />
          </linearGradient>
        </defs>
        <rect width="900" height="620" fill="url(#bgBox)" />
        <rect x="146" y="132" width="566" height="314" rx="30" fill="#526477" />
        <rect x="232" y="178" width="412" height="222" rx="22" fill="#1b2430" />
        <rect x="244" y="190" width="388" height="198" rx="18" fill="url(#boxHeat)" opacity="0.88" />
        <rect x="168" y="170" width="92" height="236" rx="18" fill="#94a6b7" className={styles.boxDoor} />
        <rect x="102" y="432" width="666" height="26" rx="13" fill="#314150" />

        <g className={styles.boxTray}>
          <rect x="92" y="370" width="210" height="28" rx="12" fill="#6886a3" />
          <rect x="130" y="330" width="48" height="34" rx="8" fill="#d4dde5" />
          <rect x="186" y="318" width="62" height="46" rx="8" fill="#d4dde5" />
        </g>

        <g>
          <path
            d="M340 250 C410 220, 492 220, 560 250"
            fill="none"
            stroke="#fff0ab"
            strokeWidth="10"
            strokeLinecap="round"
            className={styles.boxHeatPath}
          />
          <path
            d="M560 320 C488 350, 418 350, 348 320"
            fill="none"
            stroke="#ffc35d"
            strokeWidth="10"
            strokeLinecap="round"
            className={styles.boxHeatPath}
          />
        </g>
      </svg>
    </div>
  );
}
