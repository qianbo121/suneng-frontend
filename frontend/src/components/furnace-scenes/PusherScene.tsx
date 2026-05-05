import styles from './FurnaceScenes.module.css';

export function PusherScene() {
  return (
    <div className={`${styles.sceneRoot} ${styles.pusherScene}`} data-mode="flow">
      <svg
        viewBox="0 0 900 620"
        className={styles.scene}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="推杆炉工作示意动画"
      >
        <defs>
          <linearGradient id="bgPusherCard" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#112334" />
            <stop offset="100%" stopColor="#081019" />
          </linearGradient>
        </defs>

        <rect width="900" height="620" fill="url(#bgPusherCard)" />
        <rect x="76" y="172" width="748" height="226" rx="28" fill="#495b6f" />
        <rect x="104" y="198" width="692" height="174" rx="20" fill="#1a2530" />
        <rect x="104" y="198" width="180" height="174" rx="18" fill="#75c7ff" opacity="0.22" className={styles.zone} />
        <rect x="284" y="198" width="282" height="174" fill="#ff9f48" opacity="0.24" className={styles.zone} />
        <rect x="566" y="198" width="230" height="174" rx="18" fill="#8dd9c8" opacity="0.22" className={styles.zone} />

        <rect x="94" y="324" width="714" height="36" rx="16" fill="#324553" />
        <line x1="42" y1="342" x2="122" y2="342" stroke="#c9d9e4" strokeWidth="12" strokeLinecap="round" className={styles.pushRod} />
        <rect x="118" y="326" width="24" height="32" rx="8" fill="#dce6ed" className={styles.pushHead} />

        <g className={styles.pushTrays}>
          <g>
            <rect x="144" y="290" width="98" height="30" rx="10" fill="#7d95a7" />
            <rect x="162" y="260" width="62" height="26" rx="8" fill="#d7dee5" />
          </g>
          <g>
            <rect x="274" y="290" width="98" height="30" rx="10" fill="#7d95a7" />
            <rect x="292" y="260" width="62" height="26" rx="8" fill="#d7dee5" />
          </g>
          <g>
            <rect x="404" y="290" width="98" height="30" rx="10" fill="#7d95a7" />
            <rect x="422" y="260" width="62" height="26" rx="8" fill="#d7dee5" />
          </g>
        </g>

        <g>
          <rect x="326" y="214" width="20" height="142" rx="8" fill="#ffb454" className={styles.pushHeater} />
          <rect
            x="404"
            y="214"
            width="20"
            height="142"
            rx="8"
            fill="#ffb454"
            className={`${styles.pushHeater} ${styles.delay1}`}
          />
          <rect
            x="482"
            y="214"
            width="20"
            height="142"
            rx="8"
            fill="#ffb454"
            className={`${styles.pushHeater} ${styles.delay2}`}
          />
        </g>
      </svg>
    </div>
  );
}
