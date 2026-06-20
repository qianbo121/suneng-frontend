import { PRODUCT_CENTER_CATEGORIES } from '@/constants/product-categories';
import { HotProductItem, ProductCategoryItem } from '@/types/home';

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
