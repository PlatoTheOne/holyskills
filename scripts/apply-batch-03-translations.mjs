import fs from "node:fs/promises";
import path from "node:path";

const cnPath = path.resolve("translation/zh-CN/batches/batch-03.json");
const hkPath = path.resolve("translation/zh-HK/batches/batch-03.json");

const cnMap = {
  "podcasts/jen-abel.md": {
    title: "“卖 alpha，不卖功能”：从 100 万到 1000 万 ARR 的企业销售打法 | Jen Abel",
    summary: "Jen Abel 现任 State Affairs 企业业务 GM，并联合创办 Jellyfish，专门帮助创始人学习 0 到 1 的企业销售。她是我见过最懂企业销售学习路径的人之一；这期是继两年前那次（聚焦 0 到 100 万 ARR）之后的进阶对谈。",
    subtitle: "",
    guest: "Jen Abel",
  },
  "newsletters/part-2-of-how-to-get-the-most-out-of-your-product-pass-and-welcome-stripe-atlas.md": {
    title: "如何把 Product Pass 用到极致（第 2 部分）——欢迎 Stripe Atlas 加入礼包",
    summary: "",
    subtitle: "付费订阅用户可使用 17+ 款高级产品，这里是把权益用满的实操建议",
    guest: "",
  },
  "podcasts/melanie-perkins.md": {
    title: "Canva 背后的女人：Melanie Perkins 如何从零打造 420 亿美元公司",
    summary: "Canva 背后的创始人 Melanie Perkins 分享她如何从零起步打造 420 亿美元公司，涵盖产品设计、战略决策与创业构建。",
    subtitle: "",
    guest: "Melanie Perkins",
  },
  "newsletters/a-builders-guide-to-living-a-long-and-healthy-life.md": {
    title: "Builder 的长寿与健康生活指南",
    summary: "",
    subtitle: "来点不一样的内容",
    guest: "",
  },
  "podcasts/dhanji-r-prasanna.md": {
    title: "Block 如何成为全球最 AI-native 的企业之一 | Dhanji R. Prasanna",
    summary: "Dhanji R. Prasanna 是 Block（原 Square）CTO，过去两年管理超过 4,000 名工程师。在他的领导下，Block 正成为全球最具 AI-native 基因的大型公司之一。",
    subtitle: "",
    guest: "Dhanji R. Prasanna",
  },
  "podcasts/chip-huyen.md": {
    title: "Chip Huyen 的 AI Engineering 101（Nvidia、Stanford、Netflix）",
    summary: "和 Chip Huyen 一起入门 AI 工程：从方法到落地，聚焦 AI 产品实践、产品设计与工程权衡。",
    subtitle: "",
    guest: "Chip Huyen",
  },
  "podcasts/nicole-forsgren.md": {
    title: "2025 年如何衡量 AI 时代开发者生产力 | Nicole Forsgren",
    summary: "Nicole Forsgren 创建了最广泛使用的开发者生产力框架 DORA 与 SPACE，著有奠基之作《Accelerate》，并即将发布新书《Frictionless》，提供帮助团队在 AI 时代更快协作的实用方法。",
    subtitle: "",
    guest: "Nicole Forsgren",
  },
  "newsletters/everyone-should-be-using-claude-code-more.md": {
    title: "每个人都应该更频繁地使用 Claude Code",
    summary: "",
    subtitle: "如何上手，以及 50 种非技术人把 Claude Code 用进工作与生活的方法",
    guest: "",
  },
  "podcasts/robby-stein.md": {
    title: "Google AI 反击战内幕：AI Mode 崛起、AI Overviews 策略与 AI 搜索愿景 | Robby Stein（Google Search 产品副总裁）",
    summary: "Robby Stein 是 Google 产品副总裁，负责 Google Search 核心产品，包括全新 AI Overviews、AI Mode、搜索排序、Google Lens 等。",
    subtitle: "",
    guest: "Robby Stein",
  },
  "podcasts/jason-droege.md": {
    title: "Scale AI CEO 首访：140 亿美元 Meta 交易、企业 AI 落地现状与前沿实验室下一步 | Jason Droege",
    summary: "Jason Droege 是 Scale AI CEO。Scale AI 为几乎所有主要 AI 实验室提供基础训练数据。他曾与 Travis Kalanick 联合创办 Scour，并将 Uber Eats 从一个想法做到 200 亿美元营收规模。",
    subtitle: "",
    guest: "Jason Droege",
  },
  "newsletters/a-free-year-of-devin-the-worlds-most-advanced-autonomous-ai-software-engineer.md": {
    title: "免费领取一整年 Devin：全球最先进的自主 AI 软件工程师",
    summary: "",
    subtitle: "Insider 订阅现在额外包含每年 1,350 美元的 Devin 权益，另有 15+ 款高级产品，外加你打造世界级产品与职业所需的方法、社群与工具。",
    guest: "",
  },
  "podcasts/albert-cheng.md": {
    title: "如何在你的产品里找到隐藏增长机会 | Albert Cheng（Duolingo、Grammarly、Chess.com）",
    summary: "如何发现产品中的隐藏增长机会，本期聚焦增长系统、数据度量与分析，以及产品设计。",
    subtitle: "",
    guest: "Albert Cheng",
  },
  "newsletters/introducing-the-gain-framework-for-feedback-an-evidence-based-approach-to-giving.md": {
    title: "介绍 GAIN 反馈框架：一套有证据支撑、让人愿意听也愿意行动的反馈方法",
    summary: "",
    subtitle: "一步步教你写出“你愿意给、别人也愿意收”的高质量反馈",
    guest: "",
  },
  "podcasts/ravi-mehta.md": {
    title: "更好 AI 原型的秘密：为什么 Tinder 的 CPO 先写 JSON，而不是先做设计 | Ravi Mehta（产品顾问，前 Reforge EIR）",
    summary: "为什么 Tinder 的 CPO 会先从 JSON 开始而不是从设计稿开始？本期覆盖团队领导、创业搭建与产品设计。",
    subtitle: "",
    guest: "Ravi Mehta",
  },
  "podcasts/hamel-husain--shreya-shankar.md": {
    title: "为什么 AI Eval 成为产品构建者最热门的新技能 | Hamel Husain 与 Shreya Shankar（排名第 1 的 Eval 课程作者）",
    summary: "为什么 AI Eval 正成为产品构建者最热门的新技能，本期涵盖 AI 产品实践、产品设计与度量分析。",
    subtitle: "",
    guest: "Hamel Husain & Shreya Shankar",
  },
  "newsletters/how-to-get-the-most-out-of-your-product-pass-part-1.md": {
    title: "如何把 Product Pass 用到极致（第 1 部分）",
    summary: "",
    subtitle: "付费订阅用户可使用 15+ 款高级产品，这里是把权益用满的实操建议",
    guest: "",
  },
  "podcasts/brendan-foody.md": {
    title: "为什么“专家写 AI Eval”正在催生史上增长最快的公司 | Brendan Foody（Mercor CEO）",
    summary: "为什么由领域专家撰写 AI Eval 会催生史上增长最快的公司？本期覆盖 AI 产品实践、产品设计与战略决策。",
    subtitle: "",
    guest: "Brendan Foody",
  },
  "podcasts/ethan-smith.md": {
    title: "AEO 终极指南：如何让 ChatGPT 主动推荐你的产品 | Ethan Smith（Graphite）",
    summary: "如何让 ChatGPT 推荐你的产品，本期涵盖 AI 产品实践、产品设计与可落地的产品方法。",
    subtitle: "",
    guest: "Ethan Smith",
  },
  "podcasts/ben-horowitz.md": {
    title: "Ben Horowitz 的 460 亿美元硬真相：创始人为何失败，以及为什么你要迎着恐惧前进（a16z 联合创始人）",
    summary: "为什么创始人会失败，以及为何你必须迎着恐惧前进。本期聚焦团队领导、产品设计，以及产品战略与执行。",
    subtitle: "",
    guest: "Ben Horowitz",
  },
};

const hkMap = {
  "podcasts/jen-abel.md": {
    title: "「賣 alpha，不賣功能」：從 100 萬到 1000 萬 ARR 的企業銷售打法 | Jen Abel",
    summary: "Jen Abel 現任 State Affairs 企業業務 GM，並共同創辦 Jellyfish，專門協助創辦人學習 0 到 1 的企業銷售。她是我見過最懂企業銷售學習路徑的人之一；這期是繼兩年前那次（聚焦 0 到 100 萬 ARR）後的進階對談。",
    subtitle: "",
    guest: "Jen Abel",
  },
  "newsletters/part-2-of-how-to-get-the-most-out-of-your-product-pass-and-welcome-stripe-atlas.md": {
    title: "如何把 Product Pass 用到極致（第 2 部分）——歡迎 Stripe Atlas 加入禮包",
    summary: "",
    subtitle: "付費訂閱用戶可使用 17+ 款高級產品，這裡是把權益用滿的實操建議",
    guest: "",
  },
  "podcasts/melanie-perkins.md": {
    title: "Canva 背後的女人：Melanie Perkins 如何從零打造 420 億美元公司",
    summary: "Canva 背後的創辦人 Melanie Perkins 分享她如何從零起步打造 420 億美元公司，涵蓋產品設計、策略決策與創業搭建。",
    subtitle: "",
    guest: "Melanie Perkins",
  },
  "newsletters/a-builders-guide-to-living-a-long-and-healthy-life.md": {
    title: "Builder 的長壽與健康生活指南",
    summary: "",
    subtitle: "來點不一樣的內容",
    guest: "",
  },
  "podcasts/dhanji-r-prasanna.md": {
    title: "Block 如何成為全球最 AI-native 的企業之一 | Dhanji R. Prasanna",
    summary: "Dhanji R. Prasanna 是 Block（原 Square）CTO，過去兩年管理超過 4,000 名工程師。在他的領導下，Block 正成為全球最具 AI-native 基因的大型公司之一。",
    subtitle: "",
    guest: "Dhanji R. Prasanna",
  },
  "podcasts/chip-huyen.md": {
    title: "Chip Huyen 的 AI Engineering 101（Nvidia、Stanford、Netflix）",
    summary: "與 Chip Huyen 一起入門 AI 工程：從方法到落地，聚焦 AI 產品實戰、產品設計與工程取捨。",
    subtitle: "",
    guest: "Chip Huyen",
  },
  "podcasts/nicole-forsgren.md": {
    title: "2025 年如何衡量 AI 時代開發者生產力 | Nicole Forsgren",
    summary: "Nicole Forsgren 建立了最廣泛使用的開發者生產力框架 DORA 與 SPACE，著有奠基之作《Accelerate》，並即將發布新書《Frictionless》，提供協助團隊在 AI 時代更快協作的實用方法。",
    subtitle: "",
    guest: "Nicole Forsgren",
  },
  "newsletters/everyone-should-be-using-claude-code-more.md": {
    title: "每個人都應該更頻繁地使用 Claude Code",
    summary: "",
    subtitle: "如何上手，以及 50 種非技術人士把 Claude Code 用進工作與生活的方法",
    guest: "",
  },
  "podcasts/robby-stein.md": {
    title: "Google AI 反擊戰內幕：AI Mode 崛起、AI Overviews 策略與 AI 搜尋願景 | Robby Stein（Google Search 產品副總裁）",
    summary: "Robby Stein 是 Google 產品副總裁，負責 Google Search 核心產品，包括全新 AI Overviews、AI Mode、搜尋排序、Google Lens 等。",
    subtitle: "",
    guest: "Robby Stein",
  },
  "podcasts/jason-droege.md": {
    title: "Scale AI CEO 首訪：140 億美元 Meta 交易、企業 AI 落地現況與前沿實驗室下一步 | Jason Droege",
    summary: "Jason Droege 是 Scale AI CEO。Scale AI 為幾乎所有主要 AI 實驗室提供基礎訓練數據。他曾與 Travis Kalanick 共同創辦 Scour，並把 Uber Eats 從一個想法做到 200 億美元營收規模。",
    subtitle: "",
    guest: "Jason Droege",
  },
  "newsletters/a-free-year-of-devin-the-worlds-most-advanced-autonomous-ai-software-engineer.md": {
    title: "免費領取一整年 Devin：全球最先進的自主 AI 軟件工程師",
    summary: "",
    subtitle: "Insider 訂閱現已額外包含每年 1,350 美元的 Devin 權益，另有 15+ 款高級產品，加上你打造世界級產品與職涯所需的方法、社群與工具。",
    guest: "",
  },
  "podcasts/albert-cheng.md": {
    title: "如何在你的產品裡找到隱藏增長機會 | Albert Cheng（Duolingo、Grammarly、Chess.com）",
    summary: "如何發現產品中的隱藏增長機會，本集聚焦增長系統、數據度量與分析，以及產品設計。",
    subtitle: "",
    guest: "Albert Cheng",
  },
  "newsletters/introducing-the-gain-framework-for-feedback-an-evidence-based-approach-to-giving.md": {
    title: "介紹 GAIN 反饋框架：一套有證據支持、讓人願意聽也願意行動的反饋方法",
    summary: "",
    subtitle: "一步步教你寫出「你願意給、別人也願意收」的高質量反饋",
    guest: "",
  },
  "podcasts/ravi-mehta.md": {
    title: "更好 AI 原型的秘密：為什麼 Tinder 的 CPO 先寫 JSON，而不是先做設計 | Ravi Mehta（產品顧問，前 Reforge EIR）",
    summary: "為什麼 Tinder 的 CPO 會先從 JSON 開始而不是從設計稿開始？本集涵蓋團隊領導、創業搭建與產品設計。",
    subtitle: "",
    guest: "Ravi Mehta",
  },
  "podcasts/hamel-husain--shreya-shankar.md": {
    title: "為什麼 AI Eval 成為產品構建者最熱門的新技能 | Hamel Husain 與 Shreya Shankar（排名第 1 的 Eval 課程作者）",
    summary: "為什麼 AI Eval 正成為產品構建者最熱門的新技能，本集涵蓋 AI 產品實戰、產品設計與度量分析。",
    subtitle: "",
    guest: "Hamel Husain & Shreya Shankar",
  },
  "newsletters/how-to-get-the-most-out-of-your-product-pass-part-1.md": {
    title: "如何把 Product Pass 用到極致（第 1 部分）",
    summary: "",
    subtitle: "付費訂閱用戶可使用 15+ 款高級產品，這裡是把權益用滿的實操建議",
    guest: "",
  },
  "podcasts/brendan-foody.md": {
    title: "為什麼「專家寫 AI Eval」正在催生史上增長最快的公司 | Brendan Foody（Mercor CEO）",
    summary: "為什麼由領域專家撰寫 AI Eval 會催生史上增長最快的公司？本集涵蓋 AI 產品實戰、產品設計與策略決策。",
    subtitle: "",
    guest: "Brendan Foody",
  },
  "podcasts/ethan-smith.md": {
    title: "AEO 終極指南：如何讓 ChatGPT 主動推薦你的產品 | Ethan Smith（Graphite）",
    summary: "如何讓 ChatGPT 推薦你的產品，本集涵蓋 AI 產品實戰、產品設計與可落地的產品方法。",
    subtitle: "",
    guest: "Ethan Smith",
  },
  "podcasts/ben-horowitz.md": {
    title: "Ben Horowitz 的 460 億美元硬真相：創辦人為何失敗，以及為什麼你要迎著恐懼前進（a16z 聯合創辦人）",
    summary: "為什麼創辦人會失敗，以及為何你必須迎著恐懼前進。本集聚焦團隊領導、產品設計，以及產品策略與執行。",
    subtitle: "",
    guest: "Ben Horowitz",
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
  console.log("Applied batch-03 translations for zh-CN and zh-HK.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
