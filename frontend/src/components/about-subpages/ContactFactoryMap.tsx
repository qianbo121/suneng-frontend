import Image from 'next/image';
import { HiOutlineMapPin } from 'react-icons/hi2';
import { SUNENG_CONTACT } from '@/constants/contact';
import { getContactFactoryMap } from '@/constants/contact-map';
import type { Locale } from '@/types/site';
import styles from './ContactFactoryMap.module.css';

export function ContactFactoryMap({ locale, showNavigationLink = true }: { locale: Locale; showNavigationLink?: boolean }) {
  const map = getContactFactoryMap(locale, {
    browserKey: process.env.BAIDU_MAP_BROWSER_KEY,
    point: process.env.BAIDU_FACTORY_BD09_POINT,
  });
  return (
    <div className={styles.panel} data-map-provider={map.provider}>
      {map.preview?.kind === 'iframe' ? (
        <iframe className={styles.preview} title={map.preview.title} src={map.preview.src} loading="eager" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      ) : map.preview?.kind === 'image' ? (
        <a href={map.href} target="_blank" rel="noopener noreferrer" aria-label={map.label}>
          <Image className={styles.preview} src={map.preview.src} alt={map.preview.title} width={600} height={370} unoptimized priority />
        </a>
      ) : (
        <div className={styles.location}>
          <HiOutlineMapPin aria-hidden="true" />
          <strong>{SUNENG_CONTACT.company}</strong>
          <p>{SUNENG_CONTACT.address}（205 县道旁）</p>
        </div>
      )}
      {showNavigationLink && <a className={styles.link} href={map.href} target="_blank" rel="noopener noreferrer">{map.label} ↗</a>}
    </div>
  );
}
