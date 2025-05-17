"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Pause, Play, Volume2 } from "lucide-react"

export default function HousieGame() {
  const [numbers, setNumbers] = useState<number[]>([])
  const [calledNumbers, setCalledNumbers] = useState<Set<number>>(new Set())
  const [currentNumber, setCurrentNumber] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [announcement, setAnnouncement] = useState("Game ready to start")
  const [gameOver, setGameOver] = useState(false)
  const { theme } = useTheme()

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const availableNumbersRef = useRef<number[]>([])
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const initialNumbers = Array.from({ length: 90 }, (_, i) => i + 1)
    setNumbers(initialNumbers)
    availableNumbersRef.current = [...initialNumbers]

    if (typeof window !== "undefined") {
      speechSynthesisRef.current = new SpeechSynthesisUtterance()
      speechSynthesisRef.current.rate = 0.9
      speechSynthesisRef.current.pitch = 1
      speechSynthesisRef.current.volume = 1
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      window.speechSynthesis.cancel()
    }
  }, [])

  useEffect(() => {
    if (isPlaying && !gameOver) {
      callNextNumber()
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying])

  const callNextNumber = () => {
    if (!isPlaying || availableNumbersRef.current.length === 0) {
      setIsPlaying(false)
      setGameOver(true)
      const message = "Game Over! All numbers have been called."
      speak(message)
      setAnnouncement(message)
      return
    }

    const randomIndex = Math.floor(Math.random() * availableNumbersRef.current.length)
    const newNumber = availableNumbersRef.current.splice(randomIndex, 1)[0]

    setCurrentNumber(newNumber)
    setCalledNumbers((prev) => new Set([...prev, newNumber]))

    speak(`Number ${newNumber}`)
    setAnnouncement(`Number ${newNumber}`)

    timerRef.current = setTimeout(() => {
      speak(`Number ${newNumber}`) // Repeat
      timerRef.current = setTimeout(callNextNumber, 3000)
    }, 3000)
  }

  const speak = (text: string) => {
    if (typeof window !== "undefined" && speechSynthesisRef.current) {
      window.speechSynthesis.cancel()
      speechSynthesisRef.current.text = text
      window.speechSynthesis.speak(speechSynthesisRef.current)
    }
  }

  const togglePlay = () => {
    if (gameOver) return
    setIsPlaying((prev) => !prev)
  }

  const restartGame = () => {
    window.speechSynthesis.cancel()
    if (timerRef.current) clearTimeout(timerRef.current)

    const resetNumbers = Array.from({ length: 90 }, (_, i) => i + 1)
    setNumbers(resetNumbers)
    availableNumbersRef.current = [...resetNumbers]
    setCalledNumbers(new Set())
    setCurrentNumber(null)
    setIsPlaying(false)
    setGameOver(false)
    setAnnouncement("Game ready to start")
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-2 h-screen overflow-hidden">
      <div className="text-center">
        {currentNumber && <div className="text-6xl font-bold mb-2">{currentNumber}</div>}
        <div className="flex items-center justify-center gap-2">
          <Volume2 className="h-5 w-5" />
          <p className="text-lg">{announcement}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={togglePlay} disabled={gameOver}>
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              {calledNumbers.size === 0 ? "Start" : "Resume"}
            </>
          )}
        </Button>
        <Button onClick={restartGame} variant="outline">
          Restart
        </Button>
      </div>

      <div className="w-full max-w-screen-lg">
        <div
          className="grid grid-cols-[repeat(15,_1fr)] grid-rows-[repeat(6,_1fr)] gap-[2px] max-h-[60vh]"
        >
          {numbers.map((number) => {
            const isCalled = calledNumbers.has(number)
            const isDark = theme === "dark"
            const isCurrent = currentNumber === number

            return (
              <div
                key={number}
                className={`
                  flex items-center justify-center text-[9px] sm:text-[10px] font-medium rounded-sm aspect-square
                  ${isCalled
                    ? isDark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : isDark
                      ? "bg-gray-800 text-white"
                      : "bg-gray-200 text-black"}
                  ${isCurrent ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                `}
              >
                {number}
              </div>
            )
          })}
        </div>
      </div>

      <div className="text-center text-sm mt-2">
        <p>Called: {calledNumbers.size} / 90</p>
        <p>Remaining: {90 - calledNumbers.size}</p>
        {gameOver && <p className="text-green-600 font-bold mt-2">🎉 All numbers have been called!</p>}
      </div>
    </div>
  )
}
