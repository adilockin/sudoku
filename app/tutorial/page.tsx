"use client"

import dynamic from "next/dynamic"

const TutorialApp = dynamic(() => import("@/components/tutorial-app"), { ssr: false })

export default function TutorialPage() {
  return <TutorialApp />
}
