# 地图数据版本、许可与边界

本目录数据于 2026-10-16 整理，随本项目代码保存，不在使用时静默替换数据。

## 地理底图

`land.geojson`：Natural Earth 1:110m Land，来自官方维护仓库 `nvkelso/natural-earth-vector` 的 `geojson/ne_110m_land.geojson`。公有领域。保留原始地理数据，浏览器使用 D3 等距圆柱投影绘制（不是等面积投影），事件标点采用同一经纬度坐标。源文件：https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson 。条款：https://www.naturalearthdata.com/about/ 。

这是现代自然海岸线的世界尺度数据，不重建古海岸、古河道、围海、海平面变化或城市街区。

## 历史疆界与文化区域

`world_*.json` 来自 André Ourednik 与贡献者的 Historical Basemaps 项目：
https://github.com/aourednik/historical-basemaps 。原始文件路径见 `manifest.json` 的 `source` 字段，位于上游 `geojson/` 目录。上游以 GPL-3.0 发布，本目录这些改编地理数据同样以 GPL-3.0 提供，完整许可见 `HISTORICAL-LICENSE.txt`。

2026-10-16 的修改：只保留 NAME、SUBJECTO、BORDERPRECISION、PARTOF 和几何；使用约 0.12 度容差的 Douglas–Peucker 算法概化线段，并保留至三位小数，适用于世界与洲尺度，不适用于测绘和导航。源区域可能重叠；不做历史归属推测或疆界插值。历史地图数据仍在完善，未经本项目逐国逐年复核；不提供准确性担保。

历史参考年份与实际地图快照分别标示。无同年数据时只使用时间上最近的参考快照（同距时优先较早年份），不是该日的精确疆界，也不代表邻近两快照间边界未变。超出本地快照覆盖范围时只显示物理底图，不用现代国界冒充古代疆界。名称沿用上游资料；政治实体、殖民统治和文化区域不能一概等同于现代国家。虚线表示数据中较低精度的边界；未标精度的边界不能视为精确。

`places.json`：来源为同一仓库 `geojson/places.geojson`。仅保留原数据中有数值型 inhabitedSince 的点位和少量相关字段（共 70 条，since=0 的记录不显示）；大量无年代记录被排除。按 since/until 与所选年份筛选。until 缺失仅表示上游未记载终年，不能证明该城持续存在。聚落名称沿用数据集，不保证为当年的官方名称；点位非全量、各地区覆盖不均衡。

## 可视化代码

`vendor/d3.v7.min.js` 为 D3 7.8.5，来自官方仓库 d3/d3.github.com。许可见 vendor/D3-LICENSE.txt。浏览器仅处理本地地图数据；远程事件和坐标检索仍来自已标示的维基百科/Wikidata。

为减少网络传输，部署文件使用 gzip 压缩（`.json.gz` 与 `land.geojson.gz`）；解压后的内容为可编辑 GeoJSON，许可与原始数据一致。浏览器采用 DecompressionStream 解压；需要支持该标准的现代浏览器。
