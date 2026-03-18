import fs from "node:fs/promises";
import path from "node:path";

const cnPath = path.resolve("translation/zh-CN/batches/batch-02.json");
const hkPath = path.resolve("translation/zh-HK/batches/batch-02.json");

const cnMap = {
  "podcasts/aishwarya-naresh-reganti--kiriti-badam.md": {
    title: "Aishwarya Naresh Reganti + Kiriti Badam：AI 产品为何必须有可执行的反馈闭环",
    summary: "如果把一群一线实践者聚在一起问：AI 产品是否必须建立可执行的反馈闭环？几乎所有人都会点头同意。本期围绕 AI 产品实践、产品设计与团队领导力展开。",
    subtitle: "",
    guest: "Aishwarya Naresh Reganti + Kiriti Badam",
  },
  "podcasts/molly-graham.md": {
    title: "高增长手册：Molly Graham 如何带队穿越混乱、变化与规模化",
    summary: "Molly Graham 曾与科技行业多位高效领导者共事，包括 Mark Zuckerberg、Sheryl Sandberg、Chamath Palihapitiya 和 Bret Taylor。如今她领导 Glue Club，帮助管理者在快速扩张、增长与变化中稳住组织与节奏。",
    subtitle: "",
    guest: "Molly Graham",
  },
  "podcasts/jason-m-lemkin.md": {
    title: "我们用 20 个 AI 代理替换销售团队后，发生了什么 | Jason Lemkin（SaaStr）",
    summary: "我们用 20 个 AI 代理替换销售团队后，组织与流程发生了哪些变化？本期聚焦 B2B 产品、创业搭建与团队领导力。",
    subtitle: "",
    guest: "Jason M Lemkin",
  },
  "podcasts/matt-macinnis.md": {
    title: "每位管理者都该听到的 10 条反常识领导真相 | Matt MacInnis（Rippling）",
    summary: "Matt MacInnis 是 Rippling 的首席产品官，曾长期担任 COO。Rippling 是一家估值超过 160 亿美元的一体化劳动力管理平台。",
    subtitle: "",
    guest: "Matt MacInnis",
  },
  "podcasts/elena-verna-40.md": {
    title: "Elena Verna 4.0：增长负责人如何把 KPI 做得更“可爱”",
    summary: "谁能想到，传统上以数据、指标、表格和 KPI 见长的增长负责人，也会追问“我们怎样把产品做得更让人喜欢？”本期讨论增长系统、产品设计与定价决策。",
    subtitle: "",
    guest: "Elena Verna 4.0",
  },
  "newsletters/how-to-build-your-pm-second-brain-with-chatgpt.md": {
    title: "如何用 ChatGPT 搭建你的 PM 第二大脑",
    summary: "",
    subtitle: "让 AI 放大你的产品能力，而不是取代你",
    guest: "",
  },
  "newsletters/how-to-spot-a-top-1-startup-early.md": {
    title: "如何尽早识别顶尖 1% 创业公司",
    summary: "",
    subtitle: "来自多次提前押中标志性公司的投资人与操盘者的三条关键经验",
    guest: "",
  },
  "podcasts/edwin-chen.md": {
    title: "从 100 人 AI 实验室到 Anthropic 与 Google 的秘密武器 | Edwin Chen（Surge AI）",
    summary: "Edwin Chen 是 Surge AI 创始人兼 CEO。Surge AI 通过高质量数据、环境与评测体系，帮助前沿实验室教会 AI 分辨“好与坏”。这家公司在完全自举、员工不足 100 人的情况下，去年营收突破 10 亿美元，创下历史最快纪录。",
    subtitle: "",
    guest: "Edwin Chen",
  },
  "podcasts/tomer-cohen.md": {
    title: "为什么 LinkedIn 正把 PM 变成 AI 驱动的“全栈构建者” | Tomer Cohen（LinkedIn CPO）",
    summary: "为什么 LinkedIn 正把 PM 变成 AI 驱动的“全栈构建者”？本期覆盖产品设计、团队领导与 AI 产品实践。",
    subtitle: "",
    guest: "Tomer Cohen",
  },
  "newsletters/a-year-free-of-posthog-16500-value-the-all-in-one-analytics-experimentation-feat.md": {
    title: "免费使用 PostHog 一整年（价值 16,500 美元）：一体化分析、实验、功能开关、问卷、会话回放、错误追踪、数据仓库与 LLM 分析平台",
    summary: "",
    subtitle: "你在其他地方找不到的专属优惠，让 Product Pass 总价值超过 25,000 美元",
    guest: "",
  },
  "podcasts/jeanne-grosser.md": {
    title: "2026 年，世界级 GTM 团队长什么样 | Jeanne DeWitt Grosser（Vercel、Stripe、Google）",
    summary: "Jeanne DeWitt Grosser 曾在 Stripe、Google 和 Vercel 打造世界级 GTM 团队。她在 Vercel 担任 COO，负责市场、销售、客户成功、营收运营与现场工程；她也从零重塑过 Stripe 早期销售体系，并长期为创始人提供 GTM 策略建议。",
    subtitle: "",
    guest: "Jeanne Grosser",
  },
  "podcasts/rachel-lockett.md": {
    title: "困难对话、高信任团队与理想人生设计指南 | Rachel Lockett",
    summary: "一份关于如何开展困难对话、打造高信任团队、并设计自己热爱生活的实战指南。本期涵盖团队领导、产品设计与消费产品。",
    subtitle: "",
    guest: "Rachel Lockett",
  },
  "podcasts/stewart-butterfield.md": {
    title: "Slack 创始人：打造“用户真心喜欢”产品的思维模型 | Stewart Butterfield",
    summary: "和 Stewart Butterfield 一起拆解打造用户喜爱产品的核心思维模型，涵盖产品设计、B2B 产品与消费产品。",
    subtitle: "",
    guest: "Stewart Butterfield",
  },
  "newsletters/a-holiday-gift-guide-for-tech-people-with-taste.md": {
    title: "给有品位科技人的节日礼物指南",
    summary: "",
    subtitle: "拒绝凑数推荐，这份清单只留好东西",
    guest: "",
  },
  "podcasts/dr-fei-fei-li.md": {
    title: "AI 教母谈就业、机器人，以及为何“世界模型”是下一站 | 李飞飞博士",
    summary: "从就业到机器人，再到下一代世界模型。本期围绕 AI 产品实践、产品设计与消费产品展开。",
    subtitle: "",
    guest: "Dr. Fei Fei Li",
  },
  "podcasts/grant-lee.md": {
    title: "从“我听过最蠢的想法”到 1 亿美元 ARR：Gamma 崛起内幕 | Grant Lee（CEO）",
    summary: "拆解 Gamma 如何一路增长至 1 亿美元 ARR，重点讨论战略决策、产品设计与增长系统。",
    subtitle: "",
    guest: "Grant Lee",
  },
  "newsletters/ecosystem-is-the-next-big-growth-channel.md": {
    title: "生态系统将成为下一个核心增长渠道",
    summary: "",
    subtitle: "如何在嘈杂竞争中脱颖而出：借助已经触达并赢得目标用户信任的合作伙伴",
    guest: "",
  },
};

const hkMap = {
  "podcasts/aishwarya-naresh-reganti--kiriti-badam.md": {
    title: "Aishwarya Naresh Reganti + Kiriti Badam：AI 產品為何必須有可執行的回饋閉環",
    summary: "如果把一群一線實踐者聚在一起問：AI 產品是否必須建立可執行的回饋閉環？幾乎所有人都會點頭同意。本集聚焦 AI 產品實戰、產品設計與團隊領導力。",
    subtitle: "",
    guest: "Aishwarya Naresh Reganti + Kiriti Badam",
  },
  "podcasts/molly-graham.md": {
    title: "高增長手冊：Molly Graham 如何帶隊穿越混亂、變化與規模化",
    summary: "Molly Graham 曾與科技行業多位高效領導者共事，包括 Mark Zuckerberg、Sheryl Sandberg、Chamath Palihapitiya 與 Bret Taylor。如今她帶領 Glue Club，協助管理者在快速擴張、增長與變化中穩住組織與節奏。",
    subtitle: "",
    guest: "Molly Graham",
  },
  "podcasts/jason-m-lemkin.md": {
    title: "我們用 20 個 AI 代理取代銷售團隊後，發生了什麼 | Jason Lemkin（SaaStr）",
    summary: "我們用 20 個 AI 代理取代銷售團隊後，組織與流程發生了哪些變化？本集聚焦 B2B 產品、創業搭建與團隊領導力。",
    subtitle: "",
    guest: "Jason M Lemkin",
  },
  "podcasts/matt-macinnis.md": {
    title: "每位管理者都該聽到的 10 條反常識領導真相 | Matt MacInnis（Rippling）",
    summary: "Matt MacInnis 是 Rippling 的首席產品官，曾長期擔任 COO。Rippling 是一家估值超過 160 億美元的一體化勞動力管理平台。",
    subtitle: "",
    guest: "Matt MacInnis",
  },
  "podcasts/elena-verna-40.md": {
    title: "Elena Verna 4.0：增長負責人如何把 KPI 做得更「可愛」",
    summary: "誰能想到，傳統上以數據、指標、表格和 KPI 見長的增長負責人，也會追問「我們怎樣把產品做得更讓人喜歡？」本集討論增長系統、產品設計與定價決策。",
    subtitle: "",
    guest: "Elena Verna 4.0",
  },
  "newsletters/how-to-build-your-pm-second-brain-with-chatgpt.md": {
    title: "如何用 ChatGPT 搭建你的 PM 第二大腦",
    summary: "",
    subtitle: "讓 AI 放大你的產品能力，而不是取代你",
    guest: "",
  },
  "newsletters/how-to-spot-a-top-1-startup-early.md": {
    title: "如何及早識別頂尖 1% 創業公司",
    summary: "",
    subtitle: "來自多次提前押中標誌性公司的投資人與操盤者的三條關鍵經驗",
    guest: "",
  },
  "podcasts/edwin-chen.md": {
    title: "從 100 人 AI 實驗室到 Anthropic 與 Google 的秘密武器 | Edwin Chen（Surge AI）",
    summary: "Edwin Chen 是 Surge AI 創辦人兼 CEO。Surge AI 透過高品質數據、環境與評測體系，協助前沿實驗室教會 AI 分辨「好與壞」。這家公司在完全自舉、員工不足 100 人的情況下，去年營收突破 10 億美元，創下歷史最快紀錄。",
    subtitle: "",
    guest: "Edwin Chen",
  },
  "podcasts/tomer-cohen.md": {
    title: "為什麼 LinkedIn 正把 PM 變成 AI 驅動的「全棧構建者」 | Tomer Cohen（LinkedIn CPO）",
    summary: "為什麼 LinkedIn 正把 PM 變成 AI 驅動的「全棧構建者」？本集涵蓋產品設計、團隊領導與 AI 產品實戰。",
    subtitle: "",
    guest: "Tomer Cohen",
  },
  "newsletters/a-year-free-of-posthog-16500-value-the-all-in-one-analytics-experimentation-feat.md": {
    title: "免費使用 PostHog 一整年（價值 16,500 美元）：一體化分析、實驗、功能開關、問卷、會話回放、錯誤追蹤、數據倉庫與 LLM 分析平台",
    summary: "",
    subtitle: "你在其他地方找不到的專屬優惠，讓 Product Pass 總價值超過 25,000 美元",
    guest: "",
  },
  "podcasts/jeanne-grosser.md": {
    title: "2026 年，世界級 GTM 團隊長什麼樣 | Jeanne DeWitt Grosser（Vercel、Stripe、Google）",
    summary: "Jeanne DeWitt Grosser 曾在 Stripe、Google 與 Vercel 打造世界級 GTM 團隊。她在 Vercel 擔任 COO，負責市場、銷售、客戶成功、營收營運與現場工程；她也從零重塑過 Stripe 早期銷售體系，並長期為創辦人提供 GTM 策略建議。",
    subtitle: "",
    guest: "Jeanne Grosser",
  },
  "podcasts/rachel-lockett.md": {
    title: "困難對話、高信任團隊與理想人生設計指南 | Rachel Lockett",
    summary: "一份關於如何展開困難對話、打造高信任團隊，並設計自己熱愛生活的實戰指南。本集涵蓋團隊領導、產品設計與消費產品。",
    subtitle: "",
    guest: "Rachel Lockett",
  },
  "podcasts/stewart-butterfield.md": {
    title: "Slack 創辦人：打造「用戶真心喜歡」產品的思維模型 | Stewart Butterfield",
    summary: "與 Stewart Butterfield 一起拆解打造用戶喜愛產品的核心思維模型，涵蓋產品設計、B2B 產品與消費產品。",
    subtitle: "",
    guest: "Stewart Butterfield",
  },
  "newsletters/a-holiday-gift-guide-for-tech-people-with-taste.md": {
    title: "給有品味科技人的節日禮物指南",
    summary: "",
    subtitle: "拒絕湊數推薦，這份清單只留好東西",
    guest: "",
  },
  "podcasts/dr-fei-fei-li.md": {
    title: "AI 教母談就業、機械人，以及為何「世界模型」是下一站 | 李飛飛博士",
    summary: "從就業到機械人，再到下一代世界模型。本集圍繞 AI 產品實戰、產品設計與消費產品展開。",
    subtitle: "",
    guest: "Dr. Fei Fei Li",
  },
  "podcasts/grant-lee.md": {
    title: "從「我聽過最蠢的想法」到 1 億美元 ARR：Gamma 崛起內幕 | Grant Lee（CEO）",
    summary: "拆解 Gamma 如何一路增長至 1 億美元 ARR，重點討論策略決策、產品設計與增長系統。",
    subtitle: "",
    guest: "Grant Lee",
  },
  "newsletters/ecosystem-is-the-next-big-growth-channel.md": {
    title: "生態系統將成為下一個核心增長渠道",
    summary: "",
    subtitle: "如何在嘈雜競爭中脫穎而出：借助已經觸達並贏得目標用戶信任的合作夥伴",
    guest: "",
  },
};

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw.replace(/^\uFEFF/, ""));
}

async function writeJson(filePath, payload) {
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function applyMap(payload, map) {
  for (const doc of payload.docs ?? []) {
    const translated = map[doc.filename];
    if (!translated) {
      continue;
    }
    doc.translated = {
      title: translated.title ?? "",
      summary: translated.summary ?? "",
      subtitle: translated.subtitle ?? "",
      guest: translated.guest ?? "",
    };
    doc.status = "done";
  }
}

async function main() {
  const cn = await readJson(cnPath);
  const hk = await readJson(hkPath);
  applyMap(cn, cnMap);
  applyMap(hk, hkMap);
  await writeJson(cnPath, cn);
  await writeJson(hkPath, hk);
  console.log("Applied batch-02 translations for zh-CN and zh-HK.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
