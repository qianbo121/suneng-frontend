import styles from './FurnaceScenes.module.css';

export function BellScene() {
  return (
    <div className={`${styles.sceneRoot} ${styles.bellScene}`} data-mode="flow">
      <svg
        viewBox="0 0 900 620"
        className={styles.scene}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="罩式炉工作示意动画"
      >
        <defs>
          <linearGradient id="bgBellCard" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#102334" />
            <stop offset="100%" stopColor="#081018" />
          </linearGradient>
          <radialGradient id="bellHeatCard" cx="50%" cy="54%" r="62%">
            <stop offset="0%" stopColor="#ffd66b" />
            <stop offset="55%" stopColor="#ffa827" />
            <stop offset="100%" stopColor="#ff6a2c" />
          </radialGradient>
        </defs>

        <rect width="900" height="620" fill="url(#bgBellCard)" />
        <rect x="170" y="410" width="560" height="44" rx="18" fill="#314150" />
        <rect x="214" y="384" width="470" height="26" rx="12" fill="#415368" />

        <g className={styles.bellLoad}>
          <rect x="294" y="340" width="86" height="48" rx="12" fill="#d7dee5" />
          <rect x="392" y="320" width="116" height="68" rx="14" fill="#c6d0d9" />
          <rect x="526" y="350" width="78" height="38" rx="10" fill="#b3beca" />
        </g>

        <g className={styles.bellCover}>
          <path
            d="M246 202 C278 144, 350 116, 450 116 C550 116, 622 144, 654 202 L654 372 C654 392, 638 408, 618 408 L282 408 C262 408, 246 392, 246 372 Z"
            fill="#5b6e82"
          />
          <path
            d="M274 226 C300 182, 358 160, 450 160 C542 160, 600 182, 626 226 L626 362 C626 378, 614 390, 598 390 L302 390 C286 390, 274 378, 274 362 Z"
            fill="#202c39"
          />
          <path
            d="M296 242 C320 206, 370 188, 450 188 C530 188, 580 206, 604 242 L604 352 C604 366, 592 378, 578 378 L322 378 C308 378, 296 366, 296 352 Z"
            fill="url(#bellHeatCard)"
            opacity="0.82"
          />
          <rect x="350" y="122" width="200" height="18" rx="9" fill="#6f8296" opacity="0.9" />
          <rect x="410" y="92" width="80" height="34" rx="10" fill="#90a3b7" />

          <g className={styles.bellHeater}>
            <rect x="340" y="232" width="18" height="118" rx="8" fill="#ffb454" />
            <rect x="440" y="222" width="18" height="132" rx="8" fill="#ffb454" />
            <rect x="542" y="232" width="18" height="118" rx="8" fill="#ffb454" />
          </g>

          <g>
            <path
              d="M340 252 C404 218, 492 218, 562 252"
              fill="none"
              stroke="#fff0ab"
              strokeWidth="10"
              strokeLinecap="round"
              className={styles.bellHeatPath}
            />
            <path
              d="M562 324 C494 356, 404 356, 338 324"
              fill="none"
              stroke="#ffc35d"
              strokeWidth="10"
              strokeLinecap="round"
              className={styles.bellHeatPath}
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
