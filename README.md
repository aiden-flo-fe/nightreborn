# 🍳 레시피 관리 앱

식당용 레시피 관리 웹앱입니다. React + TypeScript로 구현되었으며, 모든 데이터는 브라우저의 localStorage에 저장됩니다.

## ✨ 주요 기능

- **레시피 관리**: 레시피 추가, 수정, 삭제
- **카테고리 시스템**: 카테고리별 레시피 정리 및 관리
- **인분 계산**: 레시피 상세보기에서 인분별 재료량 자동 계산
- **드래그앤드롭**: 카테고리 및 레시피 순서 정렬
- **사진 업로드**: 레시피 사진을 Base64로 저장
- **데이터 지속성**: localStorage를 통한 데이터 저장

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: styled-components
- **Drag & Drop**: @dnd-kit
- **Linting**: ESLint, Prettier
- **Data Storage**: localStorage
- **Desktop App**: Electron (자동 업데이트 지원)

## 📱 컴포넌트 구조

```
src/
├── components/
│   ├── common/           # 재사용 가능한 공통 컴포넌트
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── Input/
│   │   └── DraggableList/
│   ├── layout/           # 레이아웃 컴포넌트
│   │   ├── App/
│   │   ├── Header/
│   │   └── Content/
│   ├── recipe/           # 레시피 관련 컴포넌트
│   │   ├── RecipeList/
│   │   ├── RecipeCard/
│   │   ├── AddRecipeModal/
│   │   └── RecipeDetailModal/
│   └── category/         # 카테고리 관련 컴포넌트
│       └── CategorySettingsModal/
├── types/               # TypeScript 타입 정의
├── utils/               # 유틸리티 함수들
└── ...
```

## 🚀 시작하기

### 필요 조건

- Node.js 20.19+ 또는 22.12+
- npm 또는 yarn

### 웹앱 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 빌드
npm run build

# 빌드된 파일 미리보기
npm run preview
```

### Electron 데스크톱 앱

```bash
# 의존성 설치
npm install

# Electron 개발 모드 (웹앱과 Electron 동시 실행)
npm run electron-dev

# 프로덕션용 Electron 앱 빌드
npm run electron-build

# 배포용 실행파일 생성 (Windows)
npm run dist
```

## 📋 데이터 모델

### Category
```typescript
{
  id: string;        // UUID
  name: string;      // 카테고리 이름
  order: number;     // 표시 순서
}
```

### Recipe
```typescript
{
  id: string;           // UUID
  title: string;        // 레시피 제목
  photo?: string;       // Base64 이미지
  categoryId: string | null;
  ingredients: Ingredient[];  // 재료 목록 (1인분 기준)
  order: number;        // 카테고리 내 순서
  createdAt: string;
  updatedAt?: string;
}
```

### Ingredient
```typescript
{
  id: string;              // UUID
  name: string;            // 재료명
  amountNumber: number | null;  // 양 (숫자 부분)
  amountUnit: string | null;    // 단위 (텍스트 부분)
}
```

## 💡 주요 특징

### 1. 인분별 재료량 자동 계산
- 레시피 상세보기에서 인분수를 변경하면 모든 재료의 양이 비례적으로 계산됩니다.
- 예: "설탕 1큰술" → 2인분 시 "설탕 2큰술"

### 2. 스마트 재료량 파싱
- "1.5큰술", "2컵" 등의 입력을 숫자와 단위로 자동 분리
- 숫자가 없는 경우 "적당히", "조금" 등도 지원

### 3. 드래그앤드롭 정렬
- @dnd-kit을 사용한 직관적인 순서 변경
- 카테고리 순서 및 카테고리 내 레시피 순서 조정 가능

### 4. 컴포넌트 분리 원칙
- 각 컴포넌트는 .tsx, .styled.ts, .types.ts 파일로 분리
- 재사용성과 유지보수성 고려

### 5. Electron 자동 업데이트
- 앱 실행 시 GitHub Release API를 통해 최신 버전 확인
- 새 버전 발견 시 사용자에게 업데이트 옵션 제공
- dist.zip만 다운로드하여 앱 내부 업데이트 (실행파일 교체 없음)

## 🖥️ Electron 앱 특징

### 자동 업데이트 시스템
1. 앱 시작 시 GitHub Release에서 최신 버전 확인
2. 업데이트 가능 시 사용자에게 선택권 제공
3. 동의 시 dist.zip 다운로드 및 자동 설치
4. 앱 재시작으로 업데이트 완료

### 배포 방식
- **태그 푸시 시 자동 배포**: `git tag v1.0.0 && git push origin v1.0.0`
- **GitHub Actions**로 자동 빌드 및 Release 생성
- **Windows용 .exe 파일** 및 **웹용 dist.zip** 동시 제공

### 파일 구조
```
electron-dist/          # Electron 빌드 결과물
├── recipe-setup.exe    # Windows 설치 프로그램
└── ...

userData/               # 앱 데이터 폴더 (사용자별)
├── dist/              # 웹앱 파일들 (업데이트 대상)
└── version.txt        # 현재 버전 정보
```

## 🔧 개발 시 주의사항

### 이미지 저장
- 이미지는 Base64로 변환되어 localStorage에 저장됩니다.
- localStorage 용량 제한(보통 5-10MB)을 고려하여 이미지 크기를 조절하세요.

### 브라우저 호환성
- localStorage를 지원하는 모든 모던 브라우저에서 동작합니다.
- IE는 지원하지 않습니다.

### Electron 앱 개발 시
- `main.cjs`는 CommonJS 형식으로 작성되어 있습니다.
- 아이콘 파일들을 `assets/` 폴더에 배치하세요.
- 개발 시에는 `npm run electron-dev`로 Hot Reload 사용 가능합니다.

## 🚀 배포 방법

### 1. 태그 생성 및 푸시
```bash
# 새 버전 태그 생성
git tag v1.0.0

# GitHub에 태그 푸시
git push origin v1.0.0
```

### 2. 자동 배포
- GitHub Actions가 자동으로 실행됩니다
- React 앱 빌드 → dist.zip 생성
- Windows용 Electron 앱 빌드 → .exe 파일 생성
- GitHub Release에 파일들 업로드

## 📄 라이선스

이 프로젝트는 개인용으로 제작되었습니다.

---

**개발자 노트**: 이 앱은 식당에서 사용하기 위해 설계되었으며, 모든 데이터가 로컬에 저장되어 인터넷 연결 없이도 사용할 수 있습니다.