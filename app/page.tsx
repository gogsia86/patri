import AiAgent from '@/components/AiAgent';
import IsometricRoomGrid from '@/components/IsometricRoomGrid';
import LootBox from '@/components/LootBox';
import PixelCard from '@/components/PixelCard';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="px-panel p-5 md:p-7">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent2)]">Patri // Dark Build Mode</p>
        <h1 className="mt-2 text-5xl leading-tight md:text-7xl">PATRI - Build Your Dark Realm</h1>
        <p className="mt-3 max-w-3xl text-xl text-zinc-300">
          Drag furniture, snap to tile, open loot crates, and ask The Architect for moody layout guidance.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <IsometricRoomGrid />
        <div className="space-y-6">
          <LootBox />
          <PixelCard title="How to play">
            <ol className="list-decimal space-y-1 pl-5 text-lg text-zinc-300">
              <li>Add furniture from the palette.</li>
              <li>Drag items and release to snap to nearest tile.</li>
              <li>Roll loot to unlock rare room pieces.</li>
            </ol>
          </PixelCard>
        </div>
      </section>

      <AiAgent role="user" />
    </div>
  );
}
