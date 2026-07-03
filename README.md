# Notion 新闻事件与市场 K 线

React + Vite + Node 后端，展示多资产 1D K 线与 Notion 事件 timeline。

## 快速启动

```bash
npm install
npm run build
npm run preview
```

开发期：

```bash
npm run api      # 后端 http://127.0.0.1:8787
npm run dev      # 前端 http://127.0.0.1:5173，自动代理 /api 到 8787
```

## 环境变量

复制 `.env.example` 为 `.env`，填入：

- `NOTION_KEY`：Notion integration token
- `NOTION_DATABASE_ID`：父 database ID（仅用于校验）
- `NOTION_DATA_SOURCE_ID`：实际查询的 data source ID
- `FINNHUB_API_KEY`：Finnhub API key
- `PORT`：后端端口（默认 8787）

## 项目结构

```
server/          # Node 后端，只读代理 Notion 和 Finnhub
shared/          # 前后端共享的资产配置
src/             # React 前端
  components/    # UI 组件
  lib/           # API client、日期、图表配置
```

## API

- `GET /api/events?from=YYYY-MM-DD&to=YYYY-MM-DD` — 返回 Notion 事件
- `GET /api/candles?asset=AAPL&from=YYYY-MM-DD&to=YYYY-MM-DD` — 返回 K 线数据
- `GET /api/health` — 健康检查

## V1 限制

- 只读，无用户自定义资产库
- 不做事件分类筛选、区间事件、暗色模式、完整导出
- 需要 Notion integration 授权到目标 database 才能读取事件
- Finnhub 免费账号可能对某些 symbol 返回 403

## 验收

```bash
npm run build            # 构建成功
npm run check:secrets    # 密钥未泄露到 dist/
node server/index.mjs    # 启动，访问 http://127.0.0.1:8787
```

前端打开后，左侧资产列表、顶部日期范围、中心 K 线、底部事件 timeline 对齐；hover 时所有 grid 垂直线同步；zoom/pan 后日期仍对齐；点击有 URL 的事件可打开来源。
