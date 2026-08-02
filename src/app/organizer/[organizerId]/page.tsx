import Link from "next/link";

type Props = {
  params: Promise<{ organizerId: string }>;
};

export default async function OrganizerDetailPage({ params }: Props) {
  const { organizerId } = await params;

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-4 py-8 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/organizers"
            className="inline-flex items-center text-sm text-neutral-400 hover:text-white transition-colors gap-2"
          >
            ← All organizers
          </Link>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">Organizer Profile</h1>
          <p className="text-neutral-400">ID: {organizerId}</p>
        </div>
      </div>
    </div>
  );
}
