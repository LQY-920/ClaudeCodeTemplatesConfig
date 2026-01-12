// 技能激活提示钩子 (Claude Code 2.1)
// 在用户提交 prompt 时自动匹配并建议相关 Skill
// 触发时机: UserPromptSubmit
// 输入: stdin JSON { prompt, session_id, ... }
// 更新说明: 现在直接从 skills/*/SKILL.md 的 frontmatter 读取 description
// 不再依赖已废弃的 skill-rules.json

const fs = require('fs');
const path = require('path');

// 获取项目根目录
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// 解析 YAML frontmatter
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const bodyContent = match[2];

  const frontmatter = {};
  const lines = frontmatterStr.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // 移除引号
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: bodyContent };
}

// 从 skills/*/SKILL.md 加载技能
function loadSkillsFromMD() {
  const skillsDir = path.join(projectDir, '.claude/skills');
  const skills = [];

  try {
    if (!fs.existsSync(skillsDir)) return skills;

    const items = fs.readdirSync(skillsDir, { withFileTypes: true });

    for (const item of items) {
      if (!item.isDirectory()) continue;

      const skillPath = path.join(skillsDir, item.name);
      const skillMDPath = path.join(skillPath, 'SKILL.md');

      if (!fs.existsSync(skillMDPath)) continue;

      try {
        const content = fs.readFileSync(skillMDPath, 'utf-8');
        const { frontmatter } = parseFrontmatter(content);

        if (frontmatter.name && frontmatter.description) {
          // 从 description 中提取触发词
          const triggerMatch = frontmatter.description.match(/触发词[：:]\s*(.+?)(?:\.|$)/);
          const triggersStr = triggerMatch ? triggerMatch[1] : frontmatter.description;

          // 分割触发词（支持中英文逗号、顿号分隔）
          const keywords = triggersStr
            .split(/[,，、]/)
            .map((kw) => kw.trim())
            .filter((kw) => kw.length > 0);

          skills.push({
            name: frontmatter.name,
            description: frontmatter.description,
            keywords,
            priority: 'medium', // 默认优先级
            userInvocable: frontmatter['user-invocable'] === 'true',
          });
        }
      } catch (e) {
        // 忽略单个技能文件的错误
      }
    }
  } catch (e) {
    // 忽略错误
  }

  return skills;
}

// 关键词匹配
function matchKeywords(prompt, keywords) {
  const lowerPrompt = prompt.toLowerCase();
  return keywords.filter((kw) => lowerPrompt.includes(kw.toLowerCase()));
}

// 计算匹配分数
function calculateScore(matchedKeywords) {
  // 关键词匹配分数：每个匹配关键词 10 分
  return matchedKeywords.length * 10;
}

// 从 stdin 读取 JSON 数据
function readStdin() {
  return new Promise((resolve) => {
    let data = '';

    // 设置超时，避免无限等待
    const timeout = setTimeout(() => {
      resolve(data);
    }, 100);

    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    process.stdin.on('end', () => {
      clearTimeout(timeout);
      resolve(data);
    });

    // 如果没有数据，立即返回
    if (process.stdin.isTTY) {
      clearTimeout(timeout);
      resolve('');
    }
  });
}

// 加载已激活的 Rules
function loadActiveRules() {
  const rulesDir = path.join(projectDir, '.claude/rules');
  const activeRules = [];

  try {
    if (!fs.existsSync(rulesDir)) return activeRules;

    const scanDir = (dir, prefix = '') => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDir(fullPath, prefix + item + '/');
        } else if (item.endsWith('.md')) {
          const ruleName = prefix + item.replace('.md', '');
          activeRules.push(ruleName);
        }
      }
    };

    scanDir(rulesDir);
  } catch (e) {
    // 忽略错误
  }

  return activeRules;
}

// 主函数
async function main() {
  // 始终输出 hook 触发标识
  console.log('');
  console.log('[Hook] UserPromptSubmit 已触发');

  // 从 stdin 读取 JSON 数据
  const stdinData = await readStdin();

  let prompt = '';

  if (stdinData) {
    try {
      const input = JSON.parse(stdinData);
      prompt = input.prompt || input.user_prompt || '';
    } catch (e) {
      // 如果不是 JSON，直接使用原始数据
      prompt = stdinData;
    }
  }

  // 回退到环境变量
  if (!prompt) {
    prompt = process.env.USER_PROMPT || process.env.PROMPT || '';
  }

  // 输出已加载的 Rules
  const activeRules = loadActiveRules();
  if (activeRules.length > 0) {
    console.log('[Rules] 已加载规则: ' + activeRules.join(', '));
  }

  // 加载所有 Skills
  const allSkills = loadSkillsFromMD();
  const userInvocableSkills = allSkills.filter((s) => s.userInvocable);
  console.log('[Skill] 已加载 ' + userInvocableSkills.length + ' 个技能');

  if (!prompt) {
    console.log('');
    return;
  }

  const matches = [];

  for (const skill of allSkills) {
    const matchedKeywords = matchKeywords(prompt, skill.keywords);

    if (matchedKeywords.length > 0) {
      const score = calculateScore(matchedKeywords);

      matches.push({
        name: skill.name,
        description: skill.description,
        priority: skill.priority,
        matchedKeywords,
        score,
      });
    }
  }

  // 按分数排序
  matches.sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    console.log('[Skill] 未匹配到相关技能');
    console.log('');
    return;
  }

  // 输出匹配结果
  const priorityLabels = {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
  };

  console.log('');
  console.log('========== 技能激活建议 ==========');

  // 按优先级分组输出
  const priorities = ['critical', 'high', 'medium', 'low'];

  for (const priority of priorities) {
    const group = matches.filter((m) => m.priority === priority);
    if (group.length > 0) {
      console.log('[' + priorityLabels[priority] + ']:');
      for (const match of group) {
        console.log('  -> /' + match.name + ': ' + match.description);
        if (match.matchedKeywords.length > 0) {
          console.log('     匹配关键词: ' + match.matchedKeywords.join(', '));
        }
      }
    }
  }

  console.log('==================================');
  console.log('提示: 输入 /<技能名> 可激活对应技能');
  console.log('');
}

main().catch(() => {});
