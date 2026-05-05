import { PRODUCT_CENTER_CATEGORIES } from '@/constants/product-categories';
import { HotProductItem, ProductCategoryItem, ProductShowcaseItem } from '@/types/home';

export const productCategories: ProductCategoryItem[] = PRODUCT_CENTER_CATEGORIES.map((item) => ({
  id: item.id,
  slug: item.slug,
  name: item.name,
  image: item.image,
}));

export const hotProducts: HotProductItem[] = PRODUCT_CENTER_CATEGORIES.map((item) => ({
  id: item.id,
  slug: item.slug,
  name: item.name,
  model: item.model,
  image: item.image,
}));

export const productShowcases: ProductShowcaseItem[] = PRODUCT_CENTER_CATEGORIES.slice(0, 4).map((item) => ({
  id: item.id,
  key: item.key,
  name: item.name,
  description: item.showcaseDescription,
  image: item.image,
  href: `/products/detail/${item.slug}`,
}));
