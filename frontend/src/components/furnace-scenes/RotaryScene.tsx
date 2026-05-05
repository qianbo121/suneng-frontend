import styles from './FurnaceScenes.module.css';

export function RotaryScene() {
  return (
    <div className={`${styles.sceneRoot} ${styles.rotaryScene}`} data-mode="flow">
      <svg
        viewBox="0 0 900 620"
        className={styles.scene}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="转底炉工作示意动画"
      >
        <defs>
          <linearGradient id="bgRotaryCard" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#102334" />
            <stop offset="100%" stopColor="#081018" />
          </linearGradient>
          <radialGradient id="rotaryHeatCard" cx="50%" cy="50%" r="52%">
            <stop offset="0%" stopColor="#ffd66b" />
            <stop offset="55%" stopColor="#ffa827" />
            <stop offset="100%" stopColor="#ff6a2c" />
          </radialGradient>
        </defs>

        <rect width="900" height="620" fill="url(#bgRotaryCard)" />
        <rect x="104" y="118" width="692" height="326" rx="34" fill="#4b5d71" />
        <rect x="144" y="150" width="612" height="262" rx="28" fill="#1a2530" />
        <ellipse cx="450" cy="282" rx="236" ry="124" fill="url(#rotaryHeatCard)" opacity="0.82" />
        <ellipse cx="450" cy="282" rx="254" ry="140" fill="none" stroke="#6e8195" strokeWidth="22" />
        <ellipse cx="450" cy="282" rx="150" ry="78" fill="#202d3b" />

        <g className={styles.rotaryDisc}>
          <ellipse cx="450" cy="282" rx="208" ry="106" fill="none" stroke="#7e93a6" strokeWidth="18" opacity="0.95" />
          <ellipse cx="450" cy="282" rx="174" ry="88" fill="none" stroke="#dca85c" strokeWidth="4" opacity="0.48" strokeDasharray="14 14" />

          <g>
            <rect x="386" y="190" width="66" height="42" rx="10" fill="#d7dee5" />
            <rect x="458" y="188" width="48" height="36" rx="10" fill="#c7d1db" />
          </g>
          <g>
            <rect x="566" y="252" width="58" height="38" rx="10" fill="#d7dee5" />
            <rect x="626" y="250" width="44" height="30" rx="8" fill="#c7d1db" />
          </g>
          <g>
            <rect x="420" y="346" width="62" height="40" rx="10" fill="#d7dee5" />
            <rect x="486" y="350" width="46" height="30" rx="8" fill="#c7d1db" />
          </g>
          <g>
            <rect x="258" y="262" width="60" height="38" rx="10" fill="#d7dee5" />
            <rect x="322" y="258" width="42" height="28" rx="8" fill="#c7d1db" />
          </g>
        </g>

        <g>
          <path
            d="M274 218 C350 182, 548 182, 626 220"
            fill="none"
            stroke="#fff0ab"
            strokeWidth="10"
            strokeLinecap="round"
            className={styles.rotaryHeatPath}
          />
          <path
            d="M620 340 C540 382, 358 382, 282 342"
            fill="none"
            stroke="#ffc35d"
            strokeWidth="10"
            strokeLinecap="round"
            className={styles.rotaryHeatPath}
          />
        </g>

        <rect x="164" y="438" width="572" height="22" rx="11" fill="#314150" />
      </svg>
    </div>
  );
}
