"use client"

import dynamic from "next/dynamic"

const GameApp = dynamic(() => import("@/components/game-app"), { ssr: false })

export default function PlayPage() {
  return <GameApp />
}
