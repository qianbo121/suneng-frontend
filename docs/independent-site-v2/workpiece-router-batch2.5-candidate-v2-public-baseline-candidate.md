# 工件路由第2.5.1批首版公开基线候选包 v2

生成时间：2026-08-27T16:48:15.712Z

## 一句话结论

已形成 6 条规则、23 个pair的 candidate-v2；证据和工程门禁已收窄，但当前生产仍为0条公开，尚未签署。

## 版本关系

- v1：`returned_for_revision`，已按原始字节归档，不覆盖。
- v2：`industry-public-baseline-2026-08-batch2.5-candidate-v2`，等待负责人一次性签署。
- 负责人签署对象必须同时包含 `baselineVersion`、`technicalSnapshotHash` 与最终 `approvalBundleHash`。

## 状态语义

- 方向门禁全部为true：`matched_direction`。
- 存在unknown且没有false：`conditional_preview`，最多显示3个条件候选。
- 任一方向门禁为false：`engineering_review`，不得显示不兼容炉型。
- 正式规格资料属于 `finalSizingInputs`，不会倒退为方向门禁，也不会在明确命中时重复写成同一待确认条件。

## 候选范围

| ruleId | 公开工件名称 | 公开处理目的 | 行业常见设备方向 | 风险 |
|---|---|---|---|---|
| eqdir-heavy-car-bottom-v1 | 大型锻制法兰 | 正火 | 台车式周期炉 | 中高 |
| eqdir-heavy-car-bottom-v1 | 大型锻制法兰 | 单独回火 | 台车式周期炉 | 中高 |
| eqdir-heavy-car-bottom-v1 | 大型锻制法兰 | 退火 | 台车式周期炉 | 中高 |
| eqdir-heavy-car-bottom-v1 | 大型轴类锻件 | 正火 | 台车式周期炉 | 中高 |
| eqdir-heavy-car-bottom-v1 | 大型轴类锻件 | 单独回火 | 台车式周期炉 | 中高 |
| eqdir-heavy-car-bottom-v1 | 大型轴类锻件 | 退火 | 台车式周期炉 | 中高 |
| eqdir-heavy-car-bottom-v1 | 大型铸钢件 | 正火 | 台车式周期炉 | 中高 |
| eqdir-heavy-car-bottom-v1 | 大型铸钢件 | 单独回火 | 台车式周期炉 | 中高 |
| eqdir-heavy-car-bottom-v1 | 大型铸钢件 | 退火 | 台车式周期炉 | 中高 |
| eqdir-wear-plate-quench-temper-line-v2 | 均质耐磨钢板（整体调质） | 淬火与回火 | 辊底式连续调质热处理线 | 中高 |
| eqdir-carbon-steel-coil-bell-batch-v2 | 碳钢带卷（成卷批次退火） | 成卷退火 | 罩式周期炉 | 中 |
| eqdir-long-products-roller-thermal-v2 | 无缝钢管 | 正火 | 辊底式连续热处理炉/线 | 中 |
| eqdir-long-products-roller-thermal-v2 | 无缝钢管 | 退火 | 辊底式连续热处理炉/线 | 中 |
| eqdir-long-products-roller-thermal-v2 | 焊接钢管（整管处理） | 整管正火 | 辊底式连续热处理炉/线 | 中 |
| eqdir-long-products-roller-thermal-v2 | 焊接钢管（整管处理） | 整管退火 | 辊底式连续热处理炉/线 | 中 |
| eqdir-long-products-roller-thermal-v2 | 圆钢 / 棒材 | 正火 | 辊底式连续热处理炉/线 | 中 |
| eqdir-long-products-roller-thermal-v2 | 圆钢 / 棒材 | 退火 | 辊底式连续热处理炉/线 | 中 |
| eqdir-wire-coil-bell-v1 | 盘条 | 球化退火 | 罩式周期炉 | 中 |
| eqdir-wire-coil-bell-v1 | 盘条 | 再结晶退火 | 罩式周期炉 | 中 |
| eqdir-wire-coil-bell-v1 | 钢丝卷 | 球化退火 | 罩式周期炉 | 中 |
| eqdir-wire-coil-bell-v1 | 钢丝卷 | 再结晶退火 | 罩式周期炉 | 中 |
| eqdir-fastener-mesh-quench-temper-v2 | 高强度螺栓 | 淬火与回火 | 网带式调质热处理线 | 中高 |
| eqdir-fastener-mesh-quench-temper-v2 | 钢制六角螺母（整体调质） | 淬火与回火 | 网带式调质热处理线 | 中高 |

## 客户实际会看到的完整文案

### 1. 台车式周期炉

- 规则：`eqdir-heavy-car-bottom-v1`
- 入选pair：9个
- 证据直接支持：CAN-ENG与NUTEC Bickley原厂资料直接支持大型/重载锻件、铸造行业工件与台车式批次炉的一般应用，以及退火、正火和回火工艺范围；Surface Combustion仅作设备能力补充。
- 工程推导：具体法兰、轴类锻件和铸钢件方向仍由工件形态、整体处理、批次决策、移动炉床承载及服务端兼容性共同推导。
- 不支持边界：轴类卧式支撑或变形条件不兼容时不得输出；未知时仅显示条件候选。大型模块锻件继续排除。
- 条件候选文案：如果尚待确认的方向门禁满足，可条件性评估的行业常见设备方向之一为“台车式周期炉”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。
- 明确命中文案：根据当前填写并经服务端规则校验的工况，可优先评估的行业常见设备方向之一为“台车式周期炉”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。
- 工程复核文案：当前工况存在与候选方向不兼容的关键条件，暂不显示具体炉型，进入工程复核。请提交图纸、执行标准和完整工况，由工程师进一步判断。

### 2. 辊底式连续调质热处理线

- 规则：`eqdir-wear-plate-quench-temper-line-v2`
- 入选pair：1个
- 证据直接支持：CAN-ENG原厂资料直接支持钢板辊底式调质整线及完整工艺链，Tenova资料补充耐磨钢板应用。
- 工程推导：仅对均质耐磨钢板整体调质，在连续生产、板形支撑、淬火转移和完整工艺链均满足时形成方向。
- 不支持边界：复合、堆焊和覆层耐磨板全部排除。
- 条件候选文案：如果尚待确认的方向门禁满足，可条件性评估的行业常见设备方向之一为“辊底式连续调质热处理线”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。
- 明确命中文案：根据当前填写并经服务端规则校验的工况，可优先评估的行业常见设备方向之一为“辊底式连续调质热处理线”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。
- 工程复核文案：当前工况存在与候选方向不兼容的关键条件，暂不显示具体炉型，进入工程复核。请提交图纸、执行标准和完整工况，由工程师进一步判断。

### 3. 罩式周期炉

- 规则：`eqdir-carbon-steel-coil-bell-batch-v2`
- 入选pair：1个
- 证据直接支持：EBNER原厂资料直接支持碳钢带卷的罩式成卷批次退火应用。
- 工程推导：结合成卷批次处理、无涂镀/覆层、卷材堆垛、气氛和服务端兼容性形成方向。
- 不支持边界：涂镀、覆层或开卷连续处理必须另行判断。
- 条件候选文案：如果尚待确认的方向门禁满足，可条件性评估的行业常见设备方向之一为“罩式周期炉”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。
- 明确命中文案：根据当前填写并经服务端规则校验的工况，可优先评估的行业常见设备方向之一为“罩式周期炉”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。
- 工程复核文案：当前工况存在与候选方向不兼容的关键条件，暂不显示具体炉型，进入工程复核。请提交图纸、执行标准和完整工况，由工程师进一步判断。

### 4. 辊底式连续热处理炉/线

- 规则：`eqdir-long-products-roller-thermal-v2`
- 入选pair：6个
- 证据直接支持：CAN-ENG与Tenova原厂资料直接支持钢管、圆钢棒的连续式辊底退火或正火应用。
- 工程推导：整管/整棒、连续生产决策、辊道支撑、直线度和装载兼容性共同形成方向。
- 不支持边界：焊接钢管只允许整管退火/整管正火；在线焊缝和局部感应处理全部排除。
- 条件候选文案：如果尚待确认的方向门禁满足，可条件性评估的行业常见设备方向之一为“辊底式连续热处理炉/线”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。
- 明确命中文案：根据当前填写并经服务端规则校验的工况，可优先评估的行业常见设备方向之一为“辊底式连续热处理炉/线”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。
- 工程复核文案：当前工况存在与候选方向不兼容的关键条件，暂不显示具体炉型，进入工程复核。请提交图纸、执行标准和完整工况，由工程师进一步判断。

### 5. 罩式周期炉

- 规则：`eqdir-wire-coil-bell-v1`
- 入选pair：4个
- 证据直接支持：EBNER原厂资料直接支持钢丝卷球化或再结晶罩式退火。
- 工程推导：成卷工件、批次决策、卷材堆垛、气氛与循环边界共同形成方向。
- 不支持边界：未被直接资料覆盖的去应力pair继续排除。
- 条件候选文案：如果尚待确认的方向门禁满足，可条件性评估的行业常见设备方向之一为“罩式周期炉”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。
- 明确命中文案：根据当前填写并经服务端规则校验的工况，可优先评估的行业常见设备方向之一为“罩式周期炉”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。
- 工程复核文案：当前工况存在与候选方向不兼容的关键条件，暂不显示具体炉型，进入工程复核。请提交图纸、执行标准和完整工况，由工程师进一步判断。

### 6. 网带式调质热处理线

- 规则：`eqdir-fastener-mesh-quench-temper-v2`
- 入选pair：2个
- 证据直接支持：CAN-ENG与AFC-Holcroft原厂资料直接支持紧固件高产量网带式加热、淬火、清洗和回火整线应用。
- 工程推导：只对材料、结构、散装承载、完整调质链和连续生产条件均满足的钢制紧固件形成方向。
- 不支持边界：钢制六角螺母排除不锈钢、有色、嵌件、自锁、焊接总成和非整体调质；钢销继续排除。
- 条件候选文案：如果尚待确认的方向门禁满足，可条件性评估的行业常见设备方向之一为“网带式调质热处理线”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。
- 明确命中文案：根据当前填写并经服务端规则校验的工况，可优先评估的行业常见设备方向之一为“网带式调质热处理线”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。
- 工程复核文案：当前工况存在与候选方向不兼容的关键条件，暂不显示具体炉型，进入工程复核。请提交图纸、执行标准和完整工况，由工程师进一步判断。

## 证据处理结论

- Surface Combustion已降为设备能力参考与条件性工程推导，不再作为9个pair的逐项直接证据。
- 台车炉由CAN-ENG与NUTEC Bickley原厂应用资料补强。
- 圆钢/棒材、钢板调质整线、紧固件网带调质分别由CAN-ENG原厂资料补强。
- 每条入选证据均冻结issuer、title、url、accessedAt、支持主张、段落位置、内容哈希及不支持边界。

## 所有56条执行规则去向

| ruleId | 内部状态 | 候选状态 | 入选/允许pair | 原因 |
|---|---|---|---|---|
| eqdir-wear-plate-quench-temper-line-v2 | eligible | full_candidate | 1/1 | 全部允许pair已进入v2候选。 |
| eqdir-aluminum-plate-solution-quench-v2 | blocked | not_selected | 0/1 | blocked：不参与候选或公开。 |
| eqdir-stainless-solution-batch-v1 | pending_blocked | not_selected | 0/1 | pending_blocked：不参与候选或公开。 |
| eqdir-stainless-protective-batch-v1 | blocked | not_selected | 0/1 | blocked：不参与候选或公开。 |
| eqdir-stainless-continuous-v1 | pending_blocked | not_selected | 0/1 | pending_blocked：不参与候选或公开。 |
| eqdir-aluminum-coil-bell-batch-v2 | blocked | not_selected | 0/1 | blocked：不参与候选或公开。 |
| eqdir-aluminum-strip-continuous-v2 | eligible | not_selected | 0/1 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-carbon-steel-coil-bell-batch-v2 | eligible | full_candidate | 1/1 | 全部允许pair已进入v2候选。 |
| eqdir-carbon-steel-strip-continuous-v2 | eligible | not_selected | 0/1 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-chain-component-mesh-quench-temper-v2 | pending_blocked | not_selected | 0/1 | pending_blocked：不参与候选或公开。 |
| eqdir-chain-component-batch-quench-temper-v2 | pending_blocked | not_selected | 0/1 | pending_blocked：不参与候选或公开。 |
| eqdir-small-spring-stress-relief-continuous-v2 | eligible | not_selected | 0/1 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-small-spring-stress-relief-batch-v2 | pending_blocked | not_selected | 0/1 | pending_blocked：不参与候选或公开。 |
| eqdir-small-spring-quench-temper-continuous-v2 | blocked | not_selected | 0/1 | blocked：不参与候选或公开。 |
| eqdir-small-spring-quench-temper-batch-v2 | pending_blocked | not_selected | 0/1 | pending_blocked：不参与候选或公开。 |
| eqdir-large-gear-quench-temper-line-v2 | blocked | not_selected | 0/2 | blocked：不参与候选或公开。 |
| eqdir-aluminum-plate-anneal-aging-v2 | eligible | not_selected | 0/2 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-steel-plate-batch-thermal-v2 | blocked | not_selected | 0/3 | blocked：不参与候选或公开。 |
| eqdir-fastener-mesh-quench-temper-v2 | eligible | partial_candidate | 2/3 | 钢制六角螺母排除不锈钢、有色、嵌件、自锁、焊接总成和非整体调质；钢销继续排除。 |
| eqdir-fastener-batch-quench-temper-v2 | pending_blocked | not_selected | 0/3 | pending_blocked：不参与候选或公开。 |
| eqdir-shaft-quench-temper-line-v2 | blocked | not_selected | 0/4 | blocked：不参与候选或公开。 |
| eqdir-long-products-roller-quench-temper-v2 | eligible | not_selected | 0/4 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-long-products-fixed-hearth-quench-temper-v2 | pending_blocked | not_selected | 0/4 | pending_blocked：不参与候选或公开。 |
| eqdir-long-products-vertical-quench-temper-v2 | blocked | not_selected | 0/4 | blocked：不参与候选或公开。 |
| eqdir-welded-car-bottom-v1 | eligible | not_selected | 0/6 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-welded-pwht-whole-car-bottom-v2 | eligible | not_selected | 0/6 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-welded-vertical-v1 | blocked | not_selected | 0/6 | blocked：不参与候选或公开。 |
| eqdir-welded-pwht-whole-vertical-v2 | blocked | not_selected | 0/6 | blocked：不参与候选或公开。 |
| eqdir-welded-batch-chamber-v1 | pending_blocked | not_selected | 0/6 | pending_blocked：不参与候选或公开。 |
| eqdir-welded-pwht-local-v2 | eligible | not_selected | 0/6 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-welded-pwht-field-v2 | eligible | not_selected | 0/6 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-large-gear-vertical-thermal-v2 | eligible | not_selected | 0/6 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-large-gear-fixed-hearth-thermal-v2 | pending_blocked | not_selected | 0/6 | pending_blocked：不参与候选或公开。 |
| eqdir-large-gear-continuous-thermal-v2 | blocked | not_selected | 0/6 | blocked：不参与候选或公开。 |
| eqdir-wire-coil-vertical-v1 | blocked | not_selected | 0/6 | blocked：不参与候选或公开。 |
| eqdir-wire-coil-bell-v1 | eligible | partial_candidate | 4/6 | 未被直接资料覆盖的去应力pair继续排除。 |
| eqdir-undercarriage-continuous-quench-temper-v2 | blocked | not_selected | 0/7 | blocked：不参与候选或公开。 |
| eqdir-undercarriage-fixed-hearth-quench-temper-v2 | pending_blocked | not_selected | 0/7 | pending_blocked：不参与候选或公开。 |
| eqdir-undercarriage-car-bottom-quench-temper-v2 | blocked | not_selected | 0/7 | blocked：不参与候选或公开。 |
| eqdir-shaft-vertical-thermal-v2 | eligible | not_selected | 0/8 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-shaft-fixed-hearth-thermal-v2 | pending_blocked | not_selected | 0/8 | pending_blocked：不参与候选或公开。 |
| eqdir-shaft-continuous-thermal-v2 | eligible | not_selected | 0/8 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-long-products-roller-thermal-v2 | eligible | partial_candidate | 6/8 | 焊接钢管只允许整管退火/整管正火；在线焊缝和局部感应处理全部排除。 |
| eqdir-long-products-fixed-hearth-thermal-v2 | pending_blocked | not_selected | 0/8 | pending_blocked：不参与候选或公开。 |
| eqdir-long-products-vertical-thermal-v2 | blocked | not_selected | 0/8 | blocked：不参与候选或公开。 |
| eqdir-heavy-car-bottom-v1 | eligible | partial_candidate | 9/12 | 轴类卧式支撑或变形条件不兼容时不得输出；未知时仅显示条件候选。大型模块锻件继续排除。 |
| eqdir-heavy-hydrogen-relief-car-bottom-v2 | eligible | not_selected | 0/2 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-heavy-ductile-iron-car-bottom-v2 | eligible | not_selected | 0/2 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-heavy-normalize-temper-car-bottom-v2 | blocked | not_selected | 0/4 | blocked：不参与候选或公开。 |
| eqdir-undercarriage-continuous-thermal-v2 | eligible | not_selected | 0/12 | 本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。 |
| eqdir-undercarriage-fixed-hearth-thermal-v2 | pending_blocked | not_selected | 0/12 | pending_blocked：不参与候选或公开。 |
| eqdir-undercarriage-car-bottom-thermal-v2 | blocked | not_selected | 0/12 | blocked：不参与候选或公开。 |
| eqdir-carburizing-continuous-v1 | pending_blocked | not_selected | 0/13 | pending_blocked：不参与候选或公开。 |
| eqdir-carburizing-batch-v1 | pending_blocked | not_selected | 0/13 | pending_blocked：不参与候选或公开。 |
| eqdir-heavy-vertical-v1 | blocked | not_selected | 0/20 | blocked：不参与候选或公开。 |
| eqdir-heavy-batch-chamber-v1 | pending_blocked | not_selected | 0/20 | pending_blocked：不参与候选或公开。 |

## 冻结哈希

- technicalSnapshotHash：`sha256:f1577a282715a2f84239917c9d7be8ba6bf85217936f61be81bd302ee6401f61`
- evidenceSnapshotHash：`sha256:ad73c98942e397df081146b6f94a3722147e95688d1da4cac5138a061578796b`
- publicCopySnapshotHash：`sha256:3fc97afa9b39834fb766bc6b8af432c8d7a586b1ded654acb9ade2cc06d3f0df`
- codeAndDataSnapshotHash：`sha256:8386487cd9711f1397d3ade0c3209c8272d2d91b1dd47e8cc33e37d9ffa857dc`
- approvalScopeHash：`sha256:2f9578abeb9ecbbe8722bdb8a0b9a58d31e7ffe42234dd8b9c14ed749405b613`
- snapshotHash：`sha256:f9d8edb1a30d039de22d8782a8b0daa15025fd9928cf23f62b290a007cc11b1f`

`approvalBundleHash`将在有效矩阵、报告、测试清单与3张截图全部生成后计算；当前批准记录全部为空。
