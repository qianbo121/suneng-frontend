import { HomeFurnaceCard } from '@/components/home/HomeFurnaceCard';
import homepageStyles from '@/components/home/HomepageV2.module.css';
import styles from '@/components/home/ProductTypesShowcase.module.css';
import { homeSingleFurnaces, type HomeSingleFurnace } from '@/lib/home-product-types';

type FurnaceCard = Pick<HomeSingleFurnace, 'id' | 'href'>;

export function FurnaceCardGrid({ cards }: { cards: readonly FurnaceCard[] }) {
  return (
    <div className={`${homepageStyles.page} ${styles.furnaceGrid}`}>
      {cards.map((product) => {
        const furnace = homeSingleFurnaces.find((item) => item.id === product.id);
        if (!furnace) throw new Error(`Missing shared furnace card for ${product.id}`);
        return <HomeFurnaceCard key={product.id} item={{ ...furnace, href: product.href }} />;
      })}
    </div>
  );
}
