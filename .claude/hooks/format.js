// PostToolUse(Edit|Write) hook: 수정된 파일을 프로젝트 Prettier 설정(package.json)으로 포맷한다.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let file;
  try {
    const data = JSON.parse(input);
    file = (data.tool_response && data.tool_response.filePath) || data.tool_input.file_path;
  } catch {
    return;
  }
  if (!file || !/\.(ts|html|css|scss|json)$/i.test(file)) return;
  if (/[\\/](node_modules|dist|\.angular)[\\/]/.test(file)) return;

  // PATH의 전역 npm이 오래된 버전일 수 있어 Node에 번들된 npx를 우선 사용한다.
  const bundledNpx = path.join(
    path.dirname(process.execPath),
    'node_modules',
    'npm',
    'bin',
    'npx-cli.js',
  );
  const args = ['--yes', 'prettier@3', '--write', file];
  const options = { stdio: 'ignore', cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd() };

  if (fs.existsSync(bundledNpx)) {
    spawnSync(process.execPath, [bundledNpx, ...args], options);
  } else {
    spawnSync('npx', args, { ...options, shell: true });
  }
});
