/**
 * 文件修改追踪钩子
 * 追踪 Edit/Write/MultiEdit 修改的文件
 *
 * 触发时机: PostToolUse (matcher: Edit|MultiEdit|Write)
 * 输入: stdin JSON { tool_name, tool_input, tool_response }
 */

const fs = require('fs');
const path = require('path');

// 获取项目根目录
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// 会话追踪文件路径
const trackingFile = path.join(projectDir, '.claude/.session-tracking.json');

// 项目区域检测规则
const PROJECT_AREAS = {
  server: [/apps[/\\]server[/\\]/, /\.ts$/],
  admin: [/apps[/\\]admin[/\\]/, /\.(vue|ts|tsx)$/],
  miniprogram: [/apps[/\\]miniprogram[/\\]/, /\.(js|wxml|wxss|json)$/],
  prisma: [/prisma[/\\]/, /schema\.prisma$/],
  config: [/\.json$/, /\.yaml$/, /\.yml$/, /\.toml$/],
  docs: [/docs[/\\]/, /\.md$/],
  tests: [/tests?[/\\]/, /\.test\.[tj]sx?$/, /\.spec\.[tj]sx?$/],
};

// 检测文件所属项目区域
function detectProjectAreas(filePath) {
  const areas = [];
  const normalizedPath = filePath.replace(/\\/g, '/');

  for (const [area, patterns] of Object.entries(PROJECT_AREAS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedPath)) {
        if (!areas.includes(area)) {
          areas.push(area);
        }
        break;
      }
    }
  }

  return areas.length > 0 ? areas : ['other'];
}

// 加载追踪数据
function loadTracking() {
  try {
    if (fs.existsSync(trackingFile)) {
      const content = fs.readFileSync(trackingFile, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    // 忽略错误
  }

  return {
    sessionId: Date.now().toString(),
    modifiedFiles: [],
    projectAreas: [],
    startTime: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
}

// 保存追踪数据
function saveTracking(data) {
  try {
    // 确保目录存在
    const dir = path.dirname(trackingFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(trackingFile, JSON.stringify(data, null, 2));
  } catch (error) {
    // 静默失败
  }
}

// 从 stdin 读取 JSON 数据
function readStdin() {
  return new Promise((resolve) => {
    let data = '';

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

    if (process.stdin.isTTY) {
      clearTimeout(timeout);
      resolve('');
    }
  });
}

// 主函数
async function main() {
  // 从 stdin 读取 JSON 数据
  const stdinData = await readStdin();

  let filePath = '';

  if (stdinData) {
    try {
      const input = JSON.parse(stdinData);
      // 尝试从 tool_input 中获取文件路径
      filePath = input.tool_input?.file_path ||
                 input.tool_input?.path ||
                 input.file_path ||
                 '';
    } catch (e) {
      // 忽略解析错误
    }
  }

  // 回退到环境变量
  if (!filePath) {
    filePath = process.env.TOOL_FILE_PATH || process.env.FILE_PATH || '';
  }

  if (!filePath) {
    return;
  }

  // 加载追踪数据
  const tracking = loadTracking();

  // 检测项目区域
  const areas = detectProjectAreas(filePath);

  // 添加到追踪列表（去重）
  if (!tracking.modifiedFiles.includes(filePath)) {
    tracking.modifiedFiles.push(filePath);
  }

  // 更新项目区域（去重）
  for (const area of areas) {
    if (!tracking.projectAreas.includes(area)) {
      tracking.projectAreas.push(area);
    }
  }

  // 保存追踪数据
  saveTracking(tracking);

  // 输出追踪信息
  const relativePath = path.relative(projectDir, filePath);
  const areaLabel = areas.join(', ');

  console.log('');
  console.log('文件修改追踪:');
  console.log('  -> ' + relativePath + ' [' + areaLabel + ']');
  console.log('  (本会话共修改 ' + tracking.modifiedFiles.length + ' 个文件)');
  console.log('');
}

main().catch(() => {});
