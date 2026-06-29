import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { ProductCategoryController } from '@/modules/product-category/product-category.controller';
import { ProductController } from '@/modules/product/product.controller';

describe('public product controllers', () => {
  it('exposes product category list as a public CMS endpoint', () => {
    const service = { getPublicList: jest.fn().mockReturnValue(['categories']) };
    const controller = new ProductCategoryController(service as never);

    expect(Reflect.getMetadata(IS_PUBLIC_KEY, controller.getPublicList)).toBe(true);
    expect(controller.getPublicList()).toEqual(['categories']);
    expect(service.getPublicList).toHaveBeenCalled();
  });

  it('exposes product list, hot list and detail as public CMS endpoints', () => {
    const service = {
      getPublicList: jest.fn().mockReturnValue(['products']),
      getHotList: jest.fn().mockReturnValue(['hot']),
      getPublicDetail: jest.fn().mockReturnValue({ slug: 'box-furnace' }),
    };
    const controller = new ProductController(service as never);

    expect(Reflect.getMetadata(IS_PUBLIC_KEY, controller.getPublicList)).toBe(true);
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, controller.getHotList)).toBe(true);
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, controller.getPublicDetail)).toBe(true);
    expect(controller.getPublicList({ page: 1, pageSize: 10 })).toEqual(['products']);
    expect(controller.getHotList()).toEqual(['hot']);
    expect(controller.getPublicDetail('box-furnace')).toEqual({ slug: 'box-furnace' });
  });
});
