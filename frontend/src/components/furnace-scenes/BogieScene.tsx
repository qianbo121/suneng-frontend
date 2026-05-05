import styles from './FurnaceScenes.module.css';

export function BogieScene() {
  return (
    <div className={`${styles.sceneRoot} ${styles.bogieScene}`} data-mode="flow">
      <svg
        viewBox="0 0 900 620"
        className={styles.scene}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="台车炉工作示意动画"
      >
        <defs>
          <linearGradient id="bgBogie" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10283a" />
            <stop offset="100%" stopColor="#07131d" />
          </linearGradient>
          <linearGradient id="furnaceGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff8a30" />
            <stop offset="100%" stopColor="#ffd36f" />
          </linearGradient>
          <linearGradient id="steelBar" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c8797" />
            <stop offset="100%" stopColor="#bfc8d2" />
          </linearGradient>
        </defs>

        <rect width="900" height="620" fill="url(#bgBogie)" />
        <rect x="54" y="458" width="792" height="96" rx="22" fill="#162433" />
        <rect x="72" y="492" width="748" height="8" rx="4" fill="#7fa5bc" opacity="0.4" />
        <rect x="72" y="516" width="748" height="8" rx="4" fill="#7fa5bc" opacity="0.28" />

        <g>
          <rect x="360" y="132" width="426" height="272" rx="28" fill="#48586a" />
          <rect x="386" y="156" width="374" height="220" rx="18" fill="#1c2430" />
          <rect x="392" y="162" width="362" height="208" rx="16" fill="url(#furnaceGlow)" opacity="0.86" />
          <rect x="360" y="104" width="426" height="42" rx="14" fill="#708195" />
          <rect x="340" y="120" width="30" height="286" rx="12" fill="#8194a6" />
          <rect x="346" y="96" width="18" height="54" rx="8" fill="#9eb0bf" className={styles.doorLift} />
          <rect x="332" y="76" width="44" height="24" rx="8" fill="#b5c1cb" />
        </g>

        <g className={styles.bogieCart}>
          <rect x="122" y="396" width="246" height="70" rx="16" fill="#426077" />
          <rect x="110" y="382" width="270" height="22" rx="10" fill="#587995" />
          <circle cx="158" cy="472" r="19" fill="#1b2633" />
          <circle cx="310" cy="472" r="19" fill="#1b2633" />
          <circle cx="158" cy="472" r="8" fill="#96aab7" />
          <circle cx="310" cy="472" r="8" fill="#96aab7" />
          <g className={styles.bogieLoad}>
            <rect x="146" y="330" width="54" height="54" rx="8" fill="url(#steelBar)" />
            <rect x="210" y="312" width="72" height="72" rx="10" fill="url(#steelBar)" />
            <rect x="292" y="336" width="44" height="48" rx="8" fill="url(#steelBar)" />
          </g>
        </g>

        <g>
          <path
            d="M270 270 C392 212, 520 210, 658 230"
            fill="none"
            stroke="#fff0ab"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.6"
            className={styles.heatPath}
          />
          <path
            d="M650 278 C532 328, 472 344, 404 326"
            fill="none"
            stroke="#ffc35d"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.6"
            className={styles.heatPath}
          />
        </g>
      </svg>
    </div>
  );
}
