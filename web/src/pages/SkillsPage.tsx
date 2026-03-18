import { useState } from "react";
import { skillsData } from "../lib/skillsData";

interface SkillsPageProps {
  t: (key: string, vars?: Record<string, string | number>) => string;
}

async function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-10000px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function SkillsPage({ t }: SkillsPageProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const onCopy = async (skillId: string, code: string) => {
    try {
      await copyToClipboard(code);
      setCopiedId(skillId);
      window.setTimeout(() => {
        setCopiedId((current) => (current === skillId ? null : current));
      }, 1500);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <main className="container skills-layout">
      <section className="card skills-hero">
        <p className="eyebrow">{t("skills.eyebrow")}</p>
        <h1>{t("skills.title")}</h1>
        <p className="muted">{t("skills.subtitle")}</p>
      </section>

      <section className="skills-grid">
        {skillsData.map((skill) => (
          <article key={skill.id} className="card skill-card">
            <div className="skill-card-head">
              <span className="skill-badge">{skill.badge}</span>
              <button className="pill ghost" type="button" onClick={() => onCopy(skill.id, skill.code)}>
                {copiedId === skill.id ? t("skills.copied") : t("skills.copy")}
              </button>
            </div>

            <div className="skill-icon">{skill.icon}</div>
            <h2>{skill.title}</h2>
            <p className="skill-name"><code>{skill.name}</code></p>
            <p className="muted">{skill.summary}</p>
            <p className="skill-tagline">{skill.tagline}</p>

            <div className="skill-meta">
              <p className="field-label">{t("skills.topics")}</p>
              <div className="tag-cloud">
                {skill.topics.map((topic) => (
                  <span key={`${skill.id}-${topic}`} className="tag">{topic}</span>
                ))}
              </div>
            </div>

            <div className="skill-meta">
              <p className="field-label">{t("skills.examples")}</p>
              <ul className="skill-example-list">
                {skill.examples.map((example) => (
                  <li key={`${skill.id}-${example}`}>{example}</li>
                ))}
              </ul>
            </div>

            <div className="skill-code-wrap">
              <p className="field-label">{t("skills.code")}</p>
              <pre className="skill-code"><code>{skill.code}</code></pre>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
