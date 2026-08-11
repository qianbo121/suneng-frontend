# ISO 资质红线修复事件（2026-08-11）

## 事件结论

- 事件类型：事实资质红线修正，不是内容实验。
- 执行窗口：2026-08-11 23:04:14（Asia/Shanghai）。
- 生产新闻正文：9 篇在同一数据库事务中修正完成。
- 方案页源码：1 页已修正，等待本阶段审核后再部署。
- 统一可公开口径：`ISO 9001 质量管理体系认证（证书编号 03824Q60289R3S，有效至 2027 年 1 月 11 日）`。
- 事实依据：`/Users/qianbo/Desktop/Coding/GEO内容库/01_资产层/01_实体卡/公司实体卡_v0.3_当前口径.md`，第 39 行。

## 范围与扫描口径

生产数据库扫描了 `News` 表的中英文标题、摘要、正文、SEO 标题、SEO 描述和 SEO 关键词，包含已发布、草稿和已下线状态。

| 状态 | 数量 |
|---|---:|
| 已发布 | 38 |
| 草稿 | 0 |
| 已下线 | 2 |

扫描结果：

- ISO 14001 / ISO 45001 / “三体系认证”正向声称：9 篇。
- 其他红线词：只有 1 篇出现“合同金额”，上下文为“合同金额和未授权运行结果不进入本文”，是正确的否定边界，未修改。
- EPC / AMS2750 / Nadcap / CQI-9 / 军工 / 来料加工等正确的否定或服务边界保持不变；发布守卫只拦截相应的肯定式资质或业务声称。

## 本次 10 页

### 源码方案页（1 页）

- `/zh/solutions/rechuli-lu-changjia`

展示标签由 `ISO 9001 / 14001 / 45001` 修正为 `ISO 9001（证书 03824Q60289R3S，有效至 2027-01-11）`。

### 生产新闻（9 篇）

| ID | slug |
|---:|---|
| 22 | `re-chu-li-lu-da-xiu-chang-jia-zen-me-xuan-cong-lu-ti-jie-gou-kong-wen-xi-tong-dao-shou-hou-neng-li-de-pan-duan-biao-zhun` |
| 23 | `gong-ye-lu-gai-zao-yan-shou-kan-na-xie-zhi-biao-cong-wen-du-jun-yun-xing-neng-hao-dao-kong-zhi-xi-tong-wen-ding-xing` |
| 24 | `re-chu-li-lu-jie-neng-gai-zao-duo-shao-qian-fei-yong-gou-cheng-yu-suan-ying-xiang-yin-su-he-xun-jia-qian-zhun-bei` |
| 25 | `re-chu-li-lu-gai-zao-qian-xu-yao-zhun-bei-na-xie-zi-liao-yi-fen-gei-chang-jia-gou-tong-de-ping-gu-qing-dan` |
| 26 | `gong-ye-lu-jie-neng-gai-zao-zen-me-zuo-cong-lu-chen-bao-wen-kong-zhi-xi-tong-dao-yan-qi-yu-re-hui-shou` |
| 27 | `she-bei-ban-qian-ting-chan-chong-qi-er-shou-lu-zai-zhi-zao-gong-ye-lu-te-shu-chang-jing-gai-zao-zen-me-chu-li` |
| 28 | `jiang-su-gong-ye-lu-chang-jia-na-jia-hao-5-lei-chang-jia-neng-li-dui-bi-yu-xuan-ze-biao-zhun` |
| 29 | `jiang-su-re-chu-li-lu-chang-jia-na-jia-hao-xian-kan-dong-ni-de-gong-yi-zai-xuan-dui-chang-jia` |
| 30 | `jiang-su-gong-ye-lu-gai-zao-chang-jia-zen-me-xuan-an-gai-zao-lei-xing-dui-ying-kao-cha-bu-tong-neng-li` |

数据库只修改 `contentZh`、`contentUpdatedAt`和 `updatedAt`；`publishDate`、slug、标题、摘要和 SEO 字段未变。九篇文章的真实 `contentUpdatedAt` 为同一批次时间。

## 回滚证据

- 修复前完整 9 行数据库快照：`/Users/qianbo/Desktop/Coding/官网+GEO/_backups/iso-redline-20260811/news-before.csv`
- SHA-256：`782216e935ae85057060a8c66c1f0a55df2cc2a1940bc4251c91a8b10fbc9b51`
- 数据库事务前置守卫：精确命中数不是 9 时整个事务拒绝执行。
- 事务后置守卫：任一目标行仍出现 ISO 14001 / 45001 / 三体系认证时整个事务回滚。

## 防回退机制

1. 方案页静态源码测试禁止 ISO 14001 / ISO 45001，并要求保留已核验的 ISO 9001 编号和有效期。
2. 数炬新闻发布在写入数据库前执行事实红线检查。
3. 官网后台编辑已发布新闻时检查合并后的完整内容；草稿转为已发布时再次检查。
4. 已核验的事实守卫范围包含：未核验体系认证、员工数、发明专利分类、具体合同金额、35–40% 热效率、安全生产标准化和 AAA 信用。
5. 员工数守卫覆盖“员工 150 人”“150+ 员工”“150 余名员工”及英文员工数表达，同时要求明确的公司人数语义，不把员工培训天数、客户参验人数或装料分钟数误判为公司员工数；合同金额守卫同时覆盖“合同金额”“合同额”“项目合同额”等写法；AAA 守卫覆盖中英文信用表达及 AAA 在“信用”前后的顺序。
6. AMS2750 / Nadcap / CQI-9 / 军工资质 / 航空航天特殊工艺认证，以及 EPC、来料加工和按件收费热处理加工，只拦截肯定式声称；肯定式识别包含“是、为、系、拥有、属于”等自然动词和“认证企业、认证供应商、资质单位”等名词式写法。
7. “不持有”“不直接承接”“不直接对外提供”“非 AAA 信用企业”和“合同金额不公开”等已确认边界不会被误拦。

## 修复后核验

- 生产数据库 ISO 红线命中：`0`。
- 同时包含证书编号和有效期的新闻：`9`。
- 抽查公开 API 与服务端渲染页：均出现新证书口径，不再出现 ISO 14001 / 45001 / 三体系认证。
- 后端全量测试：21 个测试集、118 项全部通过（含两轮复核新增的中英文肯定式、自然动词、名词式声称及误伤回归样例）。
- 前端全量测试：36 个测试文件、125 项全部通过。
- 前后端 typecheck、lint 和生产构建全部通过；构建产物的方案页只命中 `03824Q60289R3S` 与 `2027-01-11`，未命中 ISO 14001 / 45001。
- 密钥检查通过。
- 源码修复、发布拦截和方案页需待审核后部署；本阶段未提交 Git，未部署应用。

## 8/11–8/29 实验归因

本事件作为独立共模修复记录。8/14 实验一的实验页和对照页均在同一数据库批次中修正 ISO 句子，不将该修复单独解读为实验效果。窗口内继续冻结新增官网稿和官方外部渠道发布。
