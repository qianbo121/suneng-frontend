// @vitest-environment jsdom
import { act, createElement } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FooterDouyinCode } from './FooterDouyinCode';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | undefined;
let root: Root | undefined;

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  root = undefined;
  container?.remove();
  container = undefined;
  vi.restoreAllMocks();
});

describe('footer Douyin code hydration', () => {
  it.each(['抖音二维码', 'Douyin QR'])('retains the %s clip and image when root identifiers differ', async (label) => {
    const component = createElement(FooterDouyinCode, { label });
    container = document.createElement('div');
    container.innerHTML = renderToString(component, { identifierPrefix: 'server-route-' });
    document.body.appendChild(container);
    const serverMarkup = container.innerHTML;
    const errors = vi.spyOn(console, 'error');
    const warnings = vi.spyOn(console, 'warn');
    const recovered: unknown[] = [];

    await act(async () => {
      root = hydrateRoot(container!, component, {
        identifierPrefix: 'browser-route-',
        onRecoverableError: (error) => recovered.push(error),
      });
    });

    expect(errors).not.toHaveBeenCalled();
    expect(warnings).not.toHaveBeenCalled();
    expect(recovered).toEqual([]);
    expect(container.innerHTML).toBe(serverMarkup);
    const svg = container.querySelector('svg')!;
    const clip = svg.querySelector('clipPath')!;
    const image = svg.querySelector('image')!;
    expect(svg.getAttribute('aria-label')).toBe(label);
    expect(svg.getAttribute('viewBox')).toBe('208 248 808 808');
    expect(svg.getAttribute('width')).toBe('124');
    expect(svg.getAttribute('height')).toBe('124');
    expect(image.getAttribute('clip-path')).toBe(`url(#${clip.id})`);
    expect(image.getAttribute('href')).toBe('/images/footer/douyin-code-original-20260907.png');
    expect(image.getAttribute('width')).toBe('1219');
    expect(image.getAttribute('height')).toBe('1820');
    expect(Array.from(clip.querySelectorAll('circle'), (circle) => [
      circle.getAttribute('cx'), circle.getAttribute('cy'), circle.getAttribute('r'),
    ])).toEqual([['609', '650', '388'], ['846', '414', '91']]);
  });
});
