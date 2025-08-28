const { app, BrowserWindow } = require('electron');
const path = require('path');

// 극도로 안전한 macOS SIP 호환 모드
if (process.platform === 'darwin') {
  // 모든 GPU 관련 기능 비활성화
  app.disableHardwareAcceleration();

  // 최소한의 Chromium 플래그만 사용
  app.commandLine.appendSwitch('--no-sandbox');
  app.commandLine.appendSwitch('--disable-web-security');
  app.commandLine.appendSwitch('--disable-gpu');
  app.commandLine.appendSwitch('--disable-software-rasterizer');
  app.commandLine.appendSwitch('--disable-dev-shm-usage');
  app.commandLine.appendSwitch('--disable-extensions');
  app.commandLine.appendSwitch('--disable-plugins');
  app.commandLine.appendSwitch('--disable-background-timer-throttling');
  app.commandLine.appendSwitch('--disable-renderer-backgrounding');
  app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');
  app.commandLine.appendSwitch(
    '--disable-features',
    'VizDisplayCompositor,TranslateUI,BlinkGenPropertyTrees'
  );
}

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // 최소한의 보안 설정
      nodeIntegration: false,
      contextIsolation: false,
      webSecurity: false,
      sandbox: false,
      allowRunningInsecureContent: true,
      experimentalFeatures: false,
      // 모든 추가 기능 비활성화
      plugins: false,
      webgl: false,
      webaudio: false,
      backgroundThrottling: false,
      offscreen: false,
    },
    // macOS 전용 창 설정
    ...(process.platform === 'darwin' && {
      show: false, // 준비될 때까지 숨김
      titleBarStyle: 'default',
    }),
  });

  // macOS에서 창이 준비된 후에만 표시
  if (process.platform === 'darwin') {
    mainWindow.once('ready-to-show', () => {
      console.log('macOS: 창이 안전하게 준비되었습니다.');
      mainWindow.show();
    });
  }

  // 간단한 HTML 페이지 로드
  const distPath = path.join(__dirname, 'dist', 'index.html');

  try {
    // 개발 모드 체크
    if (process.env.NODE_ENV === 'development') {
      console.log('개발 모드: 로컬 서버 연결 시도');
      await mainWindow.loadURL('http://localhost:5173');
    } else {
      console.log('프로덕션 모드: 로컬 파일 로드');
      await mainWindow.loadFile(distPath);
    }
  } catch (error) {
    console.error('페이지 로드 실패:', error);
    // 최후의 수단: 간단한 HTML
    const fallbackHTML = `
      <!DOCTYPE html>
      <html>
      <head><title>레시피 관리</title></head>
      <body>
        <h1>🍳 레시피 관리 앱</h1>
        <p>앱이 안전 모드로 실행되고 있습니다.</p>
        <p>macOS SIP 호환 모드 활성화됨</p>
      </body>
      </html>
    `;
    await mainWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(fallbackHTML)}`
    );
  }
}

// 앱 초기화
app.whenReady().then(async () => {
  console.log('Electron 앱 초기화 중...');

  if (process.platform === 'darwin') {
    console.log('macOS SIP 안전 모드로 시작합니다...');
    // 충분한 지연 시간
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  try {
    await createWindow();
    console.log('앱이 성공적으로 시작되었습니다.');
  } catch (error) {
    console.error('앱 시작 실패:', error);
    process.exit(1);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch(console.error);
  }
});

// 크래시 방지
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

console.log('macOS SIP 안전 모드 main.js 로드됨');
