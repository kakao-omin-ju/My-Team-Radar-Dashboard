import { NextRequest, NextResponse } from "next/server";
import { Crew } from "@/lib/constants";
import { calculateTeamStats, generateTeamStatsResponse } from "@/lib/stats";
import { generateTeamAnalysis } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { crews } = body as { crews: Crew[] };

    if (!crews || !Array.isArray(crews) || crews.length === 0) {
      return NextResponse.json(
        { error: "최소 1명 이상의 크루가 필요합니다." },
        { status: 400 }
      );
    }

    // 팀 스탯 계산
    const teamStats = calculateTeamStats(crews);
    const { teamGrade } = generateTeamStatsResponse(crews);

    // OpenAI를 통한 분석 생성
    const analysis = await generateTeamAnalysis(crews, teamStats, teamGrade);

    return NextResponse.json({
      teamStats,
      teamGrade,
      ...analysis,
    });
  } catch (error) {
    console.error("Analyze API 오류:", error);
    return NextResponse.json(
      { error: "팀 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
