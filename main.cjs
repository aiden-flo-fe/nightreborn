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
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // 아이콘이 있다면
  });

  // 개발 모드에서는 로컬 서버, 프로덕션에서는 로컬 파일
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    await loadAppFromUserData();
  }
}

async function loadAppFromUserData() {
  const userDataPath = app.getPath('userData');
  const distPath = path.join(userDataPath, 'dist');
  const indexPath = path.join(distPath, 'index.html');

  try {
    await fs.access(indexPath);
    mainWindow.loadFile(indexPath);
  } catch (error) {
    console.log('로컬 dist 파일이 없습니다. 초기 설치를 진행합니다.');
    await downloadInitialVersion();
  }
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
    }
  } catch (error) {
    console.error('업데이트 확인 중 오류:', error);
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
          resolve(release.tag_name?.replace('v', ''));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('요청 시간 초과'));
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

async function downloadInitialVersion() {
  try {
    const latestVersion = await getLatestVersionFromGitHub();
    if (latestVersion) {
      await performUpdate(latestVersion, true);
    } else {
      throw new Error('초기 버전을 가져올 수 없습니다.');
    }
  } catch (error) {
    console.error('초기 설치 실패:', error);
    dialog.showErrorBox(
      '초기 설치 실패',
      '앱을 초기화할 수 없습니다.\n네트워크 연결을 확인해주세요.'
    );
    app.quit();
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
