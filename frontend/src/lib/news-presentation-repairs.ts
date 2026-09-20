// Format-only repairs stay outside the reviewed source/translation fingerprints.
// Match the specific article, existing label and image; never infer new content.
export function repairNewsPresentation(root: HTMLElement, slug?: string, locale?: string) {
  if (slug !== 'shuju-news-31' || locale !== 'zh') return;

  const labels = new Set(['第一层：动作层', '第二层：联锁层', '第三层：记录层', '第四层：接口层']);
  for (const paragraph of root.querySelectorAll('p')) {
    if (paragraph.children.length || !labels.has(paragraph.textContent?.trim() ?? '')) continue;
    const heading = root.ownerDocument.createElement('h2');
    for (const attribute of Array.from(paragraph.attributes)) {
      heading.setAttribute(attribute.name, attribute.value);
    }
    heading.classList.add('news-section-heading');
    heading.textContent = paragraph.textContent;
    paragraph.replaceWith(heading);
  }

  const diagramPath = '/uploads/2026/08/1787991761833-bc8141ad-a684-4bc8-9a9a-3524905e5eca.webp';
  for (const image of root.querySelectorAll('img')) {
    if (image.getAttribute('alt') !== '20260829-162120.jpg') continue;
    try {
      const url = new URL(image.getAttribute('src') ?? '', 'https://www.jssngyl.cn');
      if (url.origin !== 'https://www.jssngyl.cn' || url.pathname !== diagramPath) continue;
      image.setAttribute(
        'alt',
        '热处理生产线自动化核验示意：动作、联锁、记录、接口四层，对照正常自动运行、授权人工接管、故障停机与恢复三种状态',
      );
    } catch {
      // An invalid or changed image is not evidence for reusing this description.
    }
  }
}
