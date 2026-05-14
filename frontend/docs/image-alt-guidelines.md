# Image Alt Text Guidelines

This project uses image alt text for accessibility and SEO. Every meaningful image must describe the information the image adds to the page. Decorative images must use an explicit empty alt value.

## Product Images

Product images are the highest priority. Use the product name, a distinguishing feature or use case, and the Suneng brand.

Chinese format:

```text
[产品中文名]｜[关键特征或卖点]｜苏能工业炉
```

English format:

```text
[English product name] | [key feature or use case] | Suneng Industrial Furnace
```

Examples:

```text
箱式炉｜中小型零件退火淬火非标定制｜苏能工业炉
托辊型网带式电阻炉生产线｜连续退火回火，托辊输送平稳控温均匀｜苏能工业炉
Box Furnace | custom annealing and quenching for small and medium workpieces | Suneng Industrial Furnace
```

When the same product appears multiple times, distinguish each image with context such as `主图`, `缩略图 2`, `典型配置示例`, or `内部结构`.

## Logo Images

Use the full company name when the logo is a primary brand signal, such as the header.

Chinese:

```text
江苏苏能工业炉有限公司
```

English:

```text
Jiangsu Suneng Industrial Furnace Co., Ltd.
```

For small footer logos, the short brand name is acceptable:

```text
苏能工业炉
Suneng Industrial Furnace
```

Partner logos should use the partner company name followed by `logo`, for example:

```text
中国恩菲工程技术有限公司 logo
ENFI logo
```

## Icon Images

If an icon communicates a process step and the adjacent text does not fully replace it, use the step name:

```text
需求沟通
方案确认
方案设计
制造调试
交付安装
```

If an icon is redundant because the same text is already visible next to it, use `alt=""`.

## News Images

Use the article title or the core article topic:

```text
苏能工业炉顺利完成大型台车炉项目交付
Suneng Completes Large Trolley Furnace Delivery
```

## Decorative Images

Decorative images must use an explicit empty alt value:

```tsx
<Image src={backgroundImage} alt="" />
```

Use `alt=""` for darkened hero backgrounds, banner backdrops, abstract decoration, repeated background slices, and icons that are already described by nearby text.

Do not use text such as `装饰图片`, `background image`, or the file name. Screen readers should skip these images.

## Shared Components

Shared components must receive `locale` when the generated alt text is language-dependent. If a component opens a lightbox or gallery, pass the same semantic alt text through to the preview image instead of falling back to generic text.
