// 言纹 FLIP · 16 型说话人格
// 每个维度的两极：L线性/S发散 · W热烈/C克制 · P精确/V模糊 · T模板/O原创

export interface YanwenType {
  /** 中文名 */
  name: string;
  /** 介绍 */
  desc: string;
}

const personalityTypes: Record<string, YanwenType> = {
  LCPT: { name: "AI 分身型", desc: "四维全中 AI 偏好：线性、克制、精确、模板。表达高效得体，却最容易被 AI 原样复刻。" },
  LCPO: { name: "学者型", desc: "冷静严谨的独立思考者，逻辑精确却用词独到，自带一套术语体系。" },
  LCVT: { name: "客服型", desc: "得体周到的模板化表达者，结构清楚、语气礼貌，服务型沟通的典范。" },
  LWPT: { name: "主播型", desc: "热情且条理清晰，感染力强，但话术工整、容易被 AI 学走。" },
  SCPT: { name: "弹幕科普型", desc: "克制又跳跃，用流行梗快速输出硬知识，弹幕体质。" },
  LCVO: { name: "禅师型", desc: "平静、模糊、却字字原创，用最少的话点到要害。" },
  LWPO: { name: "演说家型", desc: "有激情的逻辑布道者，能把复杂道理讲得让人热血沸腾。" },
  LWVT: { name: "朋友圈情绪型", desc: "结构清晰、情绪外放，长文案小作文体质，真诚但套路可见。" },
  SCPO: { name: "冷面笑匠型", desc: "发散但克制、精确又原创，冷不丁一句精准吐槽，反差拉满。" },
  SCVT: { name: "佛系冲浪型", desc: "冷静模糊的模板党，「哈哈哈确实」式的佛系网民。" },
  SWPT: { name: "知识区 UP 主型", desc: "热情跳跃的科普者，信息精准但爱用流行梗，把硬知识讲得生动。" },
  LWVO: { name: "诗人演说型", desc: "逻辑在线却偏爱意象与留白，情绪真挚，像能把「那种感觉」讲清楚的诗人。" },
  SCVO: { name: "神秘主义者型", desc: "冷峻、模糊、原创，像总说「你以后会懂」的神秘角色。" },
  SWPO: { name: "脱口秀型", desc: "发散、热烈、精确、原创，包袱抖得准又出其不意，笑点密度极高。" },
  SWVT: { name: "话痨型", desc: "跳跃、热烈、模糊、爱用现成梗，滔滔不绝的快乐话痨。" },
  SWVO: { name: "灵感艺术家型", desc: "四维全为人类特质：发散、热烈、模糊、原创。天马行空、独一无二，AI 最难模仿。" },
};

export default personalityTypes;