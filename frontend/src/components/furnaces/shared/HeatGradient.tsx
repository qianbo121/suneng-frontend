type HeatGradientProps = {
  idPrefix: string;
};

export function HeatGradient({ idPrefix }: HeatGradientProps) {
  return (
    <defs>
      <linearGradient id={`${idPrefix}-scene`} x1="36" y1="22" x2="278" y2="178" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0B1526" />
        <stop offset="1" stopColor="#0F1E33" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-shell`} x1="110" y1="52" x2="266" y2="132" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5C6E82" />
        <stop offset="1" stopColor="#3A4A5E" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-workpiece`} x1="52" y1="94" x2="112" y2="132" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C8CFD8" />
        <stop offset="1" stopColor="#8F98A4" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-heat`} x1="118" y1="76" x2="246" y2="76" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF6A2C" />
        <stop offset="0.56" stopColor="#FFA827" />
        <stop offset="1" stopColor="#FFD66B" />
      </linearGradient>
      <radialGradient id={`${idPrefix}-glow`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(194 90) rotate(180) scale(82 56)">
        <stop stopColor="#FFD66B" stopOpacity="0.96" />
        <stop offset="0.55" stopColor="#FFA827" stopOpacity="0.54" />
        <stop offset="1" stopColor="#FF6A2C" stopOpacity="0" />
      </radialGradient>
      <filter id={`${idPrefix}-heat-blur`} x="-40%" y="-60%" width="180%" height="220%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
    </defs>
  );
}
