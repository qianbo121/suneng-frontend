import styles from './FurnaceScenes.module.css';

export function PitScene() {
  return (
    <div className={`${styles.sceneRoot} ${styles.pitScene}`} data-mode="flow">
      <svg
        viewBox="0 0 900 620"
        className={styles.scene}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="井式炉工作示意动画"
      >
        <defs>
          <linearGradient id="bgPit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#101f31" />
            <stop offset="100%" stopColor="#091017" />
          </linearGradient>
          <linearGradient id="pitGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd260" />
            <stop offset="100%" stopColor="#ff8d37" />
          </linearGradient>
        </defs>
        <rect width="900" height="620" fill="url(#bgPit)" />
        <rect x="0" y="126" width="900" height="100" fill="#263341" />
        <rect x="0" y="210" width="900" height="410" fill="#15202c" />
        <g>
          <ellipse cx="450" cy="216" rx="186" ry="46" fill="#7e90a3" />
          <ellipse cx="450" cy="220" rx="150" ry="30" fill="#324150" />
          <rect x="264" y="216" width="372" height="246" rx="28" fill="#55687b" />
          <rect x="300" y="238" width="300" height="208" rx="20" fill="#1b2430" />
          <rect x="308" y="246" width="284" height="192" rx="18" fill="url(#pitGlow)" opacity="0.9" />
        </g>
        <g className={styles.pitLidGroup}>
          <ellipse cx="450" cy="148" rx="176" ry="38" fill="#8fa1b2" />
          <ellipse cx="450" cy="148" rx="118" ry="22" fill="#a7b6c1" />
          <rect x="438" y="56" width="24" height="92" rx="10" fill="#bcc8d0" />
          <rect x="394" y="44" width="112" height="24" rx="10" fill="#d4dde4" />
        </g>
        <g className={styles.pitLoadGroup}>
          <line x1="450" y1="68" x2="450" y2="190" stroke="#eaf3f8" strokeWidth="8" strokeLinecap="round" />
          <rect x="412" y="178" width="76" height="108" rx="18" fill="#cad2da" />
        </g>
        <g>
          <path
            d="M354 390 C340 330, 336 286, 352 252"
            fill="none"
            stroke="#ffec9f"
            strokeWidth="10"
            strokeLinecap="round"
            className={styles.pitFlow}
          />
          <path
            d="M546 252 C564 288, 562 336, 548 388"
            fill="none"
            stroke="#ffcf73"
            strokeWidth="10"
            strokeLinecap="round"
            className={styles.pitFlow}
          />
        </g>
      </svg>
    </div>
  );
}
