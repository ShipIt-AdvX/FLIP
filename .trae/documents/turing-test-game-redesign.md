# 图灵测试玩法改造计划

## Context

用户希望将作品从"言纹 FLIP 人格分析"改造为**图灵测试**玩法，作品更名为"你是人类吗？"。同时去除所有 emoji，保持黑白灰高级淡雅的视觉风格。

**核心玩法**：
1. 第一关：hCaptcha 人机验证（已有）
2. 第二关：图灵测试
   - AI 生成开放式问题
   - 用户和"伪装机器人"各自回答
   - 两个答案匿名打乱后交给"裁判 AI"判断哪个是 AI
   - 不少于 3 轮，用户可主动结束
3. 结果页展示"人类度"分数

---

## 后端改动

### 文件：[core.ts](file:///www/wwwroot/FLIP/packages/backend/src/core.ts)

**新增 3 个 API**（保留原有 profile/circle 接口，废弃 `/api/chat` 和 `/api/judge`）：

#### 1. `POST /api/game/question` — 生成问题
- 请求：`{ round: number, prevQuestions: string[] }`
- 返回：`{ question: string }`
- Prompt 设计：生成开放式、能引发个人化回答的问题（如"描述你最近一次真正开心的时刻"），避免有标准答案的问题

#### 2. `POST /api/game/judge` — 提交答案并判断
- 请求：`{ question: string, userAnswer: string, round: number }`
- 流程：
  1. 用"伪装机器人" prompt（复用原 chat prompt）让 AI 回答同一问题
  2. 随机打乱用户答案和机器人答案，标记为 A/B
  3. 用"裁判" prompt 让另一个 AI 判断哪个是 AI
- 返回：
  ```ts
  {
    botAnswer: string,
    shuffled: [{ label: "A"|"B", text: string, isBot: boolean }],
    judgeResult: {
      aiChoice: "A"|"B",      // 裁判选的
      isUserExposed: boolean,  // 用户是否被识破（裁判选了用户）
      reason: string
    }
  }
  ```

#### 3. `POST /api/game/summary` — 生成总结
- 请求：`{ totalRounds: number, exposedCount: number }`
- 返回：`{ summary: string, humanScore: number }`
- humanScore = round((totalRounds - exposedCount) / totalRounds * 100)

### 文件：[storage.ts](file:///www/wwwroot/FLIP/packages/backend/src/storage.ts)

**Profile 接口调整**（向后兼容，新增字段）：
```ts
interface Profile {
  id: string;
  nickname: string;
  avatar: string;
  wechat?: string;
  email?: string;
  bio?: string;
  // 新增图灵测试字段
  humanScore?: number;      // 0-100
  totalRounds?: number;
  exposedCount?: number;
  summary?: string;
  // 保留旧字段（兼容）
  flipType?: string;
  confidence?: any;
  reason?: string;
  createdAt: number;
}
```

**推荐算法调整**：`getRecommendations` 改为基于 `humanScore` 相近度排序（欧式距离改为绝对值差）。

---

## 前端改动

### 文件：[App.vue](file:///www/wwwroot/FLIP/packages/frontend/src/App.vue)
- 标题改为"你是人类吗？"
- 去除 logo emoji

### 文件：[Home.vue](file:///www/wwwroot/FLIP/packages/frontend/src/pages/Home.vue)
- 标题改为"你是人类吗？"
- 去除所有 emoji（◐ 保留作为几何装饰符号，非 emoji）
- 副文案调整："通过图灵测试，看看 AI 能否识破你"
- 保留 hCaptcha 验证

### 文件：[Chat.vue](file:///www/wwwroot/FLIP/packages/frontend/src/pages/Chat.vue) — 完全重写
**图灵测试游戏页面**，核心结构：
```
┌─ 轮次指示器（第 N 轮 / 至少 3 轮）─┐
├─ 问题卡片（AI 生成的问题）        ├
├─ 答案输入框 + 提交按钮            ├
├─ 结果展示区（提交后显示）：        ├
│   - 两个匿名答案 A / B            │
│   - 裁判判断："我认为 X 是 AI"     │
│   - 揭晓：你被识破了吗？           │
├─ 下一题按钮 / 结束游戏按钮(≥3轮)  ├
```
- 状态管理：`round`, `question`, `userAnswer`, `judgeResult`, `history`
- 至少 3 轮后显示"结束游戏"按钮
- 结束时将历史记录存入 localStorage，跳转 /result

### 文件：[Result.vue](file:///www/wwwroot/FLIP/packages/frontend/src/pages/Result.vue) — 重写
**图灵测试结果页**：
- 调用 `/api/game/summary` 获取总结
- 展示：
  - 总轮数
  - 被识破次数
  - 人类度分数（大数字展示）
  - AI 评语
- 按钮：完善资料、交友圈、再玩一次
- 保存结果到 localStorage 供 Profile 页使用

### 文件：[Profile.vue](file:///www/wwwroot/FLIP/packages/frontend/src/pages/Profile.vue)
- 去除所有 emoji
- `flipType` 展示改为 `humanScore` + 评语
- 保存时携带 humanScore 等新字段

### 文件：[Circle.vue](file:///www/wwwroot/FLIP/packages/frontend/src/pages/Circle.vue)
- 去除所有 emoji
- 动态卡片中的 `flipType` 标签改为"人类度 XX%"
- 推荐区标题文案调整

### 文件：[flip-defines.ts](file:///www/wwwroot/FLIP/packages/frontend/src/flip-defines.ts)
- 新增 `humanScoreText(score)` 函数，根据分数返回评语：
  - 90-100: "真正的人类"
  - 70-89: "人类气息浓厚"
  - 50-69: "半人半机"
  - 0-49: "AI 嫌疑人"

---

## 关键 Prompt 设计

### 伪装机器人 Prompt（复用原 chat prompt）
让 AI 扮演一个真实的人类朋友回答问题，保持自然口语化。

### 裁判 Prompt
```
你是图灵测试的裁判。你会看到同一个问题的两个答案（A 和 B）。
其中一个由人类书写，另一个由 AI 书写。
请判断哪个是 AI 写的，并说明理由。

注意 AI 的典型特征：
- 结构过于工整（首先/其次/最后）
- 用词过于精准或书面化
- 情感表达显得"安全"或"得体"
- 缺乏个人化的细节和独特视角
- 倾向于"全面"而非"片面"

输出 JSON：{"aiChoice": "A"或"B", "reason": "判断理由（50-100字）"}
```

### 问题生成 Prompt
```
生成一个开放式问题，用于图灵测试。
要求：
- 引发个人化回答（经历、感受、观点）
- 没有标准答案
- 避免"你最喜欢的X是什么"这类套路化问题
- 适合让人类和 AI 同时回答

只输出问题本身，不要其他内容。
```

---

## 验证方案

1. **构建前端**：`docker run --rm -v /www/wwwroot/FLIP:/app -w /app node:20-alpine sh -c "cd packages/frontend && npm run build"`
2. **重启后端**：`pm2 restart flip-backend`
3. **浏览器测试流程**：
   - 访问 https://sp.rrvenn.cn/
   - 通过 hCaptcha → 进入游戏页
   - 回答 3 轮问题 → 查看每轮裁判判断
   - 结束游戏 → 查看结果页人类度分数
   - 完善资料 → 保存到交友圈
   - 交友圈页查看推荐
4. **验证无 emoji**：检查所有页面渲染
