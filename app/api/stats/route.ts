import { NextRequest, NextResponse } from "next/server";
import { Crew } from "@/lib/constants";
import { generateTeamStatsResponse } from "@/lib/stats";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { crews } = body as { crews: Crew[] };

    if (!crews || !Array.isArray(crews)) {
      return NextResponse.json(
        { error: "crews 배열이 필요합니다." },
        { status: 400 }
      );
    }

    const statsResponse = generateTeamStatsResponse(crews);

    return NextResponse.json(statsResponse);
  } catch (error) {
    console.error("Stats API 오류:", error);
    return NextResponse.json(
      { error: "스탯 계산 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
