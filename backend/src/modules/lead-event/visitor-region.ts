/**
 * 将访客 IP 解析到省市。
 *
 * 新事件只在请求入库前用完整 IPv4 做一次本地查询；完整 IP 不写库、不记日志、
 * 不发给第三方。数据库仍然只保留脱敏后的前两段。
 *
 * 历史数据只剩 /16 网段，不再用固定 `.0.1` 猜省份。只有整个网段的抽样结果
 * 都指向同一省时才允许回填；跨省移动网段保持未知。
 */
import Ip2Region from 'ip2region';

type RegionRow = {
  province?: string | null;
  city?: string | null;
  isp?: string | null;
};

export type VisitorRegion = { province: string | null; city: string | null };

const EMPTY: VisitorRegion = { province: null, city: null };
const PLACEHOLDERS = new Set(['0', '内网IP', '未分配或者内网IP', '', '-']);

let searcher: { search: (ip: string) => RegionRow | null } | null = null;
let searcherFailed = false;

function getSearcher() {
  if (searcher || searcherFailed) return searcher;
  try {
    const Ctor = (Ip2Region as unknown as { default?: unknown }).default ?? Ip2Region;
    searcher = new (Ctor as new () => { search: (ip: string) => RegionRow | null })();
  } catch {
    searcherFailed = true;
    searcher = null;
  }
  return searcher;
}

function clean(value: string | null | undefined) {
  const text = String(value ?? '').trim();
  if (!text || PLACEHOLDERS.has(text)) return null;
  return text.slice(0, 120);
}

/** 只接受真实完整的 IPv4；脱敏地址不允许伪造成某一个完整地址。 */
export function exactIpv4(value: string | null | undefined) {
  const text = String(value ?? '').trim();
  const match = text.match(/(?:^|:)(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return null;
  const parts = match.slice(1).map(Number);
  if (parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return null;
  return parts.join('.');
}

function lookup(ip: string): VisitorRegion {
  const instance = getSearcher();
  if (!instance) return EMPTY;
  try {
    const row = instance.search(ip);
    if (!row) return EMPTY;
    return { province: clean(row.province), city: clean(row.city) };
  } catch {
    return EMPTY;
  }
}

/** 新事件使用：完整 IP 只在这次函数调用期间存在。 */
export function resolveVisitorRegion(rawIp: string | null | undefined): VisitorRegion {
  const ip = exactIpv4(rawIp);
  return ip ? lookup(ip) : EMPTY;
}

/**
 * 历史回填使用：每个 /24 取首尾两个地址，共核对 512 个点。
 * 只要出现多个省，或可解析覆盖低于 75%，整个网段就按未知处理。
 */
export function resolveStableMaskedRegion(maskedIp: string | null | undefined): VisitorRegion {
  const match = String(maskedIp ?? '')
    .trim()
    .match(/^(\d{1,3})\.(\d{1,3})\.xxx\.xxx$/);
  if (!match) return EMPTY;
  const first = Number(match[1]);
  const second = Number(match[2]);
  if ([first, second].some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return EMPTY;
  }

  const provinces = new Set<string>();
  const cities = new Set<string>();
  let resolved = 0;
  let cityResolved = 0;
  const sampleCount = 512;
  for (let third = 0; third <= 255; third += 1) {
    for (const host of [1, 254]) {
      const region = lookup(`${first}.${second}.${third}.${host}`);
      if (!region.province) continue;
      resolved += 1;
      provinces.add(region.province);
      if (region.city) {
        cityResolved += 1;
        cities.add(region.city);
      }
      if (provinces.size > 1) return EMPTY;
    }
  }
  if (resolved < sampleCount * 0.75 || provinces.size !== 1) return EMPTY;
  return {
    province: [...provinces][0] ?? null,
    city: cityResolved === resolved && cities.size === 1 ? [...cities][0] : null,
  };
}
