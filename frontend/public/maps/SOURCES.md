# 中国省级地图来源

- 原件：[阿里云 DataV 全国省级边界](https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json)
- 来源工具：[DataV 地理小工具](https://datav.aliyun.com/portal/school/atlas/area_selector)
- 下载日期：2026-09-07
- 原件大小：582522 字节
- SHA-256：99adfeded5223848bbe37a0a12f8023e11ee12161c7800521c27db42fdeac275
- 原始数据含 34 个省级地区和 100000_JD 边界片段，原件完整保存。
- scripts/build-partner-map.mjs 用统一墨卡托投影生成 SVG。海南、台湾及源文件边界保留在主图；全部位于北纬 18 度以南的独立多边形统一投影到南海诸岛附图。203 个主图多边形、136 个附图多边形，各环全部保留；仅将 SVG 坐标精度取至百分之一像素。
- 引线只调整标签位置，未移动省份或改变地理坐标。
- 页面不依赖外部地图服务或三维引擎。原件和派生路径均在本地，来源可复核。
