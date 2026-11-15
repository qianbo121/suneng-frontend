-- Apply the same editorial changes to the public news feed as to the website.
-- Keep later CMS edits outside the affected phrases, as well as publication history.
UPDATE "News"
SET "summaryZh" = replace("summaryZh", '河南金誉邦实业有限公司', '一家企业'),
    "seoDescriptionZh" = replace("seoDescriptionZh", '河南金誉邦实业有限公司', '一家企业'),
    "contentZh" = replace(replace(replace(replace(replace(
        "contentZh",
        '河南金誉邦实业有限公司', '一家企业'),
        '河南金誉邦不锈钢退洗线项目介绍', '不锈钢带退洗线项目介绍'),
        '河南金誉邦项目热处理段供货范围示意', '该项目热处理段供货范围示意'),
        'https://www.jssngyl.cn/zh/case/henan-annealing-solution-line', '/zh/case/stainless-strip-annealing-supply-scope'),
        'https://www.jssngyl.cn/uploads/2026/11/1794381450589-c85dc4aa-bfb0-4711-913f-8acce61b6a44.webp', '/images/news/resources-zh/140-body.webp'),
    "contentUpdatedAt" = CURRENT_TIMESTAMP,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 140
  AND "slug" = 'suneng-stainless-steel-strip-annealing-furnace-project'
  AND ("summaryZh" LIKE '%河南金誉邦%' OR "seoDescriptionZh" LIKE '%河南金誉邦%'
       OR "contentZh" LIKE '%河南金誉邦%' OR "contentZh" LIKE '%/zh/case/henan-annealing-solution-line%'
       OR "contentZh" LIKE '%1794381450589-c85dc4aa-bfb0-4711-913f-8acce61b6a44.webp%');
