/**
 * 任务完成提示音钩子
 * 当 Claude 完成响应时播放提示音
 *
 * 触发时机: Stop (任务完成时)
 */

const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 获取项目根目录
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// 音频文件路径
const audioFile = path.join(projectDir, '.claude', 'audio', 'down.mp3');

// 检查文件是否存在
if (!fs.existsSync(audioFile)) {
  // 静默退出，不影响主流程
  process.exit(0);
}

// Windows 下使用 PowerShell 播放音频
const isWindows = process.platform === 'win32';

if (isWindows) {
  // 方法1：使用 PowerShell 脚本文件方式（更可靠）
  const psScript = `
Add-Type -AssemblyName presentationCore
$player = New-Object System.Windows.Media.MediaPlayer
$player.Open("${audioFile.replace(/\\/g, '/')}")
$player.Play()
Start-Sleep -Seconds 2
`;

  // 创建临时 PowerShell 脚本
  const tempScript = path.join(projectDir, '.claude', '.temp-play.ps1');
  try {
    fs.writeFileSync(tempScript, psScript);
    exec(`powershell -ExecutionPolicy Bypass -File "${tempScript}"`, { windowsHide: true }, () => {
      // 清理临时文件
      try { fs.unlinkSync(tempScript); } catch (e) {}
      process.exit(0);
    });
  } catch (e) {
    // 备用方法：使用 start 命令（会打开默认播放器窗口）
    exec(`start "" "${audioFile}"`, { windowsHide: true }, () => {
      process.exit(0);
    });
  }
} else {
  // macOS 使用 afplay
  if (process.platform === 'darwin') {
    exec(`afplay "${audioFile}"`, { windowsHide: true }, () => {
      process.exit(0);
    });
  }
  // Linux 使用 aplay 或 paplay
  else {
    exec(`paplay "${audioFile}" 2>/dev/null || aplay "${audioFile}" 2>/dev/null`, { windowsHide: true }, () => {
      process.exit(0);
    });
  }
}
