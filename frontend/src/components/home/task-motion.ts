export type TaskMotionKind = 'heat-treatment-line' | 'furnace-selection' | 'old-furnace-diagnosis';

const smooth = (value: number) => {
  const x = Math.max(0, Math.min(1, value));
  return x * x * x * (x * (x * 6 - 15) + 10);
};

const action = (t: number, start: number, peak: number, hold: number, end: number) =>
  t < start
    ? 0
    : t < peak
      ? smooth((t - start) / (peak - start))
      : t < hold
        ? 1
        : t < end
          ? 1 - smooth((t - hold) / (end - hold))
          : 0;

/** The short introduction shows one complete mechanical gesture per card. */
export function taskMotionTime(kind: TaskMotionKind, progress: number, introduction: boolean) {
  const p = Math.max(0, Math.min(1, progress));
  if (kind === 'heat-treatment-line') return p * (introduction ? 1.4 : 4.8);
  if (kind === 'furnace-selection') return p * (introduction ? 3.2 : 11);
  if (!introduction) return p * 12;
  return p < 0.5 ? 0.5 + p * 3 : 8.5 + (p - 0.5) * 3;
}

export function createTaskMotion(svg: SVGSVGElement, kind: TaskMotionKind) {
  const part = <T extends SVGElement = SVGGElement>(name: string) =>
    svg.querySelector<T>(`[data-part="${name}"]`)!;
  if (kind === 'furnace-selection') {
    const pit = part('sm-pit'),
      hood = part('sm-hood'),
      door = part('sm-door');
    const inside = part('sm-door-inside'),
      outside = part('sm-door-outside'),
      piston = part('sm-piston');
    return (seconds: number) => {
      const t = seconds % 11;
      const p = action(t, 0.5, 1.65, 2.05, 3.2),
        b = action(t, 3.3, 4.6, 5, 6.3),
        h = action(t, 6.4, 7.75, 8.3, 9.65);
      const py = 80 * (1 - p);
      pit.setAttribute('transform', `translate(0 ${py})`);
      hood.setAttribute('transform', `translate(0 ${62 * (1 - h)})`);
      piston.setAttribute('d', `M90 172V${217 + py}M96 172V${217 + py}`);
      const angle = b * 2.33,
        dx = -210 * Math.cos(angle),
        dy = (24 * Math.sin(angle)) / Math.sin(2.33);
      const a = dx / 153,
        shear = (dy - 19) / 153;
      door.setAttribute('transform', `matrix(${a} ${shear} 0 1 ${855 * (1 - a)} ${-855 * shear})`);
      inside.style.display = angle > Math.PI / 2 ? '' : 'none';
      outside.style.display = angle > Math.PI / 2 ? 'none' : '';
    };
  }
  if (kind === 'old-furnace-diagnosis') {
    const door = part('so-door'),
      tray = part('so-tray'),
      inspection = part('so-inspection');
    const one = part('so-wheel-one'),
      two = part('so-wheel-two');
    return (seconds: number) => {
      const t = seconds % 12,
        opened = action(t, 0.5, 2, 8.5, 10),
        extended = action(t, 2.2, 4.2, 6.5, 8.3);
      door.setAttribute('transform', `translate(0 ${-103 * opened})`);
      tray.setAttribute('transform', `translate(${-140 * (1 - extended)} ${-18 * (1 - extended)})`);
      one.setAttribute('transform', `rotate(${extended * 470} 578 315)`);
      two.setAttribute('transform', `rotate(${extended * 470} 668 329)`);
      inspection.setAttribute('opacity', String(action(t, 4.2, 4.9, 6.1, 6.5)));
    };
  }

  const ns = 'http://www.w3.org/2000/svg';
  const append = (tag: string, attributes: Record<string, string | number>, parent: SVGElement) => {
    const element = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    parent.appendChild(element);
    return element;
  };
  const smallTreads = part('sl-small-treads'),
    largeTreads = part('sl-large-treads');
  const smallParts = part('sl-small-parts'),
    largeParts = part('sl-large-parts'),
    wheelGroup = part('sl-wheels');
  [smallTreads, largeTreads, smallParts, largeParts, wheelGroup].forEach((group) =>
    group.replaceChildren(),
  );
  for (let k = -3; k < 25; k++) {
    append('path', { d: `M${k * 11} 280l10 17` }, smallTreads);
    append('path', { d: `M${k * 13} 358l38 88` }, largeTreads);
  }
  const pieceId = part('sl-workpiece').id,
    metalId = part('sl-metal').id;
  const small = Array.from({ length: 4 }, () => append('use', { href: `#${pieceId}` }, smallParts));
  const large = Array.from({ length: 4 }, () => append('use', { href: `#${pieceId}` }, largeParts));
  const wheels = Array.from({ length: 8 }, (_, i) => {
    const cx = 80 + i * 25,
      cy = 443 - (cx - 80) * 0.177;
    const wheel = append('g', {}, wheelGroup);
    append(
      'ellipse',
      { cx, cy, rx: 9, ry: 11, fill: `url(#${metalId})`, stroke: '#466680', 'stroke-width': 1.2 },
      wheel,
    );
    const spokes = append('g', {}, wheel);
    append(
      'path',
      {
        d: `M${cx - 5} ${cy}H${cx + 5}M${cx} ${cy - 7}V${cy + 7}`,
        stroke: '#647f94',
        'stroke-width': 1.1,
      },
      spokes,
    );
    append('ellipse', { cx, cy, rx: 2, ry: 2.5, fill: '#6b8397' }, wheel);
    return { spokes, cx, cy };
  });
  return (seconds: number) => {
    smallTreads.setAttribute('transform', `translate(${(seconds * 12) % 11} -6)`);
    largeTreads.setAttribute('transform', `translate(${(seconds * 22) % 13} 0)`);
    small.forEach((piece, i) => {
      const x = -18 + ((seconds * 12 + i * 48) % 192);
      piece.setAttribute('transform', `translate(${x} ${285 - x * 0.087}) scale(.57)`);
    });
    large.forEach((piece, i) => {
      const x = 42 + ((seconds * 22 + i * 70) % 280);
      piece.setAttribute('transform', `translate(${x} ${421 - (x - 42) * 0.157}) scale(1.24)`);
    });
    wheels.forEach(({ spokes, cx, cy }) =>
      spokes.setAttribute('transform', `rotate(${(seconds * 145) % 360} ${cx} ${cy})`),
    );
  };
}
