--
-- PostgreSQL database dump
--

\restrict kd7PVbwiDFjvphfzdzQW5FeCjnJYoXDeB3RddAnEPqSoeFx3JbfY3wrVCJb6gPz

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: AboutSection; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."AboutSection" (id, "sectionKey", "titleZh", "titleEn", "contentZh", "contentEn", "imageUrl", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (1, 'profile', '公司简介', 'Company Profile', '腾腾装备致力于地下工程装备、矿山施工装备与专用底盘产品的研发、制造与服务，围绕客户项目场景提供成套化产品方案。公司持续建设制造体系、技术体系与服务体系，以稳定交付和长期维护能力支撑工程客户。', 'Tianteng Equipment focuses on the R&D, manufacturing and service of underground engineering equipment, mining machinery and special chassis products, delivering integrated equipment solutions for project-based scenarios.', 'https://placehold.co/1200x800/004B97/ffffff', 10, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.522', '2026-04-18 08:20:35.522');


--
-- Data for Name: AdminUser; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."AdminUser" (id, username, "passwordHash", role, "isActive", "createdAt", "updatedAt") VALUES (1, 'admin', '$2a$10$a9TpC4s3CzshflfgRlPmXOc3tCzIOJrH9th91a3vb1iqgV7oPKALC', 'super_admin', true, '2026-04-18 08:09:39.406', '2026-04-18 08:20:35.492');


--
-- Data for Name: Banner; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Banner" (id, "sectionKey", "titleZh", "titleEn", "subtitleZh", "subtitleEn", "imageUrl", "mobileImageUrl", "linkUrl", "isActive", "sortOrder", status, "createdAt", "updatedAt") VALUES (1, 'home-hero', '专注地下工程装备制造与解决方案', 'Focused on Underground Equipment and Turnkey Solutions', '以稳定的产品、可靠的交付与持续的技术迭代服务矿山与工程客户。', 'Serving mining and engineering customers with reliable equipment and dependable delivery.', 'https://placehold.co/1920x1080/004B97/ffffff', 'https://placehold.co/900x1400/004B97/ffffff', '/products', true, 10, 'published', '2026-04-18 08:20:35.495', '2026-04-18 08:20:35.495');
INSERT INTO public."Banner" (id, "sectionKey", "titleZh", "titleEn", "subtitleZh", "subtitleEn", "imageUrl", "mobileImageUrl", "linkUrl", "isActive", "sortOrder", status, "createdAt", "updatedAt") VALUES (2, 'home-hero', '制造业质感的矿山机械设备品牌官网', 'A Manufacturing-grade Website for Mining Machinery Brands', '围绕产品、实力、服务与交付案例构建可持续运营的企业官网系统。', 'A scalable corporate website built around products, capability, service and delivery cases.', 'https://placehold.co/1920x1080/0B3768/ffffff', 'https://placehold.co/900x1400/0B3768/ffffff', '/about', true, 20, 'published', '2026-04-18 08:20:35.495', '2026-04-18 08:20:35.495');
INSERT INTO public."Banner" (id, "sectionKey", "titleZh", "titleEn", "subtitleZh", "subtitleEn", "imageUrl", "mobileImageUrl", "linkUrl", "isActive", "sortOrder", status, "createdAt", "updatedAt") VALUES (3, 'home-hero', '技术驱动交付，服务覆盖全国', 'Technology-driven Delivery with Nationwide Service', '从项目咨询、产品配置到售后响应，建立标准化服务链路。', 'From consultation and configuration to after-sales response, the service chain is standardized end to end.', 'https://placehold.co/1920x1080/123F74/ffffff', 'https://placehold.co/900x1400/123F74/ffffff', '/service', true, 30, 'published', '2026-04-18 08:20:35.495', '2026-04-18 08:20:35.495');


--
-- Data for Name: StrengthCategory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."StrengthCategory" (id, "nameZh", "nameEn", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (1, '技术团队', 'Technical Team', 'technical-team', 10, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.432', '2026-04-18 08:20:35.515');
INSERT INTO public."StrengthCategory" (id, "nameZh", "nameEn", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (2, '荣誉资质', 'Honors', 'honors', 20, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.434', '2026-04-18 08:20:35.515');
INSERT INTO public."StrengthCategory" (id, "nameZh", "nameEn", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (3, '资质证书', 'Certificates', 'certificates', 30, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.435', '2026-04-18 08:20:35.516');
INSERT INTO public."StrengthCategory" (id, "nameZh", "nameEn", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (4, '生产设备', 'Production Equipment', 'equipment', 40, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.437', '2026-04-18 08:20:35.516');


--
-- Data for Name: Certificate; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Certificate" (id, "strengthCategoryId", "nameZh", "nameEn", "imageUrl", category, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (1, 2, '企业荣誉示例', 'Honor Sample', 'https://placehold.co/900x1200/004B97/ffffff', 'honor', 10, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.527', '2026-04-18 08:20:35.527');
INSERT INTO public."Certificate" (id, "strengthCategoryId", "nameZh", "nameEn", "imageUrl", category, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (2, 3, '资质证书示例', 'Qualification Sample', 'https://placehold.co/900x1200/0B3768/ffffff', 'qualification', 20, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.527', '2026-04-18 08:20:35.527');
INSERT INTO public."Certificate" (id, "strengthCategoryId", "nameZh", "nameEn", "imageUrl", category, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (3, 3, '专利证书示例', 'Patent Sample', 'https://placehold.co/900x1200/E60012/ffffff', 'patent', 30, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.527', '2026-04-18 08:20:35.527');


--
-- Data for Name: ChairmanMessage; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."ChairmanMessage" (id, "singletonKey", "titleZh", "titleEn", "contentZh", "contentEn", "imageUrl", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (1, 'default', '董事长致辞', 'Message from the Chairman', '我们坚持以产品质量和客户交付为核心，围绕工程机械应用场景持续打磨产品。企业的长期价值，来自稳定制造、技术积累和可信服务。', 'We remain focused on product quality and customer delivery, continuously refining our equipment around real engineering scenarios. Long-term value comes from reliable manufacturing, technical accumulation and trustworthy service.', 'https://placehold.co/720x900/004B97/ffffff', 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.522', '2026-04-18 08:20:35.522');


--
-- Data for Name: CompanyInfo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."CompanyInfo" (id, key, "valueZh", "valueEn", "createdAt", "updatedAt") VALUES (1, 'site_phone', '+86 000-00000000', '+86 000-00000000', '2026-04-18 08:09:39.438', '2026-04-18 08:20:35.517');
INSERT INTO public."CompanyInfo" (id, key, "valueZh", "valueEn", "createdAt", "updatedAt") VALUES (2, 'site_address', '湖北省某市某区某产业园 66 号', 'No. 66, Example Industrial Park, Hubei, China', '2026-04-18 08:09:39.438', '2026-04-18 08:20:35.517');
INSERT INTO public."CompanyInfo" (id, key, "valueZh", "valueEn", "createdAt", "updatedAt") VALUES (3, 'site_email', 'contact@example.com', 'contact@example.com', '2026-04-18 08:09:39.439', '2026-04-18 08:20:35.518');
INSERT INTO public."CompanyInfo" (id, key, "valueZh", "valueEn", "createdAt", "updatedAt") VALUES (7, 'site_fax', '+86 000-00000001', '+86 000-00000001', '2026-04-18 08:20:35.518', '2026-04-18 08:20:35.518');
INSERT INTO public."CompanyInfo" (id, key, "valueZh", "valueEn", "createdAt", "updatedAt") VALUES (8, 'salesPhone', '+86 400-800-9000', '+86 400-800-9000', '2026-04-18 08:20:35.518', '2026-04-18 08:20:35.518');
INSERT INTO public."CompanyInfo" (id, key, "valueZh", "valueEn", "createdAt", "updatedAt") VALUES (9, 'topPhone', '+86 400-800-9000', '+86 400-800-9000', '2026-04-18 08:20:35.519', '2026-04-18 08:20:35.519');
INSERT INTO public."CompanyInfo" (id, key, "valueZh", "valueEn", "createdAt", "updatedAt") VALUES (10, 'hotline', '+86 400-800-9000', '+86 400-800-9000', '2026-04-18 08:20:35.519', '2026-04-18 08:20:35.519');
INSERT INTO public."CompanyInfo" (id, key, "valueZh", "valueEn", "createdAt", "updatedAt") VALUES (11, 'companyAddress', '湖北省某市某区某产业园 66 号', 'No. 66, Example Industrial Park, Hubei, China', '2026-04-18 08:20:35.519', '2026-04-18 08:20:35.519');
INSERT INTO public."CompanyInfo" (id, key, "valueZh", "valueEn", "createdAt", "updatedAt") VALUES (12, 'foundedYear', '2011', '2011', '2026-04-18 08:20:35.52', '2026-04-18 08:20:35.52');
INSERT INTO public."CompanyInfo" (id, key, "valueZh", "valueEn", "createdAt", "updatedAt") VALUES (13, 'registeredCapital', '2736', '2736', '2026-04-18 08:20:35.52', '2026-04-18 08:20:35.52');
INSERT INTO public."CompanyInfo" (id, key, "valueZh", "valueEn", "createdAt", "updatedAt") VALUES (14, 'patentCount', '90', '90', '2026-04-18 08:20:35.521', '2026-04-18 08:20:35.521');
INSERT INTO public."CompanyInfo" (id, key, "valueZh", "valueEn", "createdAt", "updatedAt") VALUES (15, 'employeeCount', '100', '100', '2026-04-18 08:20:35.521', '2026-04-18 08:20:35.521');
INSERT INTO public."CompanyInfo" (id, key, "valueZh", "valueEn", "createdAt", "updatedAt") VALUES (16, 'wechatQr', 'https://placehold.co/220x220/004B97/ffffff', 'https://placehold.co/220x220/004B97/ffffff', '2026-04-18 08:20:35.521', '2026-04-18 08:20:35.521');


--
-- Data for Name: ContactMessage; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."ContactMessage" (id, name, email, phone, company, message, "isRead", status, "handlerId", "createdAt", "updatedAt") VALUES (1, '测试用户', 'test@example.com', '13800000000', '测试公司', '这是一条用于联调检查的测试留言内容。', false, 'new', NULL, '2026-04-18 08:10:47.331', '2026-04-18 08:10:47.331');


--
-- Data for Name: CultureValue; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."CultureValue" (id, type, "titleZh", "titleEn", "contentZh", "contentEn", icon, "sortOrder", status, "createdAt", "updatedAt") VALUES (1, 'mission', '企业使命', 'Mission', '以稳定装备与专业服务支撑地下工程建设效率提升。', 'Support underground engineering with reliable equipment and professional service.', 'https://placehold.co/120x120/004B97/ffffff', 10, 'published', '2026-04-18 08:20:35.524', '2026-04-18 08:20:35.524');
INSERT INTO public."CultureValue" (id, type, "titleZh", "titleEn", "contentZh", "contentEn", icon, "sortOrder", status, "createdAt", "updatedAt") VALUES (2, 'vision', '企业愿景', 'Vision', '成为工程装备细分领域值得长期信赖的制造品牌。', 'To become a long-term trusted manufacturing brand in specialized engineering equipment.', 'https://placehold.co/120x120/0B3768/ffffff', 20, 'published', '2026-04-18 08:20:35.524', '2026-04-18 08:20:35.524');
INSERT INTO public."CultureValue" (id, type, "titleZh", "titleEn", "contentZh", "contentEn", icon, "sortOrder", status, "createdAt", "updatedAt") VALUES (3, 'value', '核心价值观', 'Core Values', '务实、协同、品质、长期主义。', 'Pragmatism, collaboration, quality and long-termism.', 'https://placehold.co/120x120/E60012/ffffff', 30, 'published', '2026-04-18 08:20:35.524', '2026-04-18 08:20:35.524');


--
-- Data for Name: CustomRequirement; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ProductCategory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."ProductCategory" (id, "nameZh", "nameEn", "descriptionZh", "descriptionEn", "coverImage", "iconImage", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (1, '装药车系列', 'Charging Truck Series', '用于矿山及地下工程场景的装药车系列产品。', 'Charging truck products for mining and underground engineering.', 'https://placehold.co/800x600', 'https://placehold.co/120x120', 'charging-truck-series', 10, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.408', '2026-04-18 08:20:35.496');
INSERT INTO public."ProductCategory" (id, "nameZh", "nameEn", "descriptionZh", "descriptionEn", "coverImage", "iconImage", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (2, '撬毛车系列', 'Scaling Vehicle Series', '适用于井下巷道和矿山作业的撬毛车产品。', 'Scaling vehicles for tunnel and mining operations.', 'https://placehold.co/800x600', 'https://placehold.co/120x120', 'scaling-vehicle-series', 20, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.409', '2026-04-18 08:20:35.497');
INSERT INTO public."ProductCategory" (id, "nameZh", "nameEn", "descriptionZh", "descriptionEn", "coverImage", "iconImage", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (3, '破碎车系列', 'Crusher Series', '移动式破碎车系列，占位分类文案。', 'Mobile crusher vehicle series.', 'https://placehold.co/800x600', 'https://placehold.co/120x120', 'crusher-series', 30, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.41', '2026-04-18 08:20:35.498');
INSERT INTO public."ProductCategory" (id, "nameZh", "nameEn", "descriptionZh", "descriptionEn", "coverImage", "iconImage", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (4, '移动吊车', 'Mobile Crane', '移动吊装设备产品分类。', 'Mobile lifting equipment category.', 'https://placehold.co/800x600', 'https://placehold.co/120x120', 'mobile-crane', 40, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.41', '2026-04-18 08:20:35.499');
INSERT INTO public."ProductCategory" (id, "nameZh", "nameEn", "descriptionZh", "descriptionEn", "coverImage", "iconImage", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (5, '4T底盘系列', '4T Chassis Series', '4T 底盘产品系列占位分类。', '4T chassis product series.', 'https://placehold.co/800x600', 'https://placehold.co/120x120', '4t-chassis-series', 50, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.411', '2026-04-18 08:20:35.499');
INSERT INTO public."ProductCategory" (id, "nameZh", "nameEn", "descriptionZh", "descriptionEn", "coverImage", "iconImage", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (6, '8T底盘系列', '8T Chassis Series', '8T 底盘产品系列占位分类。', '8T chassis product series.', 'https://placehold.co/800x600', 'https://placehold.co/120x120', '8t-chassis-series', 60, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.411', '2026-04-18 08:20:35.5');
INSERT INTO public."ProductCategory" (id, "nameZh", "nameEn", "descriptionZh", "descriptionEn", "coverImage", "iconImage", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (7, '一体化底盘系列', 'Integrated Chassis Series', '一体化底盘产品系列占位分类。', 'Integrated chassis product series.', 'https://placehold.co/800x600', 'https://placehold.co/120x120', 'integrated-chassis-series', 70, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.412', '2026-04-18 08:20:35.5');
INSERT INTO public."ProductCategory" (id, "nameZh", "nameEn", "descriptionZh", "descriptionEn", "coverImage", "iconImage", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (8, '混凝土搅拌运输车系列', 'Concrete Mixer Transport Series', '混凝土搅拌运输车系列占位分类。', 'Concrete mixer transport series.', 'https://placehold.co/800x600', 'https://placehold.co/120x120', 'concrete-mixer-transport-series', 80, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.413', '2026-04-18 08:20:35.501');
INSERT INTO public."ProductCategory" (id, "nameZh", "nameEn", "descriptionZh", "descriptionEn", "coverImage", "iconImage", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (9, '井下湿喷车系列', 'Underground Shotcrete Series', '井下湿喷车产品分类。', 'Underground shotcrete vehicle category.', 'https://placehold.co/800x600', 'https://placehold.co/120x120', 'underground-shotcrete-series', 90, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.413', '2026-04-18 08:20:35.502');
INSERT INTO public."ProductCategory" (id, "nameZh", "nameEn", "descriptionZh", "descriptionEn", "coverImage", "iconImage", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (10, '井下砌筑多功能车', 'Underground Masonry Multi-function Series', '井下砌筑多功能车产品分类。', 'Underground masonry multi-function vehicle category.', 'https://placehold.co/800x600', 'https://placehold.co/120x120', 'underground-masonry-multi-function-series', 100, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.414', '2026-04-18 08:20:35.502');


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Product" (id, "categoryId", "nameZh", "nameEn", model, "summaryZh", "summaryEn", "descriptionZh", "descriptionEn", "specsJson", "featuresJson", "imagesJson", "isHot", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (1, 1, '装药车系列示例产品', 'Charging Truck Series Sample Product', 'MODEL-1', '装药车系列示例产品摘要，用于前端和后台联调。', 'Summary for Charging Truck Series sample product.', '装药车系列示例产品详情，占位内容，可在后续阶段替换为正式资料。', 'Detailed placeholder content for Charging Truck Series.', '{"power": "75kW", "width": "1800mm", "height": "2200mm", "length": "6200mm"}', '["结构紧凑", "适配矿山场景", "预留多语言内容"]', '["https://placehold.co/1200x900", "https://placehold.co/1200x900"]', true, 'charging-truck-series-sample-1', 10, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.415', '2026-04-18 08:20:35.503');
INSERT INTO public."Product" (id, "categoryId", "nameZh", "nameEn", model, "summaryZh", "summaryEn", "descriptionZh", "descriptionEn", "specsJson", "featuresJson", "imagesJson", "isHot", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (2, 2, '撬毛车系列示例产品', 'Scaling Vehicle Series Sample Product', 'MODEL-2', '撬毛车系列示例产品摘要，用于前端和后台联调。', 'Summary for Scaling Vehicle Series sample product.', '撬毛车系列示例产品详情，占位内容，可在后续阶段替换为正式资料。', 'Detailed placeholder content for Scaling Vehicle Series.', '{"power": "75kW", "width": "1800mm", "height": "2200mm", "length": "6200mm"}', '["结构紧凑", "适配矿山场景", "预留多语言内容"]', '["https://placehold.co/1200x900", "https://placehold.co/1200x900"]', true, 'scaling-vehicle-series-sample-2', 20, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.417', '2026-04-18 08:20:35.504');
INSERT INTO public."Product" (id, "categoryId", "nameZh", "nameEn", model, "summaryZh", "summaryEn", "descriptionZh", "descriptionEn", "specsJson", "featuresJson", "imagesJson", "isHot", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (3, 3, '破碎车系列示例产品', 'Crusher Series Sample Product', 'MODEL-3', '破碎车系列示例产品摘要，用于前端和后台联调。', 'Summary for Crusher Series sample product.', '破碎车系列示例产品详情，占位内容，可在后续阶段替换为正式资料。', 'Detailed placeholder content for Crusher Series.', '{"power": "75kW", "width": "1800mm", "height": "2200mm", "length": "6200mm"}', '["结构紧凑", "适配矿山场景", "预留多语言内容"]', '["https://placehold.co/1200x900", "https://placehold.co/1200x900"]', true, 'crusher-series-sample-3', 30, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.417', '2026-04-18 08:20:35.505');
INSERT INTO public."Product" (id, "categoryId", "nameZh", "nameEn", model, "summaryZh", "summaryEn", "descriptionZh", "descriptionEn", "specsJson", "featuresJson", "imagesJson", "isHot", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (4, 4, '移动吊车示例产品', 'Mobile Crane Sample Product', 'MODEL-4', '移动吊车示例产品摘要，用于前端和后台联调。', 'Summary for Mobile Crane sample product.', '移动吊车示例产品详情，占位内容，可在后续阶段替换为正式资料。', 'Detailed placeholder content for Mobile Crane.', '{"power": "75kW", "width": "1800mm", "height": "2200mm", "length": "6200mm"}', '["结构紧凑", "适配矿山场景", "预留多语言内容"]', '["https://placehold.co/1200x900", "https://placehold.co/1200x900"]', true, 'mobile-crane-sample-4', 40, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.418', '2026-04-18 08:20:35.506');
INSERT INTO public."Product" (id, "categoryId", "nameZh", "nameEn", model, "summaryZh", "summaryEn", "descriptionZh", "descriptionEn", "specsJson", "featuresJson", "imagesJson", "isHot", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (5, 5, '4T底盘系列示例产品', '4T Chassis Series Sample Product', 'MODEL-5', '4T底盘系列示例产品摘要，用于前端和后台联调。', 'Summary for 4T Chassis Series sample product.', '4T底盘系列示例产品详情，占位内容，可在后续阶段替换为正式资料。', 'Detailed placeholder content for 4T Chassis Series.', '{"power": "75kW", "width": "1800mm", "height": "2200mm", "length": "6200mm"}', '["结构紧凑", "适配矿山场景", "预留多语言内容"]', '["https://placehold.co/1200x900", "https://placehold.co/1200x900"]', false, '4t-chassis-series-sample-5', 50, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.419', '2026-04-18 08:20:35.507');
INSERT INTO public."Product" (id, "categoryId", "nameZh", "nameEn", model, "summaryZh", "summaryEn", "descriptionZh", "descriptionEn", "specsJson", "featuresJson", "imagesJson", "isHot", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (6, 6, '8T底盘系列示例产品', '8T Chassis Series Sample Product', 'MODEL-6', '8T底盘系列示例产品摘要，用于前端和后台联调。', 'Summary for 8T Chassis Series sample product.', '8T底盘系列示例产品详情，占位内容，可在后续阶段替换为正式资料。', 'Detailed placeholder content for 8T Chassis Series.', '{"power": "75kW", "width": "1800mm", "height": "2200mm", "length": "6200mm"}', '["结构紧凑", "适配矿山场景", "预留多语言内容"]', '["https://placehold.co/1200x900", "https://placehold.co/1200x900"]', false, '8t-chassis-series-sample-6', 60, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.42', '2026-04-18 08:20:35.507');
INSERT INTO public."Product" (id, "categoryId", "nameZh", "nameEn", model, "summaryZh", "summaryEn", "descriptionZh", "descriptionEn", "specsJson", "featuresJson", "imagesJson", "isHot", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (7, 7, '一体化底盘系列示例产品', 'Integrated Chassis Series Sample Product', 'MODEL-7', '一体化底盘系列示例产品摘要，用于前端和后台联调。', 'Summary for Integrated Chassis Series sample product.', '一体化底盘系列示例产品详情，占位内容，可在后续阶段替换为正式资料。', 'Detailed placeholder content for Integrated Chassis Series.', '{"power": "75kW", "width": "1800mm", "height": "2200mm", "length": "6200mm"}', '["结构紧凑", "适配矿山场景", "预留多语言内容"]', '["https://placehold.co/1200x900", "https://placehold.co/1200x900"]', false, 'integrated-chassis-series-sample-7', 70, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.421', '2026-04-18 08:20:35.508');
INSERT INTO public."Product" (id, "categoryId", "nameZh", "nameEn", model, "summaryZh", "summaryEn", "descriptionZh", "descriptionEn", "specsJson", "featuresJson", "imagesJson", "isHot", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (8, 8, '混凝土搅拌运输车系列示例产品', 'Concrete Mixer Transport Series Sample Product', 'MODEL-8', '混凝土搅拌运输车系列示例产品摘要，用于前端和后台联调。', 'Summary for Concrete Mixer Transport Series sample product.', '混凝土搅拌运输车系列示例产品详情，占位内容，可在后续阶段替换为正式资料。', 'Detailed placeholder content for Concrete Mixer Transport Series.', '{"power": "75kW", "width": "1800mm", "height": "2200mm", "length": "6200mm"}', '["结构紧凑", "适配矿山场景", "预留多语言内容"]', '["https://placehold.co/1200x900", "https://placehold.co/1200x900"]', false, 'concrete-mixer-transport-series-sample-8', 80, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.422', '2026-04-18 08:20:35.509');
INSERT INTO public."Product" (id, "categoryId", "nameZh", "nameEn", model, "summaryZh", "summaryEn", "descriptionZh", "descriptionEn", "specsJson", "featuresJson", "imagesJson", "isHot", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (9, 9, '井下湿喷车系列示例产品', 'Underground Shotcrete Series Sample Product', 'MODEL-9', '井下湿喷车系列示例产品摘要，用于前端和后台联调。', 'Summary for Underground Shotcrete Series sample product.', '井下湿喷车系列示例产品详情，占位内容，可在后续阶段替换为正式资料。', 'Detailed placeholder content for Underground Shotcrete Series.', '{"power": "75kW", "width": "1800mm", "height": "2200mm", "length": "6200mm"}', '["结构紧凑", "适配矿山场景", "预留多语言内容"]', '["https://placehold.co/1200x900", "https://placehold.co/1200x900"]', false, 'underground-shotcrete-series-sample-9', 90, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.423', '2026-04-18 08:20:35.51');
INSERT INTO public."Product" (id, "categoryId", "nameZh", "nameEn", model, "summaryZh", "summaryEn", "descriptionZh", "descriptionEn", "specsJson", "featuresJson", "imagesJson", "isHot", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (10, 10, '井下砌筑多功能车示例产品', 'Underground Masonry Multi-function Series Sample Product', 'MODEL-10', '井下砌筑多功能车示例产品摘要，用于前端和后台联调。', 'Summary for Underground Masonry Multi-function Series sample product.', '井下砌筑多功能车示例产品详情，占位内容，可在后续阶段替换为正式资料。', 'Detailed placeholder content for Underground Masonry Multi-function Series.', '{"power": "75kW", "width": "1800mm", "height": "2200mm", "length": "6200mm"}', '["结构紧凑", "适配矿山场景", "预留多语言内容"]', '["https://placehold.co/1200x900", "https://placehold.co/1200x900"]', false, 'underground-masonry-multi-function-series-sample-10', 100, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.424', '2026-04-18 08:20:35.51');


--
-- Data for Name: Delivery; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Delivery" (id, "productId", "titleZh", "titleEn", "descriptionZh", "descriptionEn", "imagesJson", "deliveryDate", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (1, NULL, '交车现场示例一', 'Delivery Case One', '用于前台合作伙伴页面与后台交车现场管理联调。', 'Seeded delivery case for the partner page and admin testing.', '["https://placehold.co/1200x900/004B97/ffffff", "https://placehold.co/1200x900/0B3768/ffffff", "https://placehold.co/1200x900/123F74/ffffff"]', '2026-02-12 09:00:00', 'delivery-case-1', 10, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.529', '2026-04-18 08:20:35.529');
INSERT INTO public."Delivery" (id, "productId", "titleZh", "titleEn", "descriptionZh", "descriptionEn", "imagesJson", "deliveryDate", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (2, NULL, '交车现场示例二', 'Delivery Case Two', '用于展示多图交付案例模块。', 'Used to display multi-image delivery cases.', '["https://placehold.co/1200x900/004B97/ffffff", "https://placehold.co/1200x900/0B3768/ffffff", "https://placehold.co/1200x900/123F74/ffffff"]', '2026-01-16 09:00:00', 'delivery-case-2', 20, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.53', '2026-04-18 08:20:35.53');


--
-- Data for Name: NewsCategory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."NewsCategory" (id, "nameZh", "nameEn", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (1, '公司新闻', 'Company News', 'company-news', 10, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.425', '2026-04-18 08:20:35.511');
INSERT INTO public."NewsCategory" (id, "nameZh", "nameEn", slug, "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (2, '行业新闻', 'Industry News', 'industry-news', 20, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:09:39.426', '2026-04-18 08:20:35.512');


--
-- Data for Name: News; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."News" (id, "categoryId", "titleZh", "titleEn", "summaryZh", "summaryEn", "contentZh", "contentEn", "coverImage", "publishDate", "viewCount", slug, "isPublished", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (11, 1, '江苏苏能工业炉退火固溶生产线助力钢材深加工', NULL, '江苏苏能工业炉有限公司为国内钢材企业交付的退火固溶生产线成功投产。生产线总长 140 米，退火温度控制在 1050–1250℃，工艺流程速度 ≤35 米/分钟，炉温均匀性 ±15℃。生产线采用托辊网带设计，实现连续化、高精度热处理，广泛适用于钢卷、板材及大型机械零部件的退火与固溶', NULL, '<p>江苏苏能工业炉有限公司为国内钢材企业交付的退火固溶生产线成功投产。生产线总长 140 米，退火温度控制在 1050–1250℃，工艺流程速度 ≤35 米/分钟，炉温均匀性 ±15℃。生产线采用托辊网带设计，实现连续化、高精度热处理，广泛适用于钢卷、板材及大型机械零部件的退火与固溶处理。</p><p>生产线具备自动送料、温控监测和工件追踪系统，实现全程智能化生产。通过优化炉体结构和加热区域布置，设备在保证均匀退火的同时降低能耗，并能实时记录生产数据，为客户提供工艺追溯能力。</p><p>该退火固溶生产线已在钢材深加工企业投入使用，客户反馈产品力学性能均匀，表面质量稳定，生产效率提升约 25%。江苏苏能工业炉表示，未来将继续提供定制化热处理生产线方案，满足不同行业、多规格工件的热处理需求，实现高效、绿色智能制造。</p>', NULL, 'http://localhost/uploads/2026/05/1778134806838-922535b5-b706-4c8c-9d0f-e88f43fb7316.png', '2026-05-07 06:20:02.107', 0, 'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong', true, 0, 'published', '江苏苏能工业炉退火固溶生产线助力钢材深加工', NULL, '江苏苏能工业炉有限公司为国内钢材企业交付的退火固溶生产线成功投产。生产线总长 140 米，退火温度控制在 1050–1250℃，工艺流程速度 ≤35 米/分钟，炉温均匀性 ±15℃。生产线采用托辊网带设计，实现连续化、高精度热处理，广泛适用于钢卷、板材及大型机械零部件的退火与固溶', NULL, NULL, NULL, 'http://localhost/uploads/2026/05/1778134806838-922535b5-b706-4c8c-9d0f-e88f43fb7316.png', '2026-05-07 06:20:08.377', '2026-05-07 09:14:34.44');
INSERT INTO public."News" (id, "categoryId", "titleZh", "titleEn", "summaryZh", "summaryEn", "contentZh", "contentEn", "coverImage", "publishDate", "viewCount", slug, "isPublished", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (12, 1, '江苏苏能工业炉退火固溶生产线助力钢材深加工', NULL, '江苏苏能工业炉有限公司为国内钢材企业交付的退火固溶生产线成功投产。生产线总长 140 米，退火温度控制在 1050–1250℃，工艺流程速度 ≤35 米/分钟，炉温均匀性 ±15℃。生产线采用托辊网带设计，实现连续化、高精度热处理，广泛适用于钢卷、板材及大型机械零部件的退火与固溶', NULL, '<p>江苏苏能工业炉有限公司为国内钢材企业交付的退火固溶生产线成功投产。生产线总长 140 米，退火温度控制在 1050–1250℃，工艺流程速度 ≤35 米/分钟，炉温均匀性 ±15℃。生产线采用托辊网带设计，实现连续化、高精度热处理，广泛适用于钢卷、板材及大型机械零部件的退火与固溶处理。</p><p>生产线具备自动送料、温控监测和工件追踪系统，实现全程智能化生产。通过优化炉体结构和加热区域布置，设备在保证均匀退火的同时降低能耗，并能实时记录生产数据，为客户提供工艺追溯能力。</p><p>该退火固溶生产线已在钢材深加工企业投入使用，客户反馈产品力学性能均匀，表面质量稳定，生产效率提升约 25%。江苏苏能工业炉表示，未来将继续提供定制化热处理生产线方案，满足不同行业、多规格工件的热处理需求，实现高效、绿色智能制造。</p>', NULL, 'http://localhost/uploads/2026/05/1778145287716-23c68bf1-8be7-4f6a-a6be-a3576a16169d.png', '2026-05-07 09:14:35.686', 0, 'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong-1', true, 0, 'published', '江苏苏能工业炉退火固溶生产线助力钢材深加工', NULL, '江苏苏能工业炉有限公司为国内钢材企业交付的退火固溶生产线成功投产。生产线总长 140 米，退火温度控制在 1050–1250℃，工艺流程速度 ≤35 米/分钟，炉温均匀性 ±15℃。生产线采用托辊网带设计，实现连续化、高精度热处理，广泛适用于钢卷、板材及大型机械零部件的退火与固溶', NULL, NULL, NULL, 'http://localhost/uploads/2026/05/1778145287716-23c68bf1-8be7-4f6a-a6be-a3576a16169d.png', '2026-05-07 09:14:52.473', '2026-05-07 09:14:52.491');
INSERT INTO public."News" (id, "categoryId", "titleZh", "titleEn", "summaryZh", "summaryEn", "contentZh", "contentEn", "coverImage", "publishDate", "viewCount", slug, "isPublished", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (13, 1, '铜丝自动化退火生产线智能化升级与行业应用', NULL, '江苏苏能工业炉有限公司为国内铜材企业量身定制的铜丝自动化退火生产线已成功投产，全长 120 米，退火温度控制在 500–650℃，退火过程采用恒温控制和均匀气流循环，实现铜丝表面光洁度和机械性能稳定。生产线整合自动送料系统、智能温控监测及工件追踪功能，确保生产全过程的连续性和可追', NULL, '<p>江苏苏能工业炉有限公司为国内铜材企业量身定制的铜丝自动化退火生产线已成功投产，全长 120 米，退火温度控制在 500–650℃，退火过程采用恒温控制和均匀气流循环，实现铜丝表面光洁度和机械性能稳定。生产线整合自动送料系统、智能温控监测及工件追踪功能，确保生产全过程的连续性和可追溯性。</p><p>生产线的工艺流程包括铜丝预热、连续退火以及冷却收卷，整个过程通过智能化控制模块实现自动调节炉温和输送速度，以满足不同规格铜丝的退火工艺要求。系统配备实时数据采集和远程监控功能，可记录炉温、速度、环境参数及异常报警信息，为客户提供完整的热处理工艺追溯。</p><p>在技术特点上，该自动化退火生产线通过优化加热区布局和均匀气流设计，实现每根铜丝受热均匀，避免表面氧化和机械性能波动。智能送料和控制系统不仅减少人工操作，降低操作风险，同时提高生产效率约 30%，满足高产能和高质量铜丝制造需求。</p><p>实际应用中，该生产线已在多家电线电缆制造企业投入使用，客户反馈铜丝表面质量一致，退火均匀性明显提高，生产效率与能源利用率均获得显著优化。江苏苏能工业炉强调，未来将继续通过工艺优化和智能化升级，提供高效、绿色、可追溯的铜丝退火解决方案，为铜材行业的高精度制造提供有力支撑。</p>', NULL, 'http://localhost/uploads/2026/05/1778145300403-9654cd80-4e79-409a-850b-80670836cdd5.png', '2026-05-07 09:14:53.78', 0, 'tong-si-zi-dong-hua-tui-huo-sheng-chan-xian-zhi-neng-hua-sheng-ji-yu-hang-ye-ying-yong', true, 0, 'published', '铜丝自动化退火生产线智能化升级与行业应用', NULL, '江苏苏能工业炉有限公司为国内铜材企业量身定制的铜丝自动化退火生产线已成功投产，全长 120 米，退火温度控制在 500–650℃，退火过程采用恒温控制和均匀气流循环，实现铜丝表面光洁度和机械性能稳定。生产线整合自动送料系统、智能温控监测及工件追踪功能，确保生产全过程的连续性和可追', NULL, NULL, NULL, 'http://localhost/uploads/2026/05/1778145300403-9654cd80-4e79-409a-850b-80670836cdd5.png', '2026-05-07 09:15:06.269', '2026-05-07 09:15:06.286');
INSERT INTO public."News" (id, "categoryId", "titleZh", "titleEn", "summaryZh", "summaryEn", "contentZh", "contentEn", "coverImage", "publishDate", "viewCount", slug, "isPublished", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (14, 1, '江苏苏能工业炉箱式热处理炉提升中小批量生产效率', NULL, '江苏苏能工业炉有限公司推出的箱式热处理炉，专为中小批量金属工件退火、正火及回火设计，炉体紧凑、热效率高，炉温均匀性 ±10℃，额定使用温度可达 700℃，适用于不锈钢、铜材及精密零部件加工行业。
箱式炉工艺流程包括工件上料、均匀加热、保温处理和出炉冷却。加热阶段通过多点温度传感器', NULL, '<p>江苏苏能工业炉有限公司推出的箱式热处理炉，专为中小批量金属工件退火、正火及回火设计，炉体紧凑、热效率高，炉温均匀性 ±10℃，额定使用温度可达 700℃，适用于不锈钢、铜材及精密零部件加工行业。</p><p>箱式炉工艺流程包括工件上料、均匀加热、保温处理和出炉冷却。加热阶段通过多点温度传感器和均温风循环，实现炉膛内温度稳定一致；保温阶段采用恒温控制，确保工件内部结构均匀；冷却阶段控制出炉速度和冷却气流，避免工件翘曲变形。</p><p>江苏苏能工业炉在设备中引入全程智能化控制系统，可自动记录炉温曲线、加热时间及冷却数据，实现生产可追溯性。同时支持远程监控和故障预警，提高生产安全性和操作便捷性。实际应用显示，箱式炉在中小批量生产中产能提升约 20%，工件表面质量和内部性能均达到客户要求。</p>', NULL, 'http://localhost/uploads/2026/05/1778145322732-dcdd96c4-409e-4bc3-8420-f5529f736c70.png', '2026-05-05 09:15:07.5', 0, 'jiang-su-su-neng-gong-ye-lu-xiang-shi-re-chu-li-lu-ti-sheng-zhong-xiao-pi-liang-sheng-chan-xiao-l', true, 0, 'published', '江苏苏能工业炉箱式热处理炉提升中小批量生产效率', NULL, '江苏苏能工业炉有限公司推出的箱式热处理炉，专为中小批量金属工件退火、正火及回火设计，炉体紧凑、热效率高，炉温均匀性 ±10℃，额定使用温度可达 700℃，适用于不锈钢、铜材及精密零部件加工行业。
箱式炉工艺流程包括工件上料、均匀加热、保温处理和出炉冷却。加热阶段通过多点温度传感器', NULL, NULL, NULL, 'http://localhost/uploads/2026/05/1778145322732-dcdd96c4-409e-4bc3-8420-f5529f736c70.png', '2026-05-07 09:15:31.809', '2026-05-07 09:15:31.827');
INSERT INTO public."News" (id, "categoryId", "titleZh", "titleEn", "summaryZh", "summaryEn", "contentZh", "contentEn", "coverImage", "publishDate", "viewCount", slug, "isPublished", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (15, 1, '江苏苏能工业炉转底式热处理炉技术升级及应用案例', NULL, '江苏苏能工业炉有限公司完成转底式热处理炉技术升级，炉体优化为耐高温钢结构，炉温均匀性提升至 ±10℃，适用于大直径钢管和大型机械零部件的退火、正火及回火处理。该转底炉通过工艺创新与智能控制，实现高精度、稳定、高效的热处理过程。
转底炉工艺流程包括工件装料、旋转加热、保温退火及出炉', NULL, '<p>江苏苏能工业炉有限公司完成转底式热处理炉技术升级，炉体优化为耐高温钢结构，炉温均匀性提升至 ±10℃，适用于大直径钢管和大型机械零部件的退火、正火及回火处理。该转底炉通过工艺创新与智能控制，实现高精度、稳定、高效的热处理过程。</p><p>转底炉工艺流程包括工件装料、旋转加热、保温退火及出炉冷却。加热阶段通过旋转加热结构和均匀气流循环，保证炉膛内温度均匀；保温退火阶段温控系统可根据工件材质和尺寸自动调整温度，确保工件内部性能一致；冷却阶段通过智能控制旋转速度和冷却气流，实现表面光洁且减少热应力。</p><p>江苏苏能工业炉为该炉配置了智能监控系统，可远程监控温度曲线、工件位置及炉体运行状态，并提供全程工艺追溯，确保生产安全和质量可控。客户在钢管加工及大型机械制造中应用该炉后，退火均匀性和工件表面质量均明显提升，生产效率提升约 15%，能源消耗降低 10%。</p>', NULL, 'http://localhost/uploads/2026/05/1778145341942-79476fa7-0ec9-4986-b4e5-fa2ee3bafd7a.png', '2026-05-07 09:15:33.02', 0, 'jiang-su-su-neng-gong-ye-lu-zhuan-di-shi-re-chu-li-lu-ji-shu-sheng-ji-ji-ying-yong-an-li', true, 0, 'published', '江苏苏能工业炉转底式热处理炉技术升级及应用案例', NULL, '江苏苏能工业炉有限公司完成转底式热处理炉技术升级，炉体优化为耐高温钢结构，炉温均匀性提升至 ±10℃，适用于大直径钢管和大型机械零部件的退火、正火及回火处理。该转底炉通过工艺创新与智能控制，实现高精度、稳定、高效的热处理过程。
转底炉工艺流程包括工件装料、旋转加热、保温退火及出炉', NULL, NULL, NULL, 'http://localhost/uploads/2026/05/1778145341942-79476fa7-0ec9-4986-b4e5-fa2ee3bafd7a.png', '2026-05-07 09:15:51.903', '2026-05-07 09:15:51.917');
INSERT INTO public."News" (id, "categoryId", "titleZh", "titleEn", "summaryZh", "summaryEn", "contentZh", "contentEn", "coverImage", "publishDate", "viewCount", slug, "isPublished", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (16, 1, '江苏苏能工业炉在2026全国钢材热处理技术论坛分享工艺创新', NULL, '在2026全国钢材热处理技术论坛上，江苏苏能工业炉有限公司应邀分享公司最新工业炉工艺创新及应用案例。论坛汇集了国内钢材、机械制造及航空航天行业的专家和企业代表，江苏苏能工业炉以技术报告形式介绍了台车炉、托辊网带炉及转底炉的工艺特点及优化经验。
报告重点介绍了江苏苏能工业炉在提升炉', NULL, '<p>在2026全国钢材热处理技术论坛上，江苏苏能工业炉有限公司应邀分享公司最新工业炉工艺创新及应用案例。论坛汇集了国内钢材、机械制造及航空航天行业的专家和企业代表，江苏苏能工业炉以技术报告形式介绍了台车炉、托辊网带炉及转底炉的工艺特点及优化经验。</p><p>报告重点介绍了江苏苏能工业炉在提升炉温均匀性、减少工件热应力和优化热循环流程方面的技术成果。例如，公司研发的智能台车轨道系统可自动调节工件移动速度，确保台车炉内大型零部件均匀加热；托辊网带炉配合多段温控和循环气流，实现钢卷及板材连续化高精度退火；转底炉的旋转加热结构和智能冷却控制，保证大型钢管的热处理一致性。</p><p>论坛期间，江苏苏能工业炉还展示了生产线自动化控制系统和数据追溯功能。技术团队现场演示了如何通过智能监控实现炉温曲线记录、工件位置追踪及工艺优化建议，为客户提供高精度、可追溯的生产解决方案。参会企业对江苏苏能工业炉产品的工艺创新和行业应用表示高度认可。</p><p>江苏苏能工业炉强调，热处理工艺优化不仅提高产品质量，也能有效节约能源并降低生产成本。公司将继续推动智能化工业炉和工艺改进，为钢材及大型机械制造行业提供可靠、高效、绿色的热处理解决方案。</p>', NULL, 'http://localhost/uploads/2026/05/1778145360239-9cd57e95-9b80-4ad5-9199-05de6188d657.png', '2026-05-07 09:15:53.143', 0, 'jiang-su-su-neng-gong-ye-lu-zai-2026-quan-guo-gang-cai-re-chu-li-ji-shu-lun-tan-fen-xiang-gong-yi-chuang-xin', true, 0, 'published', '江苏苏能工业炉在2026全国钢材热处理技术论坛分享工艺创新', NULL, '在2026全国钢材热处理技术论坛上，江苏苏能工业炉有限公司应邀分享公司最新工业炉工艺创新及应用案例。论坛汇集了国内钢材、机械制造及航空航天行业的专家和企业代表，江苏苏能工业炉以技术报告形式介绍了台车炉、托辊网带炉及转底炉的工艺特点及优化经验。
报告重点介绍了江苏苏能工业炉在提升炉', NULL, NULL, NULL, 'http://localhost/uploads/2026/05/1778145360239-9cd57e95-9b80-4ad5-9199-05de6188d657.png', '2026-05-07 09:16:05.698', '2026-05-07 09:16:05.713');
INSERT INTO public."News" (id, "categoryId", "titleZh", "titleEn", "summaryZh", "summaryEn", "contentZh", "contentEn", "coverImage", "publishDate", "viewCount", slug, "isPublished", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (17, 1, '江苏苏能工业炉在2026工业炉与热处理技术交流会上分享智能工艺经验', NULL, '江苏苏能工业炉有限公司应邀参加2026工业炉与热处理技术交流会，在会议上分享了公司在智能化热处理工艺方面的最新成果和应用经验。会议聚焦国内钢材、铜材及大型机械零部件行业，吸引了众多行业专家、企业代表及媒体关注。
江苏苏能工业炉展示了台车炉、托辊型网带炉、箱式炉及铜丝退火生产线的工', NULL, '<p>江苏苏能工业炉有限公司应邀参加2026工业炉与热处理技术交流会，在会议上分享了公司在智能化热处理工艺方面的最新成果和应用经验。会议聚焦国内钢材、铜材及大型机械零部件行业，吸引了众多行业专家、企业代表及媒体关注。</p><p>江苏苏能工业炉展示了台车炉、托辊型网带炉、箱式炉及铜丝退火生产线的工艺特点和智能化升级方案。公司技术团队重点介绍了炉温均匀性提升、多段加热优化、自动送料和工件追踪系统在实际生产中的应用案例，讲解了智能监控与数据追溯如何帮助客户提高工件质量和生产效率。</p><p>现场演示环节中，江苏苏能工业炉通过数据可视化展示炉膛温度、工件输送状态及工艺一致性，展示了设备在退火、固溶、回火等工艺中的高精度表现。参会客户表示，江苏苏能工业炉的工艺优化与智能化控制在提升产能、降低能耗及保证产品质量方面优势显著。</p>', NULL, 'http://localhost/uploads/2026/05/1778145374255-d823174e-1a0f-445d-bd64-3483204fa733.png', '2026-05-07 09:16:07.431', 1, 'jiang-su-su-neng-gong-ye-lu-zai-2026-gong-ye-lu-yu-re-chu-li-ji-shu-jiao-liu-hui-shang-fen-xiang-zhi-neng-gong-yi-jing-yan', true, 0, 'published', '江苏苏能工业炉在2026工业炉与热处理技术交流会上分享智能工艺经验', NULL, '江苏苏能工业炉有限公司应邀参加2026工业炉与热处理技术交流会，在会议上分享了公司在智能化热处理工艺方面的最新成果和应用经验。会议聚焦国内钢材、铜材及大型机械零部件行业，吸引了众多行业专家、企业代表及媒体关注。
江苏苏能工业炉展示了台车炉、托辊型网带炉、箱式炉及铜丝退火生产线的工', NULL, NULL, NULL, 'http://localhost/uploads/2026/05/1778145374255-d823174e-1a0f-445d-bd64-3483204fa733.png', '2026-05-07 09:16:20.093', '2026-05-07 09:16:41.227');


--
-- Data for Name: Partner; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Partner" (id, name, "logoUrl", website, "sortOrder", status, "createdAt", "updatedAt") VALUES (1, '合作伙伴 1', 'https://placehold.co/220x96/004B97/ffffff', 'https://example-1.com', 10, 'published', '2026-04-18 08:20:35.528', '2026-04-18 08:20:35.528');
INSERT INTO public."Partner" (id, name, "logoUrl", website, "sortOrder", status, "createdAt", "updatedAt") VALUES (2, '合作伙伴 2', 'https://placehold.co/220x96/0B3768/ffffff', 'https://example-2.com', 20, 'published', '2026-04-18 08:20:35.528', '2026-04-18 08:20:35.528');
INSERT INTO public."Partner" (id, name, "logoUrl", website, "sortOrder", status, "createdAt", "updatedAt") VALUES (3, '合作伙伴 3', 'https://placehold.co/220x96/004B97/ffffff', 'https://example-3.com', 30, 'published', '2026-04-18 08:20:35.528', '2026-04-18 08:20:35.528');
INSERT INTO public."Partner" (id, name, "logoUrl", website, "sortOrder", status, "createdAt", "updatedAt") VALUES (4, '合作伙伴 4', 'https://placehold.co/220x96/0B3768/ffffff', 'https://example-4.com', 40, 'published', '2026-04-18 08:20:35.528', '2026-04-18 08:20:35.528');
INSERT INTO public."Partner" (id, name, "logoUrl", website, "sortOrder", status, "createdAt", "updatedAt") VALUES (5, '合作伙伴 5', 'https://placehold.co/220x96/004B97/ffffff', 'https://example-5.com', 50, 'published', '2026-04-18 08:20:35.528', '2026-04-18 08:20:35.528');
INSERT INTO public."Partner" (id, name, "logoUrl", website, "sortOrder", status, "createdAt", "updatedAt") VALUES (6, '合作伙伴 6', 'https://placehold.co/220x96/0B3768/ffffff', 'https://example-6.com', 60, 'published', '2026-04-18 08:20:35.528', '2026-04-18 08:20:35.528');
INSERT INTO public."Partner" (id, name, "logoUrl", website, "sortOrder", status, "createdAt", "updatedAt") VALUES (7, '合作伙伴 7', 'https://placehold.co/220x96/004B97/ffffff', 'https://example-7.com', 70, 'published', '2026-04-18 08:20:35.528', '2026-04-18 08:20:35.528');
INSERT INTO public."Partner" (id, name, "logoUrl", website, "sortOrder", status, "createdAt", "updatedAt") VALUES (8, '合作伙伴 8', 'https://placehold.co/220x96/0B3768/ffffff', 'https://example-8.com', 80, 'published', '2026-04-18 08:20:35.528', '2026-04-18 08:20:35.528');


--
-- Data for Name: SalesOutlet; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."SalesOutlet" (id, "regionZh", "regionEn", "cityZh", "cityEn", "addressZh", "addressEn", phone, lat, lng, "sortOrder", status, "createdAt", "updatedAt") VALUES (1, '华中', 'Central China', '武汉', 'Wuhan', '湖北省武汉市示例路 88 号', 'No. 88 Example Road, Wuhan, Hubei', '+86 027-00000001', 30.5928, 114.3055, 10, 'published', '2026-04-18 08:20:35.532', '2026-04-18 08:20:35.532');
INSERT INTO public."SalesOutlet" (id, "regionZh", "regionEn", "cityZh", "cityEn", "addressZh", "addressEn", phone, lat, lng, "sortOrder", status, "createdAt", "updatedAt") VALUES (2, '华东', 'East China', '南京', 'Nanjing', '江苏省南京市示例大道 18 号', 'No. 18 Example Avenue, Nanjing, Jiangsu', '+86 025-00000002', 32.0603, 118.7969, 20, 'published', '2026-04-18 08:20:35.532', '2026-04-18 08:20:35.532');
INSERT INTO public."SalesOutlet" (id, "regionZh", "regionEn", "cityZh", "cityEn", "addressZh", "addressEn", phone, lat, lng, "sortOrder", status, "createdAt", "updatedAt") VALUES (3, '西南', 'Southwest China', '成都', 'Chengdu', '四川省成都市示例街 66 号', 'No. 66 Example Street, Chengdu, Sichuan', '+86 028-00000003', 30.5728, 104.0668, 30, 'published', '2026-04-18 08:20:35.532', '2026-04-18 08:20:35.532');


--
-- Data for Name: SeoMeta; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."SeoMeta" (id, "pageKey", "titleZh", "titleEn", "descriptionZh", "descriptionEn", "keywordsZh", "keywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (1, 'home', '制造业企业官网示例', 'Manufacturing Corporate Website Demo', '用于联调和展示的制造业企业官网示例首页 SEO 配置。', 'SEO settings for the manufacturing corporate website demo homepage.', '制造业,企业官网,矿山设备', 'manufacturing,corporate website,mining equipment', 'https://placehold.co/1200x630/004B97/ffffff', '2026-04-18 08:20:35.532', '2026-04-18 08:20:35.532');
INSERT INTO public."SeoMeta" (id, "pageKey", "titleZh", "titleEn", "descriptionZh", "descriptionEn", "keywordsZh", "keywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (2, 'products', '产品中心', 'Product Center', '查看产品分类、热销产品与详细参数信息。', 'Browse product categories, hot products and technical details.', '产品中心,设备产品', 'products,equipment', 'https://placehold.co/1200x630/0B3768/ffffff', '2026-04-18 08:20:35.533', '2026-04-18 08:20:35.533');
INSERT INTO public."SeoMeta" (id, "pageKey", "titleZh", "titleEn", "descriptionZh", "descriptionEn", "keywordsZh", "keywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (3, 'news', '新闻中心', 'News Center', '查看公司新闻与行业新闻。', 'Read company and industry news.', '新闻中心,公司新闻,行业新闻', 'news,company news,industry news', 'https://placehold.co/1200x630/123F74/ffffff', '2026-04-18 08:20:35.533', '2026-04-18 08:20:35.533');


--
-- Data for Name: ServiceSection; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."ServiceSection" (id, "sectionKey", "titleZh", "titleEn", "contentZh", "contentEn", "imageUrl", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (1, 'after-sales', '售后服务', 'After-sales Service', '建立标准化售后响应流程，覆盖安装指导、巡检保养与故障处理。', 'Standardized after-sales response covering installation guidance, inspection and troubleshooting.', 'https://placehold.co/1200x800/004B97/ffffff', 10, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.531', '2026-04-18 08:20:35.531');
INSERT INTO public."ServiceSection" (id, "sectionKey", "titleZh", "titleEn", "contentZh", "contentEn", "imageUrl", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (2, 'advantages', '服务优势', 'Service Advantages', '依托区域网点与服务机制，缩短响应链路，提升项目保障能力。', 'Regional outlets and service processes reduce response time and improve project assurance.', 'https://placehold.co/1200x800/0B3768/ffffff', 20, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.531', '2026-04-18 08:20:35.531');
INSERT INTO public."ServiceSection" (id, "sectionKey", "titleZh", "titleEn", "contentZh", "contentEn", "imageUrl", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (3, 'consultation', '在线咨询', 'Online Consultation', '提供产品选型、项目配置与商务咨询的快速入口。', 'A quick channel for product selection, project configuration and commercial consultation.', 'https://placehold.co/1200x800/123F74/ffffff', 30, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.531', '2026-04-18 08:20:35.531');


--
-- Data for Name: StrengthItem; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."StrengthItem" (id, "categoryId", "titleZh", "titleEn", "summaryZh", "summaryEn", "contentZh", "contentEn", "imageUrl", "imagesJson", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (1, 1, '核心研发技术团队', 'Core Engineering Team', '覆盖结构、液压、电控与整机集成。', 'Covering structure, hydraulics, control systems and whole-vehicle integration.', '技术团队长期围绕矿山与地下工程装备的工况需求，持续优化设备可靠性与维护便利性。', 'The engineering team continuously improves reliability and maintainability for mining scenarios.', 'https://placehold.co/900x700/004B97/ffffff', '["https://placehold.co/1200x900/004B97/ffffff", "https://placehold.co/1200x900/0B3768/ffffff"]', 10, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.526', '2026-04-18 08:20:35.526');
INSERT INTO public."StrengthItem" (id, "categoryId", "titleZh", "titleEn", "summaryZh", "summaryEn", "contentZh", "contentEn", "imageUrl", "imagesJson", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (2, 4, '现代化生产设备', 'Modern Production Equipment', '覆盖焊接、装配、检测等关键制造环节。', 'Covering key manufacturing processes including welding, assembly and inspection.', '生产设备配置围绕稳定交付和品质控制展开，支撑多类型产品制造。', 'Production equipment is configured around stable delivery and quality control.', 'https://placehold.co/900x700/123F74/ffffff', '["https://placehold.co/1200x900/123F74/ffffff", "https://placehold.co/1200x900/0D2D57/ffffff"]', 20, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.526', '2026-04-18 08:20:35.526');


--
-- Data for Name: TimelineEvent; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TimelineEvent" (id, year, "titleZh", "titleEn", "contentZh", "contentEn", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (1, 2011, '公司成立', 'Company Founded', '腾腾装备在湖北正式成立，进入地下工程装备领域。', 'Tianteng Equipment was founded in Hubei and entered the underground equipment sector.', 10, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.525', '2026-04-18 08:20:35.525');
INSERT INTO public."TimelineEvent" (id, year, "titleZh", "titleEn", "contentZh", "contentEn", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (2, 2016, '产品体系扩展', 'Product Portfolio Expanded', '完成多类型矿山施工装备产品布局，提升成套化交付能力。', 'Expanded the equipment portfolio and improved integrated delivery capability.', 20, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.525', '2026-04-18 08:20:35.525');
INSERT INTO public."TimelineEvent" (id, year, "titleZh", "titleEn", "contentZh", "contentEn", "sortOrder", status, "seoTitleZh", "seoTitleEn", "seoDescriptionZh", "seoDescriptionEn", "seoKeywordsZh", "seoKeywordsEn", "ogImage", "createdAt", "updatedAt") VALUES (3, 2021, '制造与服务升级', 'Manufacturing and Service Upgrade', '制造体系与售后网络同步升级，进一步覆盖核心区域客户。', 'Manufacturing and after-sales systems were upgraded to cover more key regions.', 30, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 08:20:35.525', '2026-04-18 08:20:35.525');


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('2d781cea-8f2c-445f-96ef-ea00c9343da5', '073cfef3322f406b4925524c6066a7b89b54547fb085beee906023c3ac3573aa', '2026-04-18 08:20:35.36298+00', '20260418082000_init', '', NULL, '2026-04-18 08:20:35.36298+00', 0);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('bd2781dc-8b90-47fb-ad1c-081106882067', '2c8c5c1b282d7c800249725f299a8658c00db0c5825984131d460cfda89133a5', '2026-05-03 16:41:00.513048+00', '20260503130000_custom_requirements', NULL, NULL, '2026-05-03 16:41:00.493561+00', 1);


--
-- Name: AboutSection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."AboutSection_id_seq"', 1, true);


--
-- Name: AdminUser_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."AdminUser_id_seq"', 2, true);


--
-- Name: Banner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Banner_id_seq"', 3, true);


--
-- Name: Certificate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Certificate_id_seq"', 3, true);


--
-- Name: ChairmanMessage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ChairmanMessage_id_seq"', 1, true);


--
-- Name: CompanyInfo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."CompanyInfo_id_seq"', 16, true);


--
-- Name: ContactMessage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ContactMessage_id_seq"', 1, true);


--
-- Name: CultureValue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."CultureValue_id_seq"', 3, true);


--
-- Name: CustomRequirement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."CustomRequirement_id_seq"', 1, true);


--
-- Name: Delivery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Delivery_id_seq"', 2, true);


--
-- Name: NewsCategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."NewsCategory_id_seq"', 4, true);


--
-- Name: News_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."News_id_seq"', 17, true);


--
-- Name: Partner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Partner_id_seq"', 8, true);


--
-- Name: ProductCategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ProductCategory_id_seq"', 20, true);


--
-- Name: Product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Product_id_seq"', 20, true);


--
-- Name: SalesOutlet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."SalesOutlet_id_seq"', 3, true);


--
-- Name: SeoMeta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."SeoMeta_id_seq"', 3, true);


--
-- Name: ServiceSection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ServiceSection_id_seq"', 3, true);


--
-- Name: StrengthCategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."StrengthCategory_id_seq"', 8, true);


--
-- Name: StrengthItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."StrengthItem_id_seq"', 2, true);


--
-- Name: TimelineEvent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TimelineEvent_id_seq"', 3, true);


--
-- PostgreSQL database dump complete
--

\unrestrict kd7PVbwiDFjvphfzdzQW5FeCjnJYoXDeB3RddAnEPqSoeFx3JbfY3wrVCJb6gPz
