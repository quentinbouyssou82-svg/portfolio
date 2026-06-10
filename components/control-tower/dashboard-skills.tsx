"use client";

import { useEffect, useState, useTransition } from "react";
import { updateSkillProgress } from "@/lib/control-tower/actions";
import type { Skill } from "@/lib/control-tower/types";

type DashboardSkillsProps = {
  skills: Skill[];
};

export function DashboardSkills({ skills: initial }: DashboardSkillsProps) {
  const [skills, setSkills] = useState(initial);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setSkills(initial);
  }, [initial]);

  function commit(skillId: string, progress: number) {
    startTransition(async () => {
      await updateSkillProgress(skillId, progress);
    });
  }

  return (
    <section className="ct-section" aria-labelledby="skills-heading">
      <h2 id="skills-heading" className="ct-section-title">
        Progression compétences
      </h2>
      <div className="ct-card">
        <ul className="ct-skills-list">
          {skills.map((skill, i) => (
            <li
              key={skill.id}
              className={
                i > 0 ? "ct-skill-item ct-skill-item-border" : "ct-skill-item"
              }
            >
              <div className="ct-skill-header">
                <span>{skill.name}</span>
                <span className="ct-skill-pct">{skill.progress}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={skill.progress}
                disabled={pending}
                className="ct-range"
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setSkills((prev) =>
                    prev.map((s) =>
                      s.id === skill.id ? { ...s, progress: v } : s,
                    ),
                  );
                }}
                onPointerUp={(e) =>
                  commit(skill.id, parseInt(e.currentTarget.value, 10))
                }
              />
              <div className="ct-progress-track">
                <div
                  className="ct-progress-fill"
                  style={{ width: `${skill.progress}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
