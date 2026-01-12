# My Team Radar

팀 시너지 분석 서비스 - 크루 간의 다름을 데이터로 이해하고, 팀워크의 잠재력을 극대화하는 아이스브레이킹 도구

## 주요 기능

### 1. 팀 대시보드 및 크루 등록
- 크루 이름, 성향 타입, 직군 입력
- **성향 타입:** 스피드 레이서, 딥 다이버, 슈퍼 커넥터, 피스 메이커
- **직군:** 개발자, 기획자, 디자이너, 인사(HR), 마케팅

### 2. 5대 시너지 지표 레이더 차트
팀 전체의 역량을 5가지 핵심 지표로 시각화
- 실행력(SPD)
- 정밀도(DET)
- 소통력(COM)
- 조율력(HAR)
- 창의성(CRE)

### 3. AI 시너지 리포트
- OpenAI를 활용한 팀 페르소나 생성
- 팀의 강점 분석 및 개선점 제언

### 4. 오늘의 베스트 듀오
- 팀 내 최고의 시너지 조합 매칭
- AI 기반 아이스브레이킹 미션 추천

## 기술 스택

- **Frontend:** Next.js 16, React 19, TypeScript
- **UI:** Tailwind CSS, Radix UI, Framer Motion
- **Chart:** Chart.js, react-chartjs-2
- **AI:** OpenAI API (gpt-4o-mini)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 OpenAI API 키를 입력하세요:

```
OPENAI_API_KEY=sk-your-api-key-here
```

API 키는 https://platform.openai.com/api-keys 에서 발급받을 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 데이터 로직

### 성향별 기본 스탯

| 캐릭터 타입 | SPD | DET | COM | HAR | CRE |
|------------|-----|-----|-----|-----|-----|
| 스피드 레이서 | 10 | 3 | 6 | 4 | 7 |
| 딥 다이버 | 3 | 10 | 4 | 6 | 7 |
| 슈퍼 커넥터 | 7 | 4 | 10 | 6 | 8 |
| 피스 메이커 | 4 | 6 | 7 | 10 | 3 |

### 직군별 보너스

| 직군 | 보너스 |
|------|--------|
| 개발자 | DET +3, SPD +2 |
| 기획자 | DET +2, COM +3 |
| 디자이너 | CRE +4, DET +1 |
| 인사(HR) | HAR +4, COM +1 |
| 마케팅 | COM +3, SPD +2 |

## API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/stats` | POST | 레이더 차트 데이터 조회 |
| `/api/analyze` | POST | AI 시너지 리포트 생성 |
| `/api/recommend` | POST | 베스트 듀오 추천 |

## 배포

Netlify 또는 Vercel에서 배포할 수 있습니다.

### 환경 변수 설정

배포 플랫폼의 Environment Variables에 다음을 추가하세요:

- `OPENAI_API_KEY`: OpenAI API 키

## 라이선스

MIT License
