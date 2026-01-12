import { Crew, Stats, CHARACTER_NAMES, JOB_NAMES, STAT_NAMES } from "./constants";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callOpenAI(messages: OpenAIMessage[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.");
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.95,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API 오류: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 팀 분석 리포트 생성
export async function generateTeamAnalysis(
  crews: Crew[],
  teamStats: Stats,
  teamGrade: string
): Promise<{
  persona: string;
  strengths: string[];
  improvements: string[];
}> {
  const crewSummary = crews
    .map((c) => `- ${c.name}: ${CHARACTER_NAMES[c.characterType]} (${JOB_NAMES[c.jobRole]})`)
    .join("\n");

  const statsSummary = Object.entries(teamStats)
    .map(([key, val]) => `${STAT_NAMES[key as keyof Stats]}: ${val}`)
    .join(", ");

  // 스탯 분석
  const sortedStats = Object.entries(teamStats)
    .map(([key, val]) => ({ name: STAT_NAMES[key as keyof Stats], value: val }))
    .sort((a, b) => b.value - a.value);

  const topStat = sortedStats[0];
  const bottomStat = sortedStats[sortedStats.length - 1];

  // 직군 분포
  const jobCounts = crews.reduce((acc, c) => {
    acc[JOB_NAMES[c.jobRole]] = (acc[JOB_NAMES[c.jobRole]] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const jobDistribution = Object.entries(jobCounts)
    .map(([job, count]) => `${job} ${count}명`)
    .join(", ");

  // 성향 분포
  const typeCounts = crews.reduce((acc, c) => {
    acc[CHARACTER_NAMES[c.characterType]] = (acc[CHARACTER_NAMES[c.characterType]] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const typeDistribution = Object.entries(typeCounts)
    .map(([type, count]) => `${type} ${count}명`)
    .join(", ");

  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: `당신은 위트있고 창의적인 팀 시너지 분석가입니다. 매번 완전히 새롭고 독특한 분석을 제공합니다.

규칙:
1. 페르소나 이름은 팀의 특성을 반영한 독창적인 별명으로 (예: "새벽을 여는 코드 연금술사들", "감성 충만 픽셀 수호대", "번개같은 아이디어 폭격기")
2. 강점은 팀 구성과 스탯을 구체적으로 언급하며 작성
3. 개선점은 실제로 도움이 될 실용적인 조언으로
4. 이전에 했던 분석과 절대 같은 표현을 쓰지 마세요
5. 한국 스타트업/IT 회사 문화에 맞는 유쾌한 톤으로

반드시 아래 JSON 형식으로만 응답:
{
  "persona": "창의적인 팀 별명",
  "strengths": ["구체적 강점1", "구체적 강점2", "구체적 강점3"],
  "improvements": ["실용적 개선점1", "실용적 개선점2"]
}`,
    },
    {
      role: "user",
      content: `🎯 팀 분석 요청

👥 팀원 (${crews.length}명):
${crewSummary}

📊 직군 분포: ${jobDistribution}
🎭 성향 분포: ${typeDistribution}

📈 팀 평균 스탯:
${statsSummary}

💪 가장 높은 스탯: ${topStat.name} (${topStat.value})
📉 가장 낮은 스탯: ${bottomStat.name} (${bottomStat.value})

🏆 팀 등급: ${teamGrade}

이 팀만의 독특한 시너지를 분석해주세요!`,
    },
  ];

  const response = await callOpenAI(messages);

  try {
    // JSON 파싱 시도
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("JSON 형식이 아닙니다.");
  } catch {
    // 파싱 실패 시 기본값 반환
    return {
      persona: "시너지 탐험가들",
      strengths: [
        "다양한 역량을 갖춘 균형 잡힌 팀",
        "서로 다른 관점으로 문제 해결 가능",
        "유연한 협업 스타일",
      ],
      improvements: [
        "팀 내 역할 분담 명확화 필요",
        "정기적인 소통 시간 확보 권장",
      ],
    };
  }
}

// 듀오 시너지 분석 및 미션 생성
export async function generateDuoAnalysis(
  crew1: Crew,
  crew2: Crew
): Promise<{
  synergyReason: string;
  mission: string;
}> {
  // 두 크루의 스탯 비교
  const crew1TopStat = Object.entries(crew1.stats).sort(([, a], [, b]) => b - a)[0];
  const crew2TopStat = Object.entries(crew2.stats).sort(([, a], [, b]) => b - a)[0];

  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: `당신은 유쾌하고 창의적인 팀 케미 분석가입니다. 두 사람의 조합을 재미있게 분석하고 독특한 미션을 제안합니다.

규칙:
1. 시너지 분석은 두 사람의 성향과 직군을 구체적으로 언급하며 케미를 설명
2. 미션은 10-15분 안에 할 수 있는 구체적이고 재미있는 활동
3. 미션 카테고리 랜덤 선택: 카페 탐방, 간단한 게임, 사진 찍기, 간식 나누기, 산책, 퀴즈, 취미 공유 등
4. 매번 완전히 다른 미션을 제안하세요
5. 한국 회사 문화에 맞는 현실적인 미션으로

반드시 아래 JSON 형식으로만 응답:
{
  "synergyReason": "두 사람의 케미 분석 (재미있고 구체적으로 2-3문장)",
  "mission": "구체적인 아이스브레이킹 미션 (장소, 시간, 방법 포함)"
}`,
    },
    {
      role: "user",
      content: `💫 베스트 듀오 케미 분석 요청!

🧑 첫 번째 크루: ${crew1.name}
- 성향: ${CHARACTER_NAMES[crew1.characterType]}
- 직군: ${JOB_NAMES[crew1.jobRole]}
- 최고 스탯: ${STAT_NAMES[crew1TopStat[0] as keyof Stats]} (${crew1TopStat[1]})
- 전체 스탯: 실행력 ${crew1.stats.SPD} | 정밀도 ${crew1.stats.DET} | 소통력 ${crew1.stats.COM} | 조율력 ${crew1.stats.HAR} | 창의성 ${crew1.stats.CRE}

👩 두 번째 크루: ${crew2.name}
- 성향: ${CHARACTER_NAMES[crew2.characterType]}
- 직군: ${JOB_NAMES[crew2.jobRole]}
- 최고 스탯: ${STAT_NAMES[crew2TopStat[0] as keyof Stats]} (${crew2TopStat[1]})
- 전체 스탯: 실행력 ${crew2.stats.SPD} | 정밀도 ${crew2.stats.DET} | 소통력 ${crew2.stats.COM} | 조율력 ${crew2.stats.HAR} | 창의성 ${crew2.stats.CRE}

이 두 사람의 케미를 분석하고 오늘 당장 할 수 있는 재미있는 미션을 추천해주세요!`,
    },
  ];

  const response = await callOpenAI(messages);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("JSON 형식이 아닙니다.");
  } catch {
    return {
      synergyReason: `${crew1.name}님과 ${crew2.name}님은 서로의 강점을 보완하며 훌륭한 시너지를 발휘할 수 있습니다.`,
      mission: "함께 카페에서 30분간 서로의 취미와 관심사에 대해 이야기하기",
    };
  }
}
