export interface ReportSection {
  id: string;
  title: string;
  prompt: string;  // AI prompt hint for this section
  level: number;   // 1 = main heading, 2 = subheading, 3 = sub-subheading
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  scenario: string;
  sections: ReportSection[];
}

export const reportTemplates: Record<string, ReportTemplate> = {
  industry: {
    id: "industry",
    name: "行业分析报告",
    description: "市场规模、竞争格局，发展趋势",
    scenario: "行业研究，投资分析、市场调研",
    sections: [
      { id: "executive-summary", title: "执行摘要", prompt: "概括报告核心结论和主要建议", level: 1 },
      { id: "industry-background", title: "行业背景", prompt: "行业定义，发展历史、政策环境", level: 1 },
      { id: "market-status", title: "市场现状", prompt: "市场规模、市场结构、主要参与者", level: 1 },
      { id: "competition", title: "竞争格局", prompt: "竞争态势、主要竞争对手、市场份额", level: 1 },
      { id: "trends", title: "发展趋势", prompt: "技术趋势、消费趋势、政策走向", level: 1 },
      { id: "investment", title: "投资建议", prompt: "投资机会、投资风险、进入时机", level: 1 },
      { id: "risks", title: "风险提示", prompt: "市场风险、政策风险、技术风险", level: 1 },
      { id: "appendix", title: "附录", prompt: "数据来源、参考资料、方法说明", level: 1 },
    ],
  },
  project: {
    id: "project",
    name: "项目总结报告",
    description: "项目回顾、成果展示、经验教训",
    scenario: "项目管理、复盘总结、成果汇报",
    sections: [
      { id: "executive-summary", title: "执行摘要", prompt: "项目核心成果和关键指标", level: 1 },
      { id: "project-overview", title: "项目概述", prompt: "项目背景、项目目标、项目范围", level: 1 },
      { id: "goals-scope", title: "目标与范围", prompt: "主要目标、里程碑、交付物", level: 1 },
      { id: "implementation", title: "实施过程", prompt: "主要阶段、关键决策、资源投入", level: 1 },
      { id: "achievements", title: "成果展示", prompt: "完成情况、核心成果、KPIs达成", level: 1 },
      { id: "lessons", title: "经验教训", prompt: "成功因素、改进空间、风险应对", level: 1 },
      { id: "recommendations", title: "后续建议", prompt: "下一步行动、持续改进方向", level: 1 },
      { id: "appendix", title: "附录", prompt: "详细数据、会议记录、参考资料", level: 1 },
    ],
  },
  market: {
    id: "market",
    name: "市场调研报告",
    description: "消费者洞察、需求分析、市场机会",
    scenario: "市场研究、用户调研、机会识别",
    sections: [
      { id: "executive-summary", title: "执行摘要", prompt: "调研核心发现和主要结论", level: 1 },
      { id: "research-background", title: "调研背景", prompt: "调研目的、调研范围、调研方法", level: 1 },
      { id: "methodology", title: "调研方法", prompt: "样本设计、数据收集、分析方法", level: 1 },
      { id: "consumer-insights", title: "消费者洞察", prompt: "用户画像、消费行为、偏好特征", level: 1 },
      { id: "demand-analysis", title: "需求分析", prompt: "核心需求、潜在需求、未满足需求", level: 1 },
      { id: "market-opportunity", title: "市场机会", prompt: "机会点、竞争空白、可行性", level: 1 },
      { id: "marketing-suggestions", title: "营销建议", prompt: "定位策略、渠道建议、推广方案", level: 1 },
      { id: "appendix", title: "附录", prompt: "调研问卷、原始数据、交叉分析表", level: 1 },
    ],
  },
};
