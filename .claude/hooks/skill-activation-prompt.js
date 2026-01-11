/**
 * 技能激活提示钩子
 * 在用户提交 prompt 时自动匹配并建议相关 Skill
 *
 * 触发时机: UserPromptSubmit
 */

const fs = require('fs');
const path = require('path');

// 获取项目根目录
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// 读取技能规则配置
function loadSkillRules() {
  try {
    const rulesPath = path.join(projectDir, '.claude/skills/skill-rules.json');
    const content = fs.readFileSync(rulesPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

// 关键词匹配
function matchKeywords(prompt, keywords) {
  const lowerPrompt = prompt.toLowerCase();
  return keywords.filter((kw) => lowerPrompt.includes(kw.toLowerCase()));
}

// 意图模式匹配（正则）
function matchIntentPatterns(prompt, patterns) {
  const matched = [];
  for (const pattern of patterns) {
    try {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(prompt)) {
        matched.push(pattern);
      }
    } catch (e) {
      // 忽略无效的正则
    }
  }
  return matched;
}

// 计算匹配分数
function calculateScore(matchedKeywords, matchedPatterns, priority, scoring) {
  const keywordScore = matchedKeywords.length * (scoring.keywordMatch || 10);
  const patternScore = matchedPatterns.length * (scoring.patternMatch || 20);
  const priorityBonus = scoring.priorityBonus || {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
  };
  const priorityScore = priorityBonus[priority] || 0;
  return keywordScore + patternScore + priorityScore;
}

// 主函数
function main() {
  // 从环境变量或标准输入获取用户 prompt
  const prompt = process.env.USER_PROMPT || '';

  if (!prompt) {
    return;
  }

  const config = loadSkillRules();
  if (!config || !config.skills) {
    return;
  }

  const matches = [];

  for (const [skillName, skill] of Object.entries(config.skills)) {
    const triggers = skill.triggers || {};
    const matchedKeywords = matchKeywords(prompt, triggers.keywords || []);
    const matchedPatterns = matchIntentPatterns(prompt, triggers.intentPatterns || []);

    if (matchedKeywords.length > 0 || matchedPatterns.length > 0) {
      const score = calculateScore(
        matchedKeywords,
        matchedPatterns,
        skill.priority,
        config.scoring || {}
      );

      matches.push({
        skillName,
        description: skill.description,
        priority: skill.priority,
        matchedKeywords,
        matchedPatterns,
        score,
      });
    }
  }

  // 按分数排序
  matches.sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    return;
  }

  // 输出匹配结果
  const priorityLabels = {
    critical: '🔴 CRITICAL',
    high: '🟠 HIGH',
    medium: '🟡 MEDIUM',
    low: '🟢 LOW',
  };

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                   🎯 技能激活建议                             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  // 按优先级分组输出
  const priorities = ['critical', 'high', 'medium', 'low'];

  for (const priority of priorities) {
    const group = matches.filter((m) => m.priority === priority);
    if (group.length > 0) {
      console.log(`${priorityLabels[priority]}:`);
      for (const match of group) {
        console.log(`  → /${match.skillName}: ${match.description}`);
        if (match.matchedKeywords.length > 0) {
          console.log(`    匹配关键词: ${match.matchedKeywords.join(', ')}`);
        }
      }
      console.log('');
    }
  }

  console.log('────────────────────────────────────────────────────────────────');
  console.log('提示: 输入 /<技能名> 可激活对应技能');
  console.log('');
}

main();
