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
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      allowRunningInsecureContent: false,
      webSecurity: true,
      sandbox: false, // macOS에서 필요
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // 아이콘이 있다면
    // macOS에서 더 안전한 실행을 위한 설정
    ...(process.platform === 'darwin' && {
      titleBarStyle: 'default',
      vibrancy: 'under-window',
    }),
  });

  // 개발 모드에서는 로컬 서버, 프로덕션에서는 로컬 파일
  if (process.env.NODE_ENV === 'development') {
    // 개발 모드에서도 dist 폴더가 있으면 사용, 없으면 로컬 서버
    const devDistPath = path.join(__dirname, 'dist');
    try {
      await fs.access(path.join(devDistPath, 'index.html'));
      console.log('개발 모드: dist 폴더 발견, 로컬 파일 사용');
      mainWindow.loadFile(path.join(devDistPath, 'index.html'));
      mainWindow.webContents.openDevTools();
    } catch (error) {
      console.log('개발 모드: dist 폴더 없음, 로컬 서버 사용');
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    }
  } else {
    // 프로덕션 모드에서는 더 안전한 방식으로 로딩
    try {
      await loadAppFromUserData();
    } catch (error) {
      console.error('앱 로딩 실패, fallback 페이지 표시:', error);
      await showDefaultPage();
    }
  }
}

async function loadAppFromUserData() {
  // 플랫폼별 dist 파일 저장 위치 결정
  const platform = process.platform;
  let userDataDistPath, appDistPath;
  
  if (platform === 'darwin') {
    // macOS: ~/Library/Application Support/recipe/dist
    userDataDistPath = path.join(app.getPath('userData'), 'dist');
    // macOS: 앱 번들 내부의 dist 폴더 (개발 시에는 __dirname/dist)
    if (process.env.NODE_ENV === 'development') {
      appDistPath = path.join(__dirname, 'dist');
    } else {
      // 프로덕션에서는 여러 가능한 경로 시도
      const possiblePaths = [
        path.join(process.resourcesPath, 'app', 'dist'),
        path.join(__dirname, 'dist'),
        path.join(__dirname, '..', 'dist'),
        path.join(__dirname, '..', '..', 'dist')
      ];
      
      // 첫 번째로 존재하는 경로 사용
      for (const possiblePath of possiblePaths) {
        try {
          await fs.access(path.join(possiblePath, 'index.html'));
          appDistPath = possiblePath;
          console.log(`macOS에서 dist 폴더 발견: ${appDistPath}`);
          break;
        } catch (error) {
          console.log(`경로 시도 실패: ${possiblePath}`);
        }
      }
      
      if (!appDistPath) {
        appDistPath = path.join(process.resourcesPath, 'app', 'dist');
      }
    }
  } else if (platform === 'win32') {
    // Windows: %APPDATA%/recipe/dist
    userDataDistPath = path.join(app.getPath('userData'), 'dist');
    // Windows: 앱 설치 경로의 dist 폴더
    appDistPath = process.env.NODE_ENV === 'development'
      ? path.join(__dirname, 'dist')
      : path.join(process.resourcesPath, 'app', 'dist');
  } else {
    // Linux: ~/.config/recipe/dist
    userDataDistPath = path.join(app.getPath('userData'), 'dist');
    appDistPath = process.env.NODE_ENV === 'development'
      ? path.join(__dirname, 'dist')
      : path.join(process.resourcesPath, 'app', 'dist');
  }

  console.log(`플랫폼: ${platform}`);
  console.log(`userData 경로: ${userDataDistPath}`);
  console.log(`앱 dist 경로: ${appDistPath}`);

  // 1. 먼저 userData의 dist 폴더 확인 (업데이트된 파일)
  const userDataIndexPath = path.join(userDataDistPath, 'index.html');

  try {
    await fs.access(userDataIndexPath);
    console.log('업데이트된 dist 파일을 사용합니다.');
    mainWindow.loadFile(userDataIndexPath);
    return;
  } catch (error) {
    console.log('userData에 dist 파일이 없습니다.');
  }

  // 2. 빌드 시 포함된 dist 파일 확인 (기본 파일)
  const appIndexPath = path.join(appDistPath, 'index.html');

  try {
    await fs.access(appIndexPath);
    console.log('빌드 시 포함된 dist 파일을 사용합니다.');
    
    // 파일 내용 확인 (디버깅용)
    try {
      const fileContent = await fs.readFile(appIndexPath, 'utf-8');
      console.log(`index.html 파일 크기: ${fileContent.length} bytes`);
      console.log(`파일 시작 부분: ${fileContent.substring(0, 100)}...`);
    } catch (readError) {
      console.error('파일 읽기 실패:', readError);
    }
    
    // macOS에서 더 안전한 방식으로 로딩
    if (platform === 'darwin') {
      // macOS에서는 data URL 방식 사용 (SIP 문제 방지)
      try {
        const fileContent = await fs.readFile(appIndexPath, 'utf-8');
        const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(fileContent)}`;
        console.log('macOS: data URL 방식으로 로딩');
        mainWindow.loadURL(dataUrl);
      } catch (readError) {
        console.error('파일 읽기 실패, fallback 사용:', readError);
        mainWindow.loadFile(appIndexPath);
      }
    } else {
      // Windows/Linux에서는 기존 방식 사용
      console.log('Windows/Linux: loadFile 방식으로 로딩');
      mainWindow.loadFile(appIndexPath);
    }
    
    // 기본 파일을 userData에 복사하여 다음 실행 시 사용
    try {
      await fs.mkdir(userDataDistPath, { recursive: true });
      await copyDirectory(appDistPath, userDataDistPath);
      console.log('기본 dist 파일을 userData에 복사했습니다.');
    } catch (copyError) {
      console.error('기본 dist 파일 복사 실패:', copyError);
    }
    
    return;
  } catch (error) {
    console.log('빌드 시 포함된 dist 파일도 없습니다. 기본 페이지를 표시합니다.');
    console.error('파일 접근 오류:', error);
  }

  // 3. 모든 dist 파일이 없는 경우 기본 페이지 표시
  await showDefaultPage();
}

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

    req.on('error', (error) => {
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
  try {
    // 간단한 기본 HTML 페이지 생성
    const defaultHTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>레시피 관리 앱</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            color: #fff;
        }
        .subtitle {
            font-size: 1.2em;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .message {
            font-size: 1.1em;
            margin-bottom: 30px;
            line-height: 1.6;
            max-width: 500px;
        }
        .button {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 1.1em;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        .button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        .icon {
            font-size: 4em;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🍳</div>
        <h1>그리고 밤은 되살아난다</h1>
        <div class="subtitle">레시피 관리 앱</div>
        <div class="message">
            앱이 처음 실행되었습니다.<br>
            GitHub에서 최신 버전을 다운로드하여 완전한 기능을 사용할 수 있습니다.
        </div>
        <button class="button" onclick="checkForUpdates()">업데이트 확인</button>
        <br><br>
        <button class="button" onclick="openGitHub()">GitHub 방문</button>
    </div>
    
    <script>
        function checkForUpdates() {
            // Electron의 업데이트 체크 함수 호출
            if (window.electronAPI) {
                window.electronAPI.checkForUpdates();
            } else {
                alert('업데이트 기능을 사용할 수 없습니다.');
            }
        }
        
        function openGitHub() {
            if (window.electronAPI) {
                window.electronAPI.openExternal('https://github.com/aiden-flo-fe/nightreborn');
            } else {
                window.open('https://github.com/aiden-flo-fe/nightreborn', '_blank');
        }
        }
    </script>
</body>
</html>`;

    // 임시 HTML 파일 생성
    const tempDir = path.join(app.getPath('temp'), 'recipe-app');
    await fs.mkdir(tempDir, { recursive: true });
    const tempHTMLPath = path.join(tempDir, 'default.html');
    await fs.writeFile(tempHTMLPath, defaultHTML);
    
    mainWindow.loadFile(tempHTMLPath);
    
    // 기본 페이지에서 업데이트 체크 시도
    setTimeout(() => {
      checkForUpdates();
    }, 2000);
    
  } catch (error) {
    console.error('기본 페이지 생성 실패:', error);
    // 오류 발생 시 간단한 메시지 표시
    mainWindow.loadURL('data:text/html,<html><body><h1>레시피 관리 앱</h1><p>앱을 초기화하는 중입니다...</p></body></html>');
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

// Electron 앱 이벤트
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // 앱 로드 후 업데이트 체크
  setTimeout(() => {
    checkForUpdates();
  }, 3000); // 3초 후 체크
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
