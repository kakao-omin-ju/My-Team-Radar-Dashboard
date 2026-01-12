// 캐릭터 타입
export type CharacterType = "speed-racer" | "deep-diver" | "super-connector" | "peace-maker";

// 직군 타입
export type JobRole = "developer" | "planner" | "designer" | "hr" | "marketing";

// 스탯 타입
export interface Stats {
  SPD: number; // 실행력
  DET: number; // 정밀도
  COM: number; // 소통력
  HAR: number; // 조율력
  CRE: number; // 창의성
}

// 크루 인터페이스
export interface Crew {
  id: string;
  name: string;
  characterType: CharacterType;
  jobRole: JobRole;
  stats: Stats;
}

// 성향별 기본 스탯
export const CHARACTER_STATS: Record<CharacterType, Stats> = {
  "speed-racer": { SPD: 10, DET: 3, COM: 6, HAR: 4, CRE: 7 },
  "deep-diver": { SPD: 3, DET: 10, COM: 4, HAR: 6, CRE: 7 },
  "super-connector": { SPD: 7, DET: 4, COM: 10, HAR: 6, CRE: 8 },
  "peace-maker": { SPD: 4, DET: 6, COM: 7, HAR: 10, CRE: 3 },
};

// 직군별 보너스 가중치
export const JOB_BONUS: Record<JobRole, Partial<Stats>> = {
  developer: { DET: 3, SPD: 2 },
  planner: { DET: 2, COM: 3 },
  designer: { CRE: 4, DET: 1 },
  hr: { HAR: 4, COM: 1 },
  marketing: { COM: 3, SPD: 2 },
};

// 캐릭터 타입 한글명
export const CHARACTER_NAMES: Record<CharacterType, string> = {
  "speed-racer": "스피드 레이서",
  "deep-diver": "딥 다이버",
  "super-connector": "슈퍼 커넥터",
  "peace-maker": "피스 메이커",
};

// 직군 한글명
export const JOB_NAMES: Record<JobRole, string> = {
  developer: "개발자",
  planner: "기획자",
  designer: "디자이너",
  hr: "인사",
  marketing: "마케팅",
};

// 스탯 한글명
export const STAT_NAMES: Record<keyof Stats, string> = {
  SPD: "실행력",
  DET: "정밀도",
  COM: "소통력",
  HAR: "조율력",
  CRE: "창의성",
};

// 팀 등급 계산
export function calculateTeamGrade(avgStat: number): string {
  if (avgStat >= 12) return "SSS";
  if (avgStat >= 11) return "SS";
  if (avgStat >= 10) return "S";
  if (avgStat >= 9) return "A";
  if (avgStat >= 8) return "B";
  return "C";
}
