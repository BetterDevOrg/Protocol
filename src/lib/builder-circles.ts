import type { BuilderCircle, BuilderCircleMember } from "@/lib/passport";

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function shuffleWithVrfSeed<T>(items: T[], seed: number): T[] {
  const random = seededRandom(seed);
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function createBuilderCircles(
  attendees: BuilderCircleMember[],
  seed: number,
  groupSize: number,
): BuilderCircle[] {
  const shuffled = shuffleWithVrfSeed(attendees, seed);
  const circles: BuilderCircle[] = [];

  for (let i = 0; i < shuffled.length; i += groupSize) {
    circles.push({
      id: `Circle ${String.fromCharCode(65 + circles.length)}`,
      members: shuffled.slice(i, i + groupSize),
    });
  }

  return circles;
}
