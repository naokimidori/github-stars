# GitHub Stars 增强版 - SPEC

## 功能规划

### 1. 详情面板（右侧滑出）
- 点击卡片从右侧滑入详情
- 包含：项目描述、README 摘要、语言/许可证/Stars 基础信息
- Star 趋势图（调用 GitHub API 获取历史）
- AI 分析：技术亮点、适用场景、评价

### 2. AI 分析集成
- 使用 Gemini API 分析项目 README
- 分析维度：技术栈、特点、适用场景、评价
- 显示在详情面板中

### 3. UI 升级
- 更现代的暗色主题
- 卡片带语言颜色标识
- 趋势图用简单 SVG 或 CSS 实现
- 平滑动画过渡

### 4. 标签系统
- 支持给仓库打标签（如"前端工具"、"AI应用"）
- 存在 localStorage
- 筛选时可用

## 技术栈
- Next.js 16
- Tailwind CSS
- Gemini API (已有 GEMINI_API_KEY)
- GitHub REST API (star 历史)
