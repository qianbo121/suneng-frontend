# 老站 URL 301 重定向映射草案

## 部署现状

当前项目使用 Docker Compose + nginx 部署：

- 开发/通用入口：`nginx.conf`
- 生产入口模板：`nginx.prod.conf.template`
- 生产容器启动时通过 `docker-compose.prod.yml` 的 `envsubst` 生成最终 nginx 配置

代码库中没有发现老 PHP 站点代码，也没有旧站 `id` 与新站 slug 的权威映射表。因此当前先在 nginx 层添加聚合页兜底 301，避免老站已收录 URL 落到 404。

## 已配置的兜底规则

| 老站 URL 模式 | 当前 301 目标 | 说明 |
| --- | --- | --- |
| `/product/showproduct.php?id=XX` | `/zh/products` | 老产品详情。缺少旧 `id` 对应的新产品 slug，先跳产品聚合页。 |
| `/product/product.php?class2=XX` | `/zh/products` | 老产品分类。当前新站公开路由为产品聚合页和详情页，先跳产品聚合页。 |
| `/news/shownews.php?id=XX` | `/zh/news` | 老新闻详情。缺少旧 `id` 对应的新新闻 slug，先跳新闻聚合页。 |
| `/news/news.php?class2=XX` | `/zh/news` | 老新闻分类。先跳新闻聚合页。 |

## 精确映射待补充

如果能从老站后台或数据库导出 `id / title / old_url / new_target`，建议把详情页从聚合页兜底升级为精确 301。需要补充的数据格式如下：

| 类型 | 老站 ID | 老标题 | 新站目标 |
| --- | --- | --- | --- |
| 产品详情 | TODO | TODO | `/zh/products/detail/box-furnace` |
| 产品详情 | TODO | TODO | `/zh/products/detail/trolley-furnace` |
| 产品详情 | TODO | TODO | `/zh/products/detail/pit-furnace` |
| 产品详情 | TODO | TODO | `/zh/products/detail/mesh-belt-furnace` |
| 产品详情 | TODO | TODO | `/zh/products/detail/pusher-furnace` |
| 新闻详情 | TODO | TODO | `/zh/news/TODO` |

## 可交给运维的 nginx 配置示例

```nginx
location = /product/showproduct.php {
  return 301 /zh/products;
}

location = /product/product.php {
  return 301 /zh/products;
}

location = /news/shownews.php {
  return 301 /zh/news;
}

location = /news/news.php {
  return 301 /zh/news;
}
```

如果后续拿到精确 ID 映射，可以在上述兜底规则前增加基于 `$arg_id` 的精确跳转规则。
