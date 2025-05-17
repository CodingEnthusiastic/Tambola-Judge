import HousieGame from "@/components/housie-game"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Housie (Tambola) Game</h1>
      <HousieGame />
    </main>
  )
}
