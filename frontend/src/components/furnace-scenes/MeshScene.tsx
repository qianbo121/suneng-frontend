import styles from './FurnaceScenes.module.css';

export function MeshScene() {
  return (
    <div className={`${styles.sceneRoot} ${styles.meshScene}`} data-mode="flow">
      <svg
        viewBox="0 0 900 620"
        className={styles.scene}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="网带炉工作示意动画"
      >
        <defs>
          <linearGradient id="bgMesh" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d2030" />
            <stop offset="100%" stopColor="#091118" />
          </linearGradient>
        </defs>
        <rect width="900" height="620" fill="url(#bgMesh)" />
        <rect x="46" y="166" width="808" height="252" rx="34" fill="#495c71" />
        <rect x="76" y="198" width="748" height="188" rx="24" fill="#1a2530" />
        <rect x="78" y="200" width="218" height="184" rx="22" fill="#6cb4ff" className={styles.zone} />
        <rect x="298" y="200" width="302" height="184" fill="#ff9e45" className={styles.zone} />
        <rect x="600" y="200" width="222" height="184" rx="22" fill="#86d8cb" className={styles.zone} />

        <g>
          <rect x="330" y="214" width="18" height="156" rx="8" fill="#ffb454" className={styles.heaterPulse} />
          <rect
            x="390"
            y="214"
            width="18"
            height="156"
            rx="8"
            fill="#ffb454"
            className={`${styles.heaterPulse} ${styles.delay1}`}
          />
          <rect
            x="450"
            y="214"
            width="18"
            height="156"
            rx="8"
            fill="#ffb454"
            className={`${styles.heaterPulse} ${styles.delay2}`}
          />
          <rect
            x="510"
            y="214"
            width="18"
            height="156"
            rx="8"
            fill="#ffb454"
            className={`${styles.heaterPulse} ${styles.delay3}`}
          />
          <rect
            x="570"
            y="214"
            width="18"
            height="156"
            rx="8"
            fill="#ffb454"
            className={`${styles.heaterPulse} ${styles.delay4}`}
          />
        </g>

        <g>
          <rect x="112" y="332" width="676" height="30" rx="14" fill="#2c4456" />
          <path
            d="M122 346 H778"
            stroke="#b0dfff"
            strokeWidth="10"
            strokeDasharray="10 10"
            strokeLinecap="round"
            className={styles.beltFlow}
          />
          <circle cx="112" cy="347" r="28" fill="#263643" />
          <circle cx="788" cy="347" r="28" fill="#263643" />
          <circle cx="112" cy="347" r="12" fill="#8aa1b3" />
          <circle cx="788" cy="347" r="12" fill="#8aa1b3" />
        </g>

        <g className={styles.meshProducts}>
          <rect x="156" y="304" width="42" height="24" rx="8" fill="#c6d0da" />
          <rect x="232" y="304" width="42" height="24" rx="8" fill="#c6d0da" />
          <rect x="308" y="304" width="42" height="24" rx="8" fill="#c6d0da" />
        </g>
      </svg>
    </div>
  );
}
