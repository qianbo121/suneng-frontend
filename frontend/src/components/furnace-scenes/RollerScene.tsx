import styles from './FurnaceScenes.module.css';

export function RollerScene() {
  const workpieces = [
    { key: 'a', trayWidth: 104, loadX: 18, loadWidth: 64, loadHeight: 28 },
    { key: 'b', trayWidth: 96, loadX: 20, loadWidth: 56, loadHeight: 24 },
    { key: 'c', trayWidth: 108, loadX: 22, loadWidth: 62, loadHeight: 26 },
    { key: 'd', trayWidth: 100, loadX: 19, loadWidth: 58, loadHeight: 24 },
  ];

  return (
    <div className={`${styles.sceneRoot} ${styles.rollerScene}`} data-mode="flow">
      <svg
        viewBox="0 0 900 620"
        className={styles.scene}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="辊底炉工作示意动画"
      >
        <defs>
          <linearGradient id="bgRollerCard" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#112334" />
            <stop offset="100%" stopColor="#081019" />
          </linearGradient>
        </defs>

        <rect width="900" height="620" fill="url(#bgRollerCard)" />
        <rect x="76" y="172" width="748" height="226" rx="28" fill="#495b6f" />
        <rect x="104" y="198" width="692" height="174" rx="20" fill="#1a2530" />
        <rect x="104" y="198" width="180" height="174" rx="18" fill="#75c7ff" opacity="0.22" className={styles.zone} />
        <rect x="284" y="198" width="282" height="174" fill="#ff9f48" opacity="0.24" className={styles.zone} />
        <rect x="566" y="198" width="230" height="174" rx="18" fill="#8dd9c8" opacity="0.22" className={styles.zone} />

        <rect x="94" y="324" width="714" height="36" rx="16" fill="#324553" />

        <g>
          {[250, 320, 390, 460, 530, 600, 670].map((x) => (
            <g key={x} transform={`translate(${x},430)`}>
              <g className={styles.roller}>
                <circle r="18" fill="#3f4e60" stroke="#6c7d90" strokeWidth="2" />
                <line x1="-14" y1="0" x2="14" y2="0" stroke="#92a3b5" strokeWidth="2" />
              </g>
            </g>
          ))}
        </g>

        {workpieces.map((piece, index) => (
          <g
            key={piece.key}
            className={styles.rollerTray}
            style={{ animationDelay: `${index * -1.1}s` }}
          >
            <g transform="translate(138,0)">
              <rect x="0" y="290" width={piece.trayWidth} height="30" rx="10" fill="#7d95a7" />
              <rect
                x={piece.loadX}
                y={260}
                width={piece.loadWidth}
                height={piece.loadHeight}
                rx="8"
                fill="#d7dee5"
              />
            </g>
          </g>
        ))}

        <g>
          <rect x="326" y="214" width="20" height="142" rx="8" fill="#ffb454" className={styles.rollerHeater} />
          <rect
            x="404"
            y="214"
            width="20"
            height="142"
            rx="8"
            fill="#ffb454"
            className={`${styles.rollerHeater} ${styles.delay1}`}
          />
          <rect
            x="482"
            y="214"
            width="20"
            height="142"
            rx="8"
            fill="#ffb454"
            className={`${styles.rollerHeater} ${styles.delay2}`}
          />
        </g>
      </svg>
    </div>
  );
}
