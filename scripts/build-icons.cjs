#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ICON_SOURCE = 'build/icon/512x512.png';
const ICON_DIR = 'build/icon';

function checkSourceIcon() {
  if (!fs.existsSync(ICON_SOURCE)) {
    console.error('❌ 소스 아이콘 파일을 찾을 수 없습니다: ' + ICON_SOURCE);
    console.log('\n📋 다음 단계를 수행해주세요:');
    console.log('1. 512x512 크기의 PNG 아이콘 파일을 준비');
    console.log('2. 파일을 다음 경로에 저장: ' + ICON_SOURCE);
    console.log('3. npm run build-icons 다시 실행');
    console.log('\n💡 권장사항:');
    console.log('- 투명 배경');
    console.log('- 정사각형 비율');
    console.log('- 단순하고 명확한 디자인');
    return false;
  }
  return true;
}

function createIconInstructions() {
  console.log('🎨 아이콘 변환 가이드');
  console.log('===================');

  if (checkSourceIcon()) {
    console.log('✅ 소스 아이콘 파일 발견: ' + ICON_SOURCE);
    console.log('\n📦 다음 아이콘 파일들을 생성해주세요:');
  } else {
    return;
  }

  console.log('\n🍎 macOS용 (.icns):');
  console.log('- 온라인 변환: https://cloudconvert.com/png-to-icns');
  console.log('- 저장 위치: build/icon/icon.icns');

  console.log('\n🪟 Windows용 (.ico):');
  console.log('- 온라인 변환: https://cloudconvert.com/png-to-ico');
  console.log('- 저장 위치: build/icon/icon.ico');

  console.log('\n🐧 Linux용 (.png):');
  console.log('- 원본 파일을 복사하거나 512x512로 리사이즈');
  console.log('- 저장 위치: build/icon/512x512.png');

  console.log('\n🚀 macOS에서 자동 변환 (iconutil 사용):');
  console.log('mkdir icon.iconset');
  console.log(
    'sips -z 16 16 ' + ICON_SOURCE + ' --out icon.iconset/icon_16x16.png'
  );
  console.log(
    'sips -z 32 32 ' + ICON_SOURCE + ' --out icon.iconset/icon_16x16@2x.png'
  );
  console.log(
    'sips -z 32 32 ' + ICON_SOURCE + ' --out icon.iconset/icon_32x32.png'
  );
  console.log(
    'sips -z 64 64 ' + ICON_SOURCE + ' --out icon.iconset/icon_32x32@2x.png'
  );
  console.log(
    'sips -z 128 128 ' + ICON_SOURCE + ' --out icon.iconset/icon_128x128.png'
  );
  console.log(
    'sips -z 256 256 ' + ICON_SOURCE + ' --out icon.iconset/icon_128x128@2x.png'
  );
  console.log(
    'sips -z 256 256 ' + ICON_SOURCE + ' --out icon.iconset/icon_256x256.png'
  );
  console.log(
    'sips -z 512 512 ' + ICON_SOURCE + ' --out icon.iconset/icon_256x256@2x.png'
  );
  console.log(
    'sips -z 512 512 ' + ICON_SOURCE + ' --out icon.iconset/icon_512x512.png'
  );
  console.log(
    'sips -z 1024 1024 ' +
      ICON_SOURCE +
      ' --out icon.iconset/icon_512x512@2x.png'
  );
  console.log('iconutil -c icns icon.iconset -o build/icon/icon.icns');
  console.log('rm -rf icon.iconset');
}

// 현재 상태 확인
function checkIconStatus() {
  const icons = {
    source: ICON_SOURCE,
    macOS: path.join(ICON_DIR, 'icon.icns'),
    windows: path.join(ICON_DIR, 'icon.ico'),
    linux: path.join(ICON_DIR, 'icon.png'),
  };

  console.log('\n📊 아이콘 파일 상태:');
  Object.entries(icons).forEach(([platform, filePath]) => {
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${platform}: ${filePath}`);
  });

  const allReady = Object.values(icons).every(fs.existsSync);

  if (allReady) {
    console.log('\n🎉 모든 아이콘 파일이 준비되었습니다!');
    console.log(
      '이제 npm run electron-build를 실행하여 앱을 빌드할 수 있습니다.'
    );
  } else {
    console.log('\n⚠️  일부 아이콘 파일이 누락되었습니다.');
  }
}

// 메인 실행
createIconInstructions();
checkIconStatus();
