식당용 레시피 앱 Electron 패키징 및 자동 업데이트 배포 요청서

⸻

요약

React + TypeScript로 개발된 레시피 관리 웹앱을 Electron으로 패키징하여 Windows 실행파일(.exe) 형태로 배포한다. 서버는 따로 두지 않고, 앱 내부에서 dist 빌드 결과물을 로컬 파일로 로드한다. 업데이트가 필요할 때는 실행파일 자체를 교체하지 않고, GitHub Release에 업로드된 dist.zip을 다운로드하여 로컬 userData/dist 폴더에 덮어쓰는 방식으로 자동 업데이트를 구현한다.

⸻

요구사항

기본 앱
	•	React로 빌드된 dist/index.html을 Electron에서 로딩.
	•	Electron 앱 실행 시:
	•	GitHub Release API에서 최신 태그(tag_name)를 확인.
	•	현재 로컬 저장된 버전(version.txt)과 비교.
	•	새 버전이 있으면 “새 버전이 있습니다. 지금 업데이트하시겠습니까?” 선택창 노출.
	•	사용자가 동의하면:
	•	GitHub Release에 업로드된 dist.zip 다운로드.
	•	압축 해제 후 userData/dist에 덮어쓰기.
	•	version.txt 최신 버전으로 갱신.
	•	“업데이트가 완료되었습니다. 앱이 다시 시작됩니다.” 알림 후 자동 재시작.
	•	사용자가 거부하면 기존 버전 그대로 실행.

Electron 주요 코드 (main.js)
	•	GitHub Release API 호출 → 최신 버전 및 dist.zip 다운로드 URL 획득.
	•	업데이트 로직 수행 후 app.relaunch() 로 앱 재시작.
	•	실행 시 로컬 userData/dist/index.html 로드.

GitHub Repository
	•	주소: https://github.com/aiden-flo-fe/nightreborn.git
	•	Release에 업로드할 파일: dist.zip
	•	구조 예시:

dist/
  index.html
  assets/... (React 빌드 결과물)



⸻

GitHub Actions Release 워크플로우

React 프로젝트의 dist/ 결과물을 자동으로 압축(dist.zip)하고, GitHub Release에 업로드한다.

.github/workflows/release.yml

name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  build-and-release:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Build React app
        run: npm run build

      - name: Create dist.zip
        run: |
          cd dist
          zip -r ../dist.zip .

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist.zip
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}


⸻

개발자 지침
	•	React → Vite 빌드 결과물은 반드시 dist/ 폴더에 생성.
	•	태그(git tag v1.0.0 && git push origin v1.0.0)를 푸시하면 위 워크플로우가 실행되고, Release에 dist.zip이 자동 업로드됨.
	•	Electron 앱은 실행 시 Release API를 통해 최신 태그(tag_name)와 dist.zip을 다운로드받아 업데이트를 수행.

⸻

최종 목표
	•	Windows 용 실행파일(.exe)을 배포.
	•	exe 자체는 고정 유지.
	•	GitHub Release를 통해 React 빌드 산출물(dist/)만 교체 업데이트.
	•	사용자 경험: 실행 시 새 버전이 있으면 “업데이트하시겠습니까?” → 다운로드 → 자동 재시작.

⸻

끝.