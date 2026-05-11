"use client"

import { Clock, Users, Trophy, Medal, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const globalLeaders = [
  { rank: 1, name: "Alex Chen", time: "2:34", avatar: "" },
  { rank: 2, name: "Sarah Kim", time: "2:51", avatar: "" },
  { rank: 3, name: "Mike Johnson", time: "3:02", avatar: "" },
]

const localLeaders = [
  { rank: 1, name: "Arman Ospan", time: "3:12", avatar: "" },
  { rank: 2, name: "Dana Nurlan", time: "3:45", avatar: "" },
  { rank: 3, name: "Aidar Malik", time: "4:01", avatar: "" },
]

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-4 w-4 text-yellow-500" />
    case 2:
      return <Medal className="h-4 w-4 text-gray-400" />
    case 3:
      return <Award className="h-4 w-4 text-amber-600" />
    default:
      return null
  }
}

function LeaderList({ leaders }: { leaders: typeof globalLeaders }) {
  return (
    <div className="space-y-3">
      {leaders.map((leader) => (
        <div
          key={leader.rank}
          className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary"
        >
          <div className="flex h-8 w-8 items-center justify-center">
            {getRankIcon(leader.rank)}
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={leader.avatar} />
            <AvatarFallback className="bg-primary/10 text-xs font-medium">
              {leader.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{leader.name}</p>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {leader.time}
          </Badge>
        </div>
      ))}
    </div>
  )
}

export function LeftColumn() {
  return (
    <div className="space-y-6">
      {/* Daily Challenge Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Daily Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Next challenge in</p>
            <div className="flex justify-center gap-2">
              <div className="rounded-lg bg-secondary px-3 py-2">
                <span className="text-2xl font-bold font-mono">04</span>
                <p className="text-xs text-muted-foreground">hrs</p>
              </div>
              <div className="rounded-lg bg-secondary px-3 py-2">
                <span className="text-2xl font-bold font-mono">32</span>
                <p className="text-xs text-muted-foreground">min</p>
              </div>
              <div className="rounded-lg bg-secondary px-3 py-2">
                <span className="text-2xl font-bold font-mono">15</span>
                <p className="text-xs text-muted-foreground">sec</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>2,847 players competing today</span>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="global" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="local">Local (Almaty)</TabsTrigger>
            </TabsList>
            <TabsContent value="global">
              <LeaderList leaders={globalLeaders} />
            </TabsContent>
            <TabsContent value="local">
              <LeaderList leaders={localLeaders} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
