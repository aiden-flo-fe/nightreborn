#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ICON_SOURCE = 'build/icon/512x512.png';
const ICON_DIR = 'build/icon';

console.log('🚀 자동 아이콘 빌드 시작...');
console.log('========================');

// 소스 아이콘 파일 확인
if (!fs.existsSync(ICON_SOURCE)) {
  console.error('❌ 소스 아이콘 파일을 찾을 수 없습니다: ' + ICON_SOURCE);
  console.log('assets/icon/512x512.png 파일을 준비해주세요.');
  process.exit(1);
}

console.log('✅ 소스 아이콘 파일 발견: ' + ICON_SOURCE);

// macOS용 .icns 파일 생성
async function createMacIcon() {
  try {
    console.log('\n🍎 macOS 아이콘 생성 중...');

    // iconset 폴더 생성
    const iconsetDir = 'icon.iconset';
    if (fs.existsSync(iconsetDir)) {
      execSync(`rm -rf ${iconsetDir}`);
    }
    execSync(`mkdir -p ${iconsetDir}`);

    // 다양한 해상도로 리사이즈
    const sizes = [
      { size: 16, name: 'icon_16x16.png' },
      { size: 32, name: 'icon_16x16@2x.png' },
      { size: 32, name: 'icon_32x32.png' },
      { size: 64, name: 'icon_32x32@2x.png' },
      { size: 128, name: 'icon_128x128.png' },
      { size: 256, name: 'icon_128x128@2x.png' },
      { size: 256, name: 'icon_256x256.png' },
      { size: 512, name: 'icon_256x256@2x.png' },
      { size: 512, name: 'icon_512x512.png' },
      { size: 1024, name: 'icon_512x512@2x.png' },
    ];

    for (const { size, name } of sizes) {
      const outputPath = path.join(iconsetDir, name);
      execSync(
        `sips -z ${size} ${size} "${ICON_SOURCE}" --out "${outputPath}"`
      );
      console.log(`  ✅ ${size}x${size} → ${name}`);
    }

    // .icns 파일 생성
    const icnsPath = path.join(ICON_DIR, 'icon.icns');
    execSync(`iconutil -c icns ${iconsetDir} -o "${icnsPath}"`);
    console.log(`  ✅ icon.icns 생성 완료`);

    // 임시 폴더 정리
    execSync(`rm -rf ${iconsetDir}`);

    return true;
  } catch (error) {
    console.error('❌ macOS 아이콘 생성 실패:', error.message);
    return false;
  }
}

// Linux용 .png 파일 생성
async function createLinuxIcon() {
  try {
    console.log('\n🐧 Linux 아이콘 생성 중...');

    const outputPath = path.join(ICON_DIR, 'icon.png');
    execSync(`cp "${ICON_SOURCE}" "${outputPath}"`);
    console.log(`  ✅ icon.png 생성 완료`);

    return true;
  } catch (error) {
    console.error('❌ Linux 아이콘 생성 실패:', error.message);
    return false;
  }
}

// Windows용 .ico 파일 생성 (macOS에서 가능한 경우)
async function createWindowsIcon() {
  try {
    console.log('\n🪟 Windows 아이콘 생성 중...');

    // ImageMagick이 있는지 확인
    try {
      execSync('which convert', { stdio: 'ignore' });

      const outputPath = path.join(ICON_DIR, 'icon.ico');
      execSync(
        `convert "${ICON_SOURCE}" -define icon:auto-resize=256,128,64,48,32,16 "${outputPath}"`
      );
      console.log(`  ✅ icon.ico 생성 완료`);
      return true;
    } catch (error) {
      console.log(
        `  ⚠️  ImageMagick이 설치되지 않았습니다. 수동으로 변환해주세요:`
      );
      console.log(`     온라인 변환: https://cloudconvert.com/png-to-ico`);
      console.log(`     저장 위치: ${path.join(ICON_DIR, 'icon.ico')}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Windows 아이콘 생성 실패:', error.message);
    return false;
  }
}

// 메인 실행 함수
async function main() {
  console.log('📁 아이콘 디렉토리 확인 중...');

  // assets/icon 폴더가 없으면 생성
  if (!fs.existsSync(ICON_DIR)) {
    execSync(`mkdir -p ${ICON_DIR}`);
    console.log(`✅ ${ICON_DIR} 폴더 생성됨`);
  }

  // 각 플랫폼별 아이콘 생성
  const results = await Promise.all([
    createMacIcon(),
    createLinuxIcon(),
    createWindowsIcon(),
  ]);

  console.log('\n📊 아이콘 생성 결과:');
  console.log('========================');

  const platforms = ['macOS', 'Linux', 'Windows'];
  results.forEach((success, index) => {
    const status = success ? '✅' : '❌';
    console.log(`${status} ${platforms[index]}: ${success ? '성공' : '실패'}`);
  });

  // 최종 상태 확인
  const iconFiles = {
    macOS: path.join(ICON_DIR, 'icon.icns'),
    Windows: path.join(ICON_DIR, 'icon.ico'),
    Linux: path.join(ICON_DIR, 'icon.png'),
  };

  console.log('\n📁 생성된 아이콘 파일들:');
  Object.entries(iconFiles).forEach(([platform, filePath]) => {
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${platform}: ${filePath}`);
  });

  const allReady = results.every(Boolean);

  if (allReady) {
    console.log('\n🎉 모든 아이콘이 성공적으로 생성되었습니다!');
    console.log(
      '이제 npm run electron-build를 실행하여 앱을 빌드할 수 있습니다.'
    );
  } else {
    console.log('\n⚠️  일부 아이콘 생성에 실패했습니다.');
    console.log('실패한 아이콘은 수동으로 생성해주세요.');
  }

  console.log('\n✨ 자동 아이콘 빌드 완료!');
}

// 스크립트 실행
main().catch(error => {
  console.error('❌ 스크립트 실행 중 오류 발생:', error);
  process.exit(1);
});
