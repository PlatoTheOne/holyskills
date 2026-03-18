import fs from "node:fs/promises";
import path from "node:path";

const updates = {
  "podcasts/jenny-wen.md": {
    zhCN: {
      title: "Jenny Wen：设计与工程如何在 AI 时代共同进化",
      summary: "不只是设计师在想“我们得跟上工程师”，连工程师也在想“我们该如何跟上自己”。本期围绕产品设计、AI 产品实践与工程权衡展开。",
      subtitle: "",
      guest: "Jenny Wen",
    },
    zhHK: {
      title: "Jenny Wen：設計與工程如何在 AI 時代共同進化",
      summary: "不只是設計師在想「我們要跟上工程師」，連工程師也在想「我們如何跟上自己」。本集聚焦產品設計、AI 產品實戰與工程取捨。",
      subtitle: "",
      guest: "Jenny Wen",
    },
  },
  "podcasts/jeetu-patel.md": {
    zhCN: {
      title: "Jeetu Patel：如何看懂产业变化，并帮客户真正用好 AI",
      summary: "我们推动这件事的核心目标，是看清行业正在发生什么，并帮助客户把新变化转化为真实价值。内容涵盖 AI 产品实践、团队领导与产品设计。",
      subtitle: "",
      guest: "Jeetu Patel",
    },
    zhHK: {
      title: "Jeetu Patel：如何看懂產業變化，並協助客戶真正用好 AI",
      summary: "我們推動這件事的核心目標，是看清產業正在發生甚麼，並幫助客戶把新變化轉化為實際價值。內容涵蓋 AI 產品實戰、團隊領導與產品設計。",
      subtitle: "",
      guest: "Jeetu Patel",
    },
  },
  "podcasts/boris-cherny.md": {
    zhCN: {
      title: "Boris Cherny：软件开发的下一次范式转移",
      summary: "“这就是现在的世界。”本期探讨软件开发的下一次重大转向：你的团队已经在其中，还是即将进入？重点覆盖工程权衡、产品设计与 AI 产品开发。",
      subtitle: "",
      guest: "Boris Cherny",
    },
    zhHK: {
      title: "Boris Cherny：軟件開發的下一次範式轉移",
      summary: "「這就是現在的世界。」本集討論軟件開發下一個重大轉向：你的團隊已經在其中，還是即將進入？重點涵蓋工程取捨、產品設計與 AI 產品開發。",
      subtitle: "",
      guest: "Boris Cherny",
    },
  },
  "podcasts/brian-halligan.md": {
    zhCN: {
      title: "红杉 CEO 教练：创业从未如此容易，规模化却从未如此困难 | Brian Halligan（HubSpot 联合创始人）",
      summary: "Brian Halligan 是 HubSpot 联合创始人，曾担任约 15 年 CEO。如今他作为红杉内部 CEO 教练，辅导其增长最快的一批创始人。",
      subtitle: "",
      guest: "Brian Halligan",
    },
    zhHK: {
      title: "紅杉 CEO 教練：創業從未如此容易，規模化卻從未如此困難 | Brian Halligan（HubSpot 聯合創辦人）",
      summary: "Brian Halligan 是 HubSpot 聯合創辦人，曾擔任約 15 年 CEO。現時他作為紅杉內部 CEO 教練，輔導其增長最快的一批創辦人。",
      subtitle: "",
      guest: "Brian Halligan",
    },
  },
  "podcasts/sherwin-wu-v2.md": {
    zhCN: {
      title: "Sherwin Wu V2：写出优雅代码之后，真正难的是上线",
      summary: "很多工程师最头疼的，不是写代码，而是把写好的代码稳定地推入生产环境。本期讨论工程权衡、AI 产品实践与团队领导。",
      subtitle: "",
      guest: "Sherwin Wu V2",
    },
    zhHK: {
      title: "Sherwin Wu V2：寫出優雅程式碼後，真正困難的是上線",
      summary: "很多工程師最頭痛的，不是寫程式，而是把寫好的程式穩定推到生產環境。本集討論工程取捨、AI 產品實戰與團隊領導。",
      subtitle: "",
      guest: "Sherwin Wu V2",
    },
  },
  "podcasts/lazar-jovanovic.md": {
    zhCN: {
      title: "职业 Vibe Coder 的崛起（AI 时代的新职业）| Lazar Jovanovic（职业 Vibe Coder）",
      summary: "Lazar Jovanovic 在 Lovable 全职担任职业 Vibe Coder。他没有传统编程背景，却用 AI 同时构建内部工具和面向客户的产品。",
      subtitle: "",
      guest: "Lazar Jovanovic",
    },
    zhHK: {
      title: "職業 Vibe Coder 的崛起（AI 時代的新工種）| Lazar Jovanovic（職業 Vibe Coder）",
      summary: "Lazar Jovanovic 在 Lovable 全職擔任職業 Vibe Coder。他沒有傳統編程背景，卻以 AI 同時建立內部工具與面向客戶的產品。",
      subtitle: "",
      guest: "Lazar Jovanovic",
    },
  },
  "podcasts/dr-becky-kennedy.md": {
    zhCN: {
      title: "儿童心理学家教你如何与难相处的成年人共事 | Becky Kennedy 博士",
      summary: "如何与“难相处”的成年人高效合作。内容聚焦产品设计、团队领导，以及可直接落地的实践经验。",
      subtitle: "",
      guest: "Dr. Becky Kennedy",
    },
    zhHK: {
      title: "兒童心理學家教你如何與難相處的成年人共事 | Becky Kennedy 博士",
      summary: "如何與「難相處」的成年人高效合作。內容聚焦產品設計、團隊領導，以及可直接落地的實戰經驗。",
      subtitle: "",
      guest: "Dr. Becky Kennedy",
    },
  },
  "podcasts/marc-andreessen.md": {
    zhCN: {
      title: "Marc Andreessen：真正的 AI 繁荣才刚刚开始",
      summary: "Marc Andreessen 是创业者与投资人，也是 Netscape 联合创始人及 a16z 联合创始人。本期讨论为何我们正处在历史上极其独特的阶段，以及接下来会发生什么。",
      subtitle: "",
      guest: "Marc Andreessen",
    },
    zhHK: {
      title: "Marc Andreessen：真正的 AI 繁榮其實才剛開始",
      summary: "Marc Andreessen 是創業者與投資人，也是 Netscape 聯合創辦人及 a16z 聯合創辦人。本集討論為何我們正身處歷史上極其獨特的階段，以及接下來會發生甚麼。",
      subtitle: "",
      guest: "Marc Andreessen",
    },
  },
  "podcasts/jason-cohen.md": {
    zhCN: {
      title: "当产品停止增长时，先问这 5 个问题 | Jason Cohen（两家独角兽创始人）",
      summary: "Jason 提出五步诊断框架：Logo 留存、定价、NRR、营销渠道、目标市场，帮助团队快速定位增长停滞的根因。",
      subtitle: "",
      guest: "Jason Cohen",
    },
    zhHK: {
      title: "當產品停止增長時，先問這 5 個問題 | Jason Cohen（兩家獨角獸創辦人）",
      summary: "Jason 提出五步診斷框架：Logo 留存、定價、NRR、行銷渠道、目標市場，協助團隊快速找出增長停滯的根因。",
      subtitle: "",
      guest: "Jason Cohen",
    },
  },
  "podcasts/zevi-arnovitz.md": {
    zhCN: {
      title: "非技术 PM 的 Cursor 实战指南 | Zevi Arnovitz（Meta）",
      summary: "这是一套完整的 AI 工作流，帮助非技术背景的人也能在 Cursor 中构建真实可用的产品。",
      subtitle: "",
      guest: "Zevi Arnovitz",
    },
    zhHK: {
      title: "非技術 PM 的 Cursor 實戰指南 | Zevi Arnovitz（Meta）",
      summary: "這是一套完整的 AI 工作流，幫助非技術背景的人也能在 Cursor 中建立真正可用的產品。",
      subtitle: "",
      guest: "Zevi Arnovitz",
    },
  },
  "podcasts/sam-lessin.md": {
    zhCN: {
      title: "如何在任何场合都保持从容：硅谷缺失的礼仪手册 | Sam Lessin",
      summary: "聚焦硅谷常被忽视的“礼仪与分寸感”，内容覆盖创业、产品设计与一线操盘经验。",
      subtitle: "",
      guest: "Sam Lessin",
    },
    zhHK: {
      title: "如何在任何場合都保持從容：矽谷缺失的禮儀手冊 | Sam Lessin",
      summary: "聚焦矽谷常被忽略的「禮儀與分寸感」，內容涵蓋創業、產品設計與一線操盤經驗。",
      subtitle: "",
      guest: "Sam Lessin",
    },
  },
  "podcasts/alexander-embiricos.md": {
    zhCN: {
      title: "重度用户版 Codex 指南：并行工作流、规划技巧、上下文工程与自动化代码评审 | Alexander Embiricos",
      summary: "讲清如何在 VS Code 与终端中配置并使用 Codex，覆盖从简单任务到复杂工程协作的完整实践路径。",
      subtitle: "",
      guest: "Alexander Embiricos",
    },
    zhHK: {
      title: "進階用戶版 Codex 指南：並行工作流、規劃技巧、上下文工程與自動化程式碼審查 | Alexander Embiricos",
      summary: "講清如何在 VS Code 與終端中設定並使用 Codex，涵蓋由簡單任務到複雜工程協作的完整實戰路徑。",
      subtitle: "",
      guest: "Alexander Embiricos",
    },
  },
};

async function rewrite(locale) {
  const filePath = path.resolve(`g:/LennysData/translation/${locale}/batches/batch-01.json`);
  const raw = await fs.readFile(filePath, "utf8");
  const payload = JSON.parse(raw.replace(/^\uFEFF/, ""));

  for (const doc of payload.docs) {
    const row = updates[doc.filename];
    if (!row) {
      continue;
    }
    doc.translated = locale === "zh-CN" ? row.zhCN : row.zhHK;
    doc.status = "done";
  }

  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

await rewrite("zh-CN");
await rewrite("zh-HK");
console.log("batch-01 rewritten with UTF-8 Chinese translations");
