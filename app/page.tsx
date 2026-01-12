"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js"
import { Radar } from "react-chartjs-2"

// Chart.js 등록
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)
import {
  Zap,
  Droplet,
  Users,
  Heart,
  Handshake,
  Sparkles,
  Code,
  FileText,
  Palette,
  UserCheck,
  Megaphone,
  Plus,
  Settings,
  Loader2,
  Trash2,
} from "lucide-react"

type CharacterType = "speed-racer" | "deep-diver" | "super-connector" | "peace-maker"
type JobRole = "developer" | "planner" | "designer" | "hr" | "marketing"

interface Stats {
  SPD: number
  DET: number
  COM: number
  HAR: number
  CRE: number
}

interface TeamMember {
  id: string
  name: string
  characterType: CharacterType
  jobRole: JobRole
  stats: Stats
}

interface RadarDataItem {
  metric: string
  value: number
  fullMark: number
}

interface AnalysisResult {
  teamStats: Stats
  teamGrade: string
  persona: string
  strengths: string[]
  improvements: string[]
}

interface DuoResult {
  duo: [TeamMember, TeamMember]
  synergyScore: number
  synergyReason: string
  mission: string
}

const characterImages = {
  "speed-racer": "/images/type-20-20speed-20racer.jpg",
  "deep-diver": "/images/type-20-20deep-20diver.jpg",
  "super-connector": "/images/type-20-20super-20connector.jpg",
  "peace-maker": "/images/type-20-20peace-20maker.jpg",
}

const characterIcons = {
  "speed-racer": Zap,
  "deep-diver": Droplet,
  "super-connector": Users,
  "peace-maker": Heart,
}

const jobRoleIcons = {
  developer: Code,
  planner: FileText,
  designer: Palette,
  hr: UserCheck,
  marketing: Megaphone,
}

// 성향별 기본 스탯 (서버와 동일)
const CHARACTER_STATS: Record<CharacterType, Stats> = {
  "speed-racer": { SPD: 10, DET: 3, COM: 6, HAR: 4, CRE: 7 },
  "deep-diver": { SPD: 3, DET: 10, COM: 4, HAR: 6, CRE: 7 },
  "super-connector": { SPD: 7, DET: 4, COM: 10, HAR: 6, CRE: 8 },
  "peace-maker": { SPD: 4, DET: 6, COM: 7, HAR: 10, CRE: 3 },
}

// 직군별 보너스 가중치
const JOB_BONUS: Record<JobRole, Partial<Stats>> = {
  developer: { DET: 3, SPD: 2 },
  planner: { DET: 2, COM: 3 },
  designer: { CRE: 4, DET: 1 },
  hr: { HAR: 4, COM: 1 },
  marketing: { COM: 3, SPD: 2 },
}

// 크루 스탯 계산
function calculateCrewStats(characterType: CharacterType, jobRole: JobRole): Stats {
  const baseStats = { ...CHARACTER_STATS[characterType] }
  const bonus = JOB_BONUS[jobRole]

  for (const [key, value] of Object.entries(bonus)) {
    baseStats[key as keyof Stats] += value as number
  }

  return baseStats
}

export default function TeamRadarDashboard() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [newMember, setNewMember] = useState({
    name: "",
    characterType: "" as CharacterType,
    jobRole: "" as JobRole,
  })

  // API 관련 상태
  const [radarData, setRadarData] = useState<RadarDataItem[]>([])
  const [teamGrade, setTeamGrade] = useState<string>("C")
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [duoResult, setDuoResult] = useState<DuoResult | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  const [isLoadingDuo, setIsLoadingDuo] = useState(false)

  // 레이더 차트 데이터 가져오기
  const fetchStats = useCallback(async (crews: TeamMember[]) => {
    if (crews.length === 0) {
      setRadarData([])
      setTeamGrade("C")
      return
    }

    setIsLoadingStats(true)
    console.log("🚀 [스탯 조회] 요청 시작", { crews })
    try {
      const response = await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crews }),
      })
      const data = await response.json()
      console.log("✅ [스탯 조회] 응답 받음", data)
      setRadarData(data.radarData)
      setTeamGrade(data.teamGrade)
    } catch (error) {
      console.error("❌ [스탯 조회] 오류:", error)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  // AI 분석 가져오기
  const fetchAnalysis = async () => {
    if (teamMembers.length === 0) return

    setIsLoadingAnalysis(true)
    console.log("🚀 [AI 분석] 요청 시작", { crews: teamMembers })
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crews: teamMembers }),
      })
      const data = await response.json()
      console.log("✅ [AI 분석] 응답 받음", data)
      setAnalysis(data)
    } catch (error) {
      console.error("❌ [AI 분석] 오류:", error)
    } finally {
      setIsLoadingAnalysis(false)
    }
  }

  // 듀오 추천 가져오기
  const fetchDuoRecommendation = async () => {
    if (teamMembers.length < 2) return

    setIsLoadingDuo(true)
    console.log("🚀 [듀오 추천] 요청 시작", { crews: teamMembers })
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crews: teamMembers }),
      })
      const data = await response.json()
      console.log("✅ [듀오 추천] 응답 받음", data)
      setDuoResult(data)
    } catch (error) {
      console.error("❌ [듀오 추천] 오류:", error)
    } finally {
      setIsLoadingDuo(false)
    }
  }

  // 팀원 변경 시 스탯 업데이트
  useEffect(() => {
    fetchStats(teamMembers)
  }, [teamMembers, fetchStats])

  const addTeamMember = () => {
    if (!newMember.name || !newMember.characterType || !newMember.jobRole) return

    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      characterType: newMember.characterType,
      jobRole: newMember.jobRole,
      stats: calculateCrewStats(newMember.characterType, newMember.jobRole),
    }

    setTeamMembers([...teamMembers, member])
    setNewMember({ name: "", characterType: "" as CharacterType, jobRole: "" as JobRole })
    // 분석 결과 초기화 (새 팀원 추가 시 다시 분석 필요)
    setAnalysis(null)
    setDuoResult(null)
  }

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id))
    setAnalysis(null)
    setDuoResult(null)
  }

  return (
    <div className="min-h-screen bg-kakao-bg p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="mb-2 text-4xl font-bold text-foreground">My Team Radar</h1>
          <p className="text-muted-foreground">카카오 신입 크루를 위한 팀 시너지 분석 서비스</p>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card/50">
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-kakao-yellow data-[state=active]:text-kakao-dark"
              >
                <Settings className="mr-2 h-4 w-4" />
                팀원 설정
              </TabsTrigger>
              <TabsTrigger
                value="radar"
                className="data-[state=active]:bg-kakao-yellow data-[state=active]:text-kakao-dark"
              >
                레이더 차트
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="data-[state=active]:bg-kakao-yellow data-[state=active]:text-kakao-dark"
              >
                AI 인사이트
              </TabsTrigger>
            </TabsList>

            {/* Team Settings Tab */}
            <TabsContent value="settings" className="mt-6 space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl">팀원 추가하기</CardTitle>
                  <CardDescription>새로운 팀원을 추가하여 팀 시너지를 분석해보세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      placeholder="크루 이름"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="flex-[3] bg-background/50"
                    />
                    <Select
                      value={newMember.characterType}
                      onValueChange={(value) => setNewMember({ ...newMember, characterType: value as CharacterType })}
                    >
                      <SelectTrigger className="flex-1 bg-background/50">
                        <SelectValue placeholder="캐릭터 타입" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="speed-racer">⚡ 스피드 레이서</SelectItem>
                        <SelectItem value="deep-diver">💧 딥 다이버</SelectItem>
                        <SelectItem value="super-connector">👥 슈퍼 커넥터</SelectItem>
                        <SelectItem value="peace-maker">❤️ 피스 메이커</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={newMember.jobRole}
                      onValueChange={(value) => setNewMember({ ...newMember, jobRole: value as JobRole })}
                    >
                      <SelectTrigger className="flex-1 bg-background/50">
                        <SelectValue placeholder="직군" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="developer">개발자</SelectItem>
                        <SelectItem value="planner">기획자</SelectItem>
                        <SelectItem value="designer">디자이너</SelectItem>
                        <SelectItem value="hr">인사</SelectItem>
                        <SelectItem value="marketing">마케팅</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={addTeamMember}
                      className="flex-1 bg-kakao-yellow text-kakao-dark hover:bg-kakao-yellow/90 whitespace-nowrap"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      팀원 추가
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>팀원 목록 ({teamMembers.length}명)</CardTitle>
                  <CardDescription>현재 팀에 등록된 모든 크루를 확인하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    <AnimatePresence>
                      {teamMembers.map((member, index) => {
                        const CharacterIcon = characterIcons[member.characterType]
                        const JobIcon = jobRoleIcons[member.jobRole]
                        return (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="border-kakao-yellow/20 bg-background/50 transition-all hover:border-kakao-yellow/50 hover:shadow-lg hover:shadow-kakao-yellow/10 relative group">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                onClick={() => removeTeamMember(member.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <CardContent className="p-4">
                                <div className="mb-3 flex items-center justify-center">
                                  <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-kakao-yellow/30">
                                    <img
                                      src={characterImages[member.characterType] || "/placeholder.svg"}
                                      alt={member.characterType}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                </div>
                                <h3 className="mb-1 text-center font-semibold">{member.name}</h3>
                                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                  <JobIcon className="h-3 w-3" />
                                  <span>
                                    {member.jobRole === "developer"
                                      ? "개발자"
                                      : member.jobRole === "designer"
                                        ? "디자이너"
                                        : member.jobRole === "planner"
                                          ? "기획자"
                                          : member.jobRole === "hr"
                                            ? "인사"
                                            : "마케팅"}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="radar" className="mt-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>팀 역량 레이더</CardTitle>
                  <CardDescription>팀원들의 통합 역량 분석 (평균 스탯)</CardDescription>
                </CardHeader>
                <CardContent>
                  {teamMembers.length === 0 ? (
                    <div className="flex h-[500px] items-center justify-center text-muted-foreground">
                      팀원을 추가하면 레이더 차트가 표시됩니다.
                    </div>
                  ) : isLoadingStats ? (
                    <div className="flex h-[500px] items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-kakao-yellow" />
                    </div>
                  ) : radarData.length === 0 ? (
                    <div className="flex h-[500px] items-center justify-center text-muted-foreground">
                      데이터를 불러오는 중...
                    </div>
                  ) : (
                    <div className="h-[500px] w-full flex items-center justify-center">
                      <Radar
                        data={{
                          labels: radarData.map((d) => d.metric),
                          datasets: [
                            {
                              label: "팀 스탯",
                              data: radarData.map((d) => d.value),
                              backgroundColor: "rgba(254, 229, 0, 0.4)",
                              borderColor: "#FEE500",
                              borderWidth: 2,
                              pointBackgroundColor: "#FEE500",
                              pointBorderColor: "#fff",
                              pointHoverBackgroundColor: "#fff",
                              pointHoverBorderColor: "#FEE500",
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            r: {
                              beginAtZero: true,
                              max: 15,
                              ticks: {
                                display: false,
                              },
                              grid: {
                                color: "rgba(255, 255, 255, 0.15)",
                              },
                              angleLines: {
                                color: "rgba(255, 255, 255, 0.15)",
                              },
                              pointLabels: {
                                color: "#ccc",
                                font: {
                                  size: 14,
                                  weight: "bold",
                                },
                              },
                            },
                          },
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              enabled: true,
                              backgroundColor: "rgba(0, 0, 0, 0.8)",
                              titleFont: {
                                size: 14,
                              },
                              bodyFont: {
                                size: 13,
                              },
                              padding: 12,
                              callbacks: {
                                label: (context: { raw: unknown; label: string }) => {
                                  return `${context.label}: ${context.raw}`;
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="mt-6 space-y-6">
              {teamMembers.length === 0 ? (
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
                    팀원을 추가하면 AI 분석을 시작할 수 있습니다.
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="mb-2 text-2xl">AI 시너지 리포트</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-kakao-yellow text-kakao-dark text-lg font-bold">{teamGrade}</Badge>
                            <span className="text-sm text-muted-foreground">팀 등급</span>
                          </div>
                        </div>
                        <Sparkles className="h-8 w-8 text-kakao-yellow" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!analysis ? (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            AI가 팀의 시너지를 분석합니다. 아래 버튼을 클릭하세요.
                          </p>
                          <Button
                            onClick={fetchAnalysis}
                            disabled={isLoadingAnalysis}
                            className="w-full bg-kakao-yellow text-kakao-dark hover:bg-kakao-yellow/90"
                          >
                            {isLoadingAnalysis ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                분석 중...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                AI 분석 시작하기
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <h3 className="mb-2 text-lg font-semibold text-kakao-yellow">
                              팀 페르소나: "{analysis.persona}"
                            </h3>
                          </div>
                          <div className="space-y-2 rounded-lg bg-background/50 p-4">
                            <h4 className="font-semibold">강점 분석</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {analysis.strengths.map((s, i) => (
                                <li key={i}>• {s}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2 rounded-lg bg-background/50 p-4">
                            <h4 className="font-semibold">개선 포인트</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {analysis.improvements.map((s, i) => (
                                <li key={i}>• {s}</li>
                              ))}
                            </ul>
                          </div>
                          <Button
                            onClick={fetchAnalysis}
                            disabled={isLoadingAnalysis}
                            variant="outline"
                            className="w-full"
                          >
                            {isLoadingAnalysis ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                분석 중...
                              </>
                            ) : (
                              "다시 분석하기"
                            )}
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {teamMembers.length >= 2 && (
                    <Card className="border-kakao-yellow/50 bg-gradient-to-br from-kakao-yellow/10 to-card/50 backdrop-blur">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Handshake className="h-6 w-6 text-kakao-yellow" />
                          <CardTitle className="text-2xl">오늘의 베스트 듀오</CardTitle>
                        </div>
                        <CardDescription>최고의 시너지를 발휘하는 조합입니다</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {!duoResult ? (
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              AI가 최고의 듀오를 찾고 아이스브레이킹 미션을 추천합니다.
                            </p>
                            <Button
                              onClick={fetchDuoRecommendation}
                              disabled={isLoadingDuo}
                              className="w-full bg-kakao-yellow text-kakao-dark hover:bg-kakao-yellow/90"
                            >
                              {isLoadingDuo ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  듀오 찾는 중...
                                </>
                              ) : (
                                <>
                                  <Handshake className="mr-2 h-4 w-4" />
                                  베스트 듀오 찾기
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center">
                              <div className="text-center">
                                <div className="mb-2 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-kakao-yellow/30 mx-auto">
                                  <img
                                    src={characterImages[duoResult.duo[0].characterType] || "/placeholder.svg"}
                                    alt={duoResult.duo[0].characterType}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <p className="font-semibold">{duoResult.duo[0].name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {duoResult.duo[0].jobRole === "developer"
                                    ? "개발자"
                                    : duoResult.duo[0].jobRole === "designer"
                                      ? "디자이너"
                                      : duoResult.duo[0].jobRole === "planner"
                                        ? "기획자"
                                        : duoResult.duo[0].jobRole === "hr"
                                          ? "인사"
                                          : "마케팅"}
                                </p>
                              </div>
                              <div className="flex items-center justify-center">
                                <Handshake
                                  className="h-12 w-12 text-kakao-yellow animate-bounce"
                                />
                              </div>
                              <div className="text-center">
                                <div className="mb-2 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-kakao-yellow/30 mx-auto">
                                  <img
                                    src={characterImages[duoResult.duo[1].characterType] || "/placeholder.svg"}
                                    alt={duoResult.duo[1].characterType}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <p className="font-semibold">{duoResult.duo[1].name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {duoResult.duo[1].jobRole === "developer"
                                    ? "개발자"
                                    : duoResult.duo[1].jobRole === "designer"
                                      ? "디자이너"
                                      : duoResult.duo[1].jobRole === "planner"
                                        ? "기획자"
                                        : duoResult.duo[1].jobRole === "hr"
                                          ? "인사"
                                          : "마케팅"}
                                </p>
                              </div>
                            </div>
                            <div className="mt-6 space-y-4">
                              <div className="rounded-lg bg-background/50 p-4">
                                <h4 className="mb-2 font-semibold text-kakao-yellow">시너지 분석</h4>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {duoResult.synergyReason}
                                </p>
                              </div>
                              <div className="rounded-lg bg-kakao-yellow/20 p-4">
                                <h4 className="mb-2 font-semibold text-kakao-yellow">아이스브레이킹 미션</h4>
                                <p className="text-sm leading-relaxed">{duoResult.mission}</p>
                              </div>
                              <Button
                                onClick={fetchDuoRecommendation}
                                disabled={isLoadingDuo}
                                variant="outline"
                                className="w-full"
                              >
                                {isLoadingDuo ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    듀오 찾는 중...
                                  </>
                                ) : (
                                  "다시 추천받기"
                                )}
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
