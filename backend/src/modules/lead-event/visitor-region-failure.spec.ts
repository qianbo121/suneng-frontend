/**
 * 地区解析是锦上添花，埋点事件本身才是主数据。
 * IP 库无论怎么坏，都不能让写入失败——这条属性必须有测试守着。
 */
describe('visitor region when the ip database misbehaves', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('ip2region');
  });

  it('returns empty instead of throwing when the lookup throws', async () => {
    jest.doMock('ip2region', () => ({
      __esModule: true,
      default: class {
        search() {
          throw new Error('数据文件损坏');
        }
      },
    }));
    const { resolveVisitorRegion } = await import('@/modules/lead-event/visitor-region');
    expect(resolveVisitorRegion('114.252.xxx.xxx')).toEqual({ province: null, city: null });
  });

  it('returns empty instead of throwing when the database cannot be opened at all', async () => {
    jest.doMock('ip2region', () => ({
      __esModule: true,
      default: class {
        constructor() {
          throw new Error('打不开数据文件');
        }
      },
    }));
    const { resolveVisitorRegion } = await import('@/modules/lead-event/visitor-region');
    expect(resolveVisitorRegion('114.252.xxx.xxx')).toEqual({ province: null, city: null });
  });
});
