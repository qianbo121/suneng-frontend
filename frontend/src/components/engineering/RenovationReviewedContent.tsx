import Image from 'next/image';
import { Section } from './EngineeringPage';
import { repairSystems } from './engineering-content';
import copy from './renovation-reviewed-copy.json';
import engineeringStyles from './EngineeringPage.module.css';
import styles from './RenovationReviewedContent.module.css';

// Repository-owned HTML, frozen from the two Chinese drafts approved on 2026-10-13.
// This component is used only on the Chinese renovation route.
export function RenovationReviewedContent() {
  return (
    <>
      <div className={`${engineeringStyles.container} ${styles.intro}`}>
        <div className={styles.copy} dangerouslySetInnerHTML={{ __html: copy.introHtml }} />
      </div>
      {copy.sections.map((section) => (
        <Section key={section.id} id={section.id} title={section.title} soft={section.id === 'process'}>
          <div className={styles.copy} dangerouslySetInnerHTML={{ __html: section.html }} />

          {section.id === 'acceptance' && (
            <div className={`${styles.copy} ${styles.warranty}`}>
              <p data-warranty-term>整机质保期通常为最终验收合格后 12 个月，或设备发货后 18 个月，以先到者为准；具体起算时间、适用范围及分项期限以合同为准。</p>
              <p data-warranty-exclusions>设计、制造、材料和安装质量造成的故障通常纳入合同质保；加热元件、密封件、热电偶等正常易损耗件及违规操作、擅自改造、超载超温等情形通常不在通用质保范围内。</p>
            </div>
          )}
          {section.id === 'scope' && (
            <div className={`${engineeringStyles.systemGrid} ${styles.images}`}>
              {repairSystems.map((item) => (
                <figure className={engineeringStyles.systemCard} key={item.image}>
                  <div className={engineeringStyles.systemImage}>
                    <Image
                      src={`/images/services/furnace-renovation/${item.image}.webp`}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 767px) 100vw, 400px"
                    />
                  </div>
                  <figcaption className={styles.caption}>{item.title}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </Section>
      ))}
    </>
  );
}

export function RenovationReviewedContact() {
  return (
    <Section id="renovation-contact" title={copy.contact.title}>
      <div className={styles.copy} dangerouslySetInnerHTML={{ __html: copy.contact.html }} />
    </Section>
  );
}
