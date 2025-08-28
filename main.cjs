const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const https = require('https');
const yauzl = require('yauzl');

let mainWindow;

// GitHub Repository 정보
const GITHUB_REPO = 'aiden-flo-fe/nightreborn';
const VERSION_FILE = 'version.txt';

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // macOS SIP 문제 해결을 위한 최소한의 설정
      nodeIntegration: false,
      contextIsolation: false, // SIP 문제로 인해 비활성화
      enableRemoteModule: false,
      allowRunningInsecureContent: true,
      webSecurity: false,
      sandbox: false,
      // 안정성을 위한 추가 설정
      experimentalFeatures: false,
      enableBlinkFeatures: '',
      v8CacheOptions: 'none',
      backgroundThrottling: false,
      offscreen: false,
      // macOS에서 메모리 관련 문제 방지
      ...(process.platform === 'darwin' && {
        spellcheck: false,
        enableWebSQL: false,
        plugins: false,
      }),
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // 아이콘이 있다면
    // macOS에서 더 안전한 실행을 위한 설정
    ...(process.platform === 'darwin' && {
      titleBarStyle: 'default',
      vibrancy: 'under-window',
      // SIP 문제 해결을 위한 추가 설정
      show: false, // 창을 숨긴 상태로 시작
    }),
  });

  // macOS에서 창이 준비된 후 표시
  if (process.platform === 'darwin') {
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });
  }

  // 단순화된 파일 로딩 로직
  if (process.env.NODE_ENV === 'development') {
    // 개발 모드: 로컬 서버 우선, 없으면 dist 폴더
    try {
      console.log('개발 모드: 로컬 서버 연결 시도');
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    } catch (error) {
      console.log('개발 모드: 로컬 서버 실패, dist 폴더 사용');
      const devDistPath = path.join(__dirname, 'dist', 'index.html');
      mainWindow.loadFile(devDistPath);
      mainWindow.webContents.openDevTools();
    }
  } else {
    // 프로덕션 모드: 여러 경로 시도
    const possiblePaths = [
      // 빌드된 앱 내부 경로 (일반적인 경우)
      path.join(process.resourcesPath, 'app', 'dist', 'index.html'),
      // 개발 시 또는 다른 구조
      path.join(__dirname, 'dist', 'index.html'),
      // 추가 fallback 경로
      path.join(__dirname, '..', 'dist', 'index.html'),
    ];

    let loaded = false;

    for (const distPath of possiblePaths) {
      try {
        console.log('프로덕션 모드: dist 파일 로드 시도');
        console.log('시도 중인 경로:', distPath);

        // 파일 존재 확인
        await fs.access(distPath);
        console.log('✅ dist/index.html 파일 발견!');

        // 파일 로드
        await mainWindow.loadFile(distPath);
        console.log('✅ dist 파일 로드 성공');
        loaded = true;
        break;
      } catch (error) {
        console.log(`❌ 경로 실패: ${distPath}`);
        console.log('오류:', error.message);
        continue;
      }
    }

    if (!loaded) {
      console.error('❌ 모든 dist 경로에서 파일을 찾을 수 없습니다');
      await showDefaultPage();
    }
  }
}

// loadAppFromUserData 함수 제거 (단순화를 위해)

async function checkForUpdates() {
  if (process.env.NODE_ENV === 'development') {
    console.log('개발 모드에서는 업데이트 체크를 건너뜁니다.');
    return;
  }

  try {
    const latestVersion = await getLatestVersionFromGitHub();
    const currentVersion = await getCurrentVersion();

    console.log(`현재 버전: ${currentVersion}, 최신 버전: ${latestVersion}`);

    if (latestVersion && currentVersion !== latestVersion) {
      const result = await dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '업데이트 확인',
        message: `새 버전이 있습니다. (v${latestVersion})`,
        detail: '지금 업데이트하시겠습니까?',
        buttons: ['업데이트', '나중에'],
        defaultId: 0,
        cancelId: 1,
      });

      if (result.response === 0) {
        await performUpdate(latestVersion);
      }
    } else if (latestVersion) {
      console.log('이미 최신 버전입니다.');
    }
  } catch (error) {
    console.error('업데이트 확인 중 오류:', error);
    // 오류가 발생해도 앱은 계속 실행
  }
}

async function getLatestVersionFromGitHub() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/releases/latest`,
      headers: {
        'User-Agent': 'Recipe-App-Updater',
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const release = JSON.parse(data);
          if (release && release.tag_name) {
            resolve(release.tag_name.replace('v', ''));
          } else {
            resolve(null); // 릴리스가 없거나 태그가 없는 경우
          }
        } catch (error) {
          console.error('GitHub API 응답 파싱 오류:', error);
          resolve(null); // 파싱 오류 시 null 반환
        }
      });
    });

    req.on('error', error => {
      console.error('GitHub API 요청 오류:', error);
      resolve(null); // 네트워크 오류 시 null 반환
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.error('GitHub API 요청 시간 초과');
      resolve(null); // 시간 초과 시 null 반환
    });

    req.end();
  });
}

async function getCurrentVersion() {
  try {
    const userDataPath = app.getPath('userData');
    const versionPath = path.join(userDataPath, VERSION_FILE);
    const version = await fs.readFile(versionPath, 'utf-8');
    return version.trim();
  } catch (error) {
    return null; // 버전 파일이 없으면 null 반환
  }
}

async function showDefaultPage() {
  console.log('⚠️  fallback 페이지 표시: dist 파일을 찾을 수 없습니다');

  const fallbackHTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>레시피 관리 앱 - 오류</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: #f5f5f5;
            color: #333;
            text-align: center;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            max-width: 500px;
        }
        h1 { color: #e74c3c; margin-bottom: 20px; }
        .message { line-height: 1.6; margin-bottom: 20px; }
        .path { background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚨 파일 로드 오류</h1>
        <div class="message">
            <p><strong>dist/index.html 파일을 찾을 수 없습니다.</strong></p>
            <p>다음 경로를 확인해주세요:</p>
            <div class="path">${path.join(__dirname, 'dist', 'index.html')}</div>
            <br>
            <p>해결 방법:</p>
            <ol style="text-align: left;">
                <li><code>npm run build</code> 실행</li>
                <li><code>npm run electron-build</code> 실행</li>
                <li>앱 재시작</li>
            </ol>
        </div>
    </div>
</body>
</html>`;

  try {
    await mainWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(fallbackHTML)}`
    );
  } catch (error) {
    console.error('fallback 페이지 로드도 실패:', error);
  }
}

async function performUpdate(version, isInitial = false) {
  try {
    if (!isInitial) {
      await dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '업데이트 진행',
        message: '업데이트를 다운로드하고 있습니다.',
        detail: '잠시만 기다려주세요...',
        buttons: ['확인'],
      });
    }

    const downloadUrl = `https://github.com/${GITHUB_REPO}/releases/download/v${version}/dist.zip`;
    const userDataPath = app.getPath('userData');
    const tempZipPath = path.join(userDataPath, 'dist-temp.zip');
    const distPath = path.join(userDataPath, 'dist');

    // 기존 dist 폴더 백업 (실패 시 복구용)
    const backupPath = path.join(userDataPath, 'dist-backup');
    try {
      await fs.access(distPath);
      await fs.rm(backupPath, { recursive: true, force: true });
      await fs.rename(distPath, backupPath);
    } catch (error) {
      // 백업할 기존 폴더가 없는 경우 (초기 설치)
    }

    // dist.zip 다운로드
    await downloadFile(downloadUrl, tempZipPath);

    // 압축 해제
    await extractZip(tempZipPath, distPath);

    // 버전 파일 업데이트
    await fs.writeFile(path.join(userDataPath, VERSION_FILE), version);

    // 임시 파일 삭제
    await fs.unlink(tempZipPath);

    // 백업 폴더 삭제
    try {
      await fs.rm(backupPath, { recursive: true, force: true });
    } catch (error) {
      // 백업 폴더가 없는 경우
    }

    if (isInitial) {
      // 초기 설치 후 앱 로드
      await loadAppFromUserData();
    } else {
      // 업데이트 완료 후 재시작
      await dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '업데이트 완료',
        message: '업데이트가 완료되었습니다.',
        detail: '앱이 다시 시작됩니다.',
        buttons: ['확인'],
      });

      app.relaunch();
      app.exit(0);
    }
  } catch (error) {
    console.error('업데이트 실패:', error);

    // 백업 복구 시도
    const userDataPath = app.getPath('userData');
    const backupPath = path.join(userDataPath, 'dist-backup');
    const distPath = path.join(userDataPath, 'dist');

    try {
      await fs.access(backupPath);
      await fs.rm(distPath, { recursive: true, force: true });
      await fs.rename(backupPath, distPath);
      console.log('백업에서 복구했습니다.');
    } catch (restoreError) {
      console.error('백업 복구 실패:', restoreError);
    }

    dialog.showErrorBox(
      '업데이트 실패',
      `업데이트 중 오류가 발생했습니다.\n${error.message}`
    );
  }
}

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(outputPath);
    https
      .get(url, response => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // 리다이렉트 처리
          return downloadFile(response.headers.location, outputPath)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          reject(
            new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`)
          );
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
        file.on('error', reject);
      })
      .on('error', reject);
  });
}

function extractZip(zipPath, outputDir) {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);

      zipfile.readEntry();
      zipfile.on('entry', async entry => {
        if (/\/$/.test(entry.fileName)) {
          // 디렉토리
          const dirPath = path.join(outputDir, entry.fileName);
          await fs.mkdir(dirPath, { recursive: true });
          zipfile.readEntry();
        } else {
          // 파일
          const filePath = path.join(outputDir, entry.fileName);
          const fileDir = path.dirname(filePath);
          await fs.mkdir(fileDir, { recursive: true });

          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);

            const writeStream = require('fs').createWriteStream(filePath);
            readStream.pipe(writeStream);
            writeStream.on('close', () => zipfile.readEntry());
            writeStream.on('error', reject);
          });
        }
      });

      zipfile.on('end', resolve);
      zipfile.on('error', reject);
    });
  });
}

async function copyDirectory(source, destination) {
  try {
    await fs.mkdir(destination, { recursive: true });

    const items = await fs.readdir(source);

    for (const item of items) {
      const sourcePath = path.join(source, item);
      const destPath = path.join(destination, item);

      const stat = await fs.stat(sourcePath);

      if (stat.isDirectory()) {
        await copyDirectory(sourcePath, destPath);
      } else {
        await fs.copyFile(sourcePath, destPath);
      }
    }
  } catch (error) {
    throw new Error(`디렉토리 복사 실패: ${error.message}`);
  }
}

// macOS SIP 호환성을 위한 강화된 설정
if (process.platform === 'darwin') {
  // 핵심 보안 관련 플래그
  app.commandLine.appendSwitch('--no-sandbox');
  app.commandLine.appendSwitch('--disable-web-security');

  // 렌더링 관련 플래그 (SIP 크래시 방지)
  app.commandLine.appendSwitch(
    '--disable-features',
    'VizDisplayCompositor,OutOfBlinkCors'
  );
  app.commandLine.appendSwitch('--disable-software-rasterizer');
  app.commandLine.appendSwitch('--disable-gpu-sandbox');

  // 메모리 관련 플래그 (크래시 방지)
  app.commandLine.appendSwitch('--max_old_space_size', '4096');
  app.commandLine.appendSwitch('--disable-dev-shm-usage');
  app.commandLine.appendSwitch('--no-zygote');

  // macOS 특화 플래그
  app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');
  app.commandLine.appendSwitch('--disable-renderer-backgrounding');
}

// macOS 전용 추가 초기화 설정
if (process.platform === 'darwin') {
  // GPU 프로세스 비활성화 (SIP 크래시 방지)
  app.disableHardwareAcceleration();

  // 추가 안전 설정
  app.commandLine.appendSwitch('--disable-gpu');
  app.commandLine.appendSwitch('--disable-gpu-compositing');
}

// Electron 앱 이벤트
app.whenReady().then(async () => {
  // macOS에서 더 안전한 초기화를 위한 지연
  if (process.platform === 'darwin') {
    console.log('macOS SIP 호환 모드로 초기화 중...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 지연
  }

  try {
    await createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow().catch(error => {
          console.error('창 재생성 실패:', error);
          // 실패 시 기본 페이지라도 표시
          showDefaultPage().catch(console.error);
        });
      }
    });

    // 앱 로드 후 업데이트 체크 (더 안전하게)
    setTimeout(() => {
      try {
        checkForUpdates();
      } catch (error) {
        console.error('업데이트 체크 중 오류:', error);
      }
    }, 10000); // 10초 후 체크 (더 안정적)
  } catch (error) {
    console.error('앱 초기화 중 오류:', error);
    // 오류 발생 시에도 기본 창은 생성
    try {
      await showDefaultPage();
    } catch (fallbackError) {
      console.error('fallback 페이지도 실패:', fallbackError);
      // 최후의 수단: 빈 창이라도 생성
      try {
        mainWindow = new BrowserWindow({
          width: 800,
          height: 600,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,
            webSecurity: false,
            sandbox: false,
          },
        });
        mainWindow.loadURL(
          'data:text/html,<html><body><h1>레시피 관리 앱</h1><p>초기화 중...</p></body></html>'
        );
      } catch (finalError) {
        console.error('최종 fallback도 실패:', finalError);
      }
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 보안을 위한 추가 설정
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });
});

// macOS SIP 문제 해결을 위한 추가 설정
if (process.platform === 'darwin') {
  // 프로세스 크래시 방지
  process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error);
    // 크래시 대신 로그만 남기고 계속 실행
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // 크래시 대신 로그만 남기고 계속 실행
  });
}

// 앱 종료 시 정리 작업
app.on('before-quit', () => {
  console.log('앱 종료 중...');
});

app.on('quit', () => {
  console.log('앱이 종료되었습니다.');
});
