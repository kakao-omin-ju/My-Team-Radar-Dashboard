import { NextRequest, NextResponse } from "next/server";
import { Crew } from "@/lib/constants";
import { findBestDuo } from "@/lib/stats";
import { generateDuoAnalysis } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { crews } = body as { crews: Crew[] };

    if (!crews || !Array.isArray(crews) || crews.length < 2) {
      return NextResponse.json(
        { error: "최소 2명 이상의 크루가 필요합니다." },
        { status: 400 }
      );
    }

    // 베스트 듀오 찾기
    const result = findBestDuo(crews);

    if (!result) {
      return NextResponse.json(
        { error: "듀오를 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    const { duo, synergyScore } = result;

    // OpenAI를 통한 시너지 분석 및 미션 생성
    const duoAnalysis = await generateDuoAnalysis(duo[0], duo[1]);

    return NextResponse.json({
      duo,
      synergyScore,
      ...duoAnalysis,
    });
  } catch (error) {
    console.error("Recommend API 오류:", error);
    return NextResponse.json(
      { error: "듀오 추천 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
