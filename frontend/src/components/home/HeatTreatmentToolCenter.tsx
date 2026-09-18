'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, type KeyboardEvent } from 'react';
import { HiChevronDoubleRight } from 'react-icons/hi2';

import {
  HOME_ARTICLE_TOPICS,
  selectHomeArticlesForTopic,
  type HomeArticleTopic,
  type HomeTopicArticle,
} from '@/lib/home-article-topics';
import { newsUiText } from '@/lib/news-ui';

import styles from './HeatTreatmentToolCenter.module.css';

type HeatTreatmentToolCenterProps = {
  articles: HomeTopicArticle[];
  locale?: 'zh' | 'en';
};

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return dateFormatter.format(date).replaceAll('/', '.');
}

export function HeatTreatmentToolCenter({ articles, locale = 'zh' }: HeatTreatmentToolCenterProps) {
  const english = locale === 'en';
  const [activeTopic, setActiveTopic] = useState<HomeArticleTopic>('selection');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const visibleArticles = selectHomeArticlesForTopic(articles, activeTopic);
  const [featured, ...secondary] = visibleArticles;

  const selectTab = (index: number) => {
    const next = HOME_ARTICLE_TOPICS[index];
    if (!next) return;

    setActiveTopic(next.id);
    tabRefs.current[index]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = HOME_ARTICLE_TOPICS.findIndex((item) => item.id === activeTopic);

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectTab((currentIndex + 1) % HOME_ARTICLE_TOPICS.length);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectTab((currentIndex - 1 + HOME_ARTICLE_TOPICS.length) % HOME_ARTICLE_TOPICS.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectTab(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectTab(HOME_ARTICLE_TOPICS.length - 1);
    }
  };

  return (
    <section id="heat-treatment-tools" className={styles.section}>
      <div className={styles.container}>
        <header className={`${styles.heading} ${styles.resourceHeading}`}>
          <div className={styles.headingCopy}>
            <h2>{newsUiText(locale, '工业炉选型与采购资料')}</h2>
            <p className={styles.description}>
              {english
                ? 'Find practical resources for furnace selection, quote comparison and project acceptance.'
                : '从设备选型、询价比价到交付验收，查找项目需要的技术资料。'}
            </p>
          </div>
          <Link href={`/${locale}/news`} className={styles.allArticlesLink}>
            {english ? 'View all resources' : '查看全部资料'}
            <HiChevronDoubleRight aria-hidden="true" />
          </Link>
        </header>

        <div
          className={styles.audienceTabs}
          role="tablist"
          aria-label={english ? 'Resources by topic' : '按问题查看技术资料'}
          onKeyDown={handleTabKeyDown}
        >
          {HOME_ARTICLE_TOPICS.map((topic, index) => {
            const selected = topic.id === activeTopic;

            return (
              <button
                key={topic.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={`article-topic-tab-${topic.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="article-topic-panel"
                tabIndex={selected ? 0 : -1}
                className={styles.audienceTab}
                onClick={() => setActiveTopic(topic.id)}
              >
                {newsUiText(locale, topic.label)}
              </button>
            );
          })}
        </div>

        <div
          key={activeTopic}
          id="article-topic-panel"
          className={styles.articleGrid}
          role="tabpanel"
          aria-labelledby={`article-topic-tab-${activeTopic}`}
        >
          {featured ? (
            <article className={styles.featuredArticle}>
              <Link href={featured.href} className={styles.featuredLink}>
                <div className={styles.featuredMedia}>
                  <Image
                    src={featured.coverImage}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 760px) calc(100vw - 56px), (max-width: 1024px) calc(100vw - 80px), 700px"
                    className={styles.articleImage}
                  />
                </div>
                <div className={styles.featuredInfo}>
                  <time dateTime={featured.publishDate}>{formatDate(featured.publishDate)}</time>
                  <h3>{featured.title}</h3>
                  {featured.summary ? <p>{featured.summary}</p> : null}
                </div>
              </Link>
            </article>
          ) : (
            <p>{english ? 'No resources in this category yet.' : '该分类资料正在整理，可先查看全部资料。'}</p>
          )}

          <div className={styles.articleList}>
            {secondary.map((article) => (
              <article key={article.id} className={styles.listArticle}>
                <Link href={article.href} className={styles.listLink}>
                  <div className={styles.listMedia}>
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="(max-width: 760px) calc(100vw - 56px), (max-width: 1024px) 40vw, 250px"
                      className={styles.articleImage}
                    />
                  </div>
                  <div className={styles.listCopy}>
                    <time dateTime={article.publishDate}>{formatDate(article.publishDate)}</time>
                    <h3>{article.title}</h3>
                    {article.summary ? <p>{article.summary}</p> : null}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
