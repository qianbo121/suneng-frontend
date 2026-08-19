/**
 * 从已脱敏的访客 IP 解析客户所在地。
 *
 * 为什么用得上：入库时存的是 `114.252.xxx.xxx`——后两段打了码，
 * 但前两段（/16 网段）在国内足够定到省。2026-08-19 拿生产库里
 * 273 个真实网段实测，覆盖率 94.9%。
 *
 * 为什么用 ip2region 而不是 MaxMind：同一批网段实测，
 * geoip-lite（MaxMind）在国内基本只返回 "CN"，省市全无；
 * ip2region 能到省/市/运营商，体积还小一个数量级（12MB vs 163MB）。
 *
 * 离线查库，访客 IP 一个字节都不出服务器。
 */
import Ip2Region from 'ip2region';

type RegionRow = {
  province?: string | null;
  city?: string | null;
  isp?: string | null;
};

export type VisitorRegion = { province: string | null; city: string | null };

const EMPTY: VisitorRegion = { province: null, city: null };

// ip2region 查不到时会返回这些占位值，不能当成真实地区写进库
const PLACEHOLDERS = new Set(['0', '内网IP', '未分配或者内网IP', '', '-']);

let searcher: { search: (ip: string) => RegionRow | null } | null = null;
let searcherFailed = false;

function getSearcher() {
  if (searcher || searcherFailed) return searcher;
  try {
    const Ctor = (Ip2Region as unknown as { default?: unknown }).default ?? Ip2Region;
    searcher = new (Ctor as new () => { search: (ip: string) => RegionRow | null })();
  } catch {
    // 查库失败绝不能挡住埋点写入——地区是锦上添花，事件本身才是主数据
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

/**
 * 把脱敏 IP 还原成可查询的形式：114.252.xxx.xxx → 114.252.0.1。
 * 只用前两段，后两段本来就没存，不存在"还原真实 IP"这回事。
 */
export function probeAddress(maskedIp: string | null | undefined) {
  const text = String(maskedIp ?? '').trim();
  const match = text.match(/^(\d{1,3})\.(\d{1,3})\./);
  if (!match) return null;
  const [a, b] = [Number(match[1]), Number(match[2])];
  if (!Number.isInteger(a) || !Number.isInteger(b) || a > 255 || b > 255) return null;
  return `${a}.${b}.0.1`;
}

export function resolveVisitorRegion(maskedIp: string | null | undefined): VisitorRegion {
  const probe = probeAddress(maskedIp);
  if (!probe) return EMPTY;
  const instance = getSearcher();
  if (!instance) return EMPTY;
  try {
    const row = instance.search(probe);
    if (!row) return EMPTY;
    return { province: clean(row.province), city: clean(row.city) };
  } catch {
    return EMPTY;
  }
}
