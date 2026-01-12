import {
  Crew,
  Stats,
  CharacterType,
  JobRole,
  CHARACTER_STATS,
  JOB_BONUS,
  STAT_NAMES,
  calculateTeamGrade,
} from "./constants";

// 크루의 최종 스탯 계산 (성향 + 직군 보너스)
export function calculateCrewStats(characterType: CharacterType, jobRole: JobRole): Stats {
  const baseStats = { ...CHARACTER_STATS[characterType] };
  const bonus = JOB_BONUS[jobRole];

  for (const [key, value] of Object.entries(bonus)) {
    baseStats[key as keyof Stats] += value;
  }

  return baseStats;
}

// 팀 평균 스탯 계산
export function calculateTeamStats(crews: Crew[]): Stats {
  if (crews.length === 0) {
    return { SPD: 0, DET: 0, COM: 0, HAR: 0, CRE: 0 };
  }

  const total = crews.reduce(
    (acc, crew) => {
      acc.SPD += crew.stats.SPD;
      acc.DET += crew.stats.DET;
      acc.COM += crew.stats.COM;
      acc.HAR += crew.stats.HAR;
      acc.CRE += crew.stats.CRE;
      return acc;
    },
    { SPD: 0, DET: 0, COM: 0, HAR: 0, CRE: 0 }
  );

  return {
    SPD: Math.round((total.SPD / crews.length) * 10) / 10,
    DET: Math.round((total.DET / crews.length) * 10) / 10,
    COM: Math.round((total.COM / crews.length) * 10) / 10,
    HAR: Math.round((total.HAR / crews.length) * 10) / 10,
    CRE: Math.round((total.CRE / crews.length) * 10) / 10,
  };
}

// 레이더 차트용 데이터 생성
export function generateRadarData(stats: Stats) {
  return [
    { metric: STAT_NAMES.SPD, value: stats.SPD, fullMark: 15 },
    { metric: STAT_NAMES.DET, value: stats.DET, fullMark: 15 },
    { metric: STAT_NAMES.COM, value: stats.COM, fullMark: 15 },
    { metric: STAT_NAMES.HAR, value: stats.HAR, fullMark: 15 },
    { metric: STAT_NAMES.CRE, value: stats.CRE, fullMark: 15 },
  ];
}

// 팀 전체 스탯 정보 생성
export function generateTeamStatsResponse(crews: Crew[]) {
  const teamStats = calculateTeamStats(crews);
  const avgTotal = Object.values(teamStats).reduce((a, b) => a + b, 0) / 5;
  const teamGrade = calculateTeamGrade(avgTotal);

  return {
    teamSize: crews.length,
    stats: teamStats,
    radarData: generateRadarData(teamStats),
    teamGrade,
    avgTotal: Math.round(avgTotal * 10) / 10,
  };
}

// 베스트 듀오 찾기 (상보적 매칭 알고리즘)
export function findBestDuo(crews: Crew[]): { duo: [Crew, Crew]; synergyScore: number } | null {
  if (crews.length < 2) return null;

  let bestDuo: [Crew, Crew] | null = null;
  let bestScore = -Infinity;

  for (let i = 0; i < crews.length; i++) {
    for (let j = i + 1; j < crews.length; j++) {
      const crew1 = crews[i];
      const crew2 = crews[j];

      // 시너지 점수 계산
      // 1. 조화 점수: HAR + COM
      const harmonyScore = crew1.stats.HAR + crew2.stats.HAR + crew1.stats.COM + crew2.stats.COM;

      // 2. 상보 점수: 서로의 약점을 보완하는지
      const stats1 = Object.entries(crew1.stats);
      const stats2 = Object.entries(crew2.stats);

      let complementScore = 0;
      for (const [key, val1] of stats1) {
        const val2 = crew2.stats[key as keyof Stats];
        // 한 쪽이 낮고 다른 쪽이 높으면 상보적
        complementScore += Math.abs(val1 - val2);
      }

      const totalScore = harmonyScore * 2 + complementScore;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestDuo = [crew1, crew2];
      }
    }
  }

  return bestDuo ? { duo: bestDuo, synergyScore: Math.round(bestScore) } : null;
}
