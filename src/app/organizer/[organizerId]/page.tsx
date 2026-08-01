import Link from 'next/link';

export default function OrganizerDetailPage({
  params,
}: {
  params: { organizerId: string };
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white px-4 py-8 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link to Directory */}
        <div className="mb-6">
          <Link
            href="/organizer"
            className="inline-flex items-center text-sm text-neutral-400 hover:text-white transition-colors gap-2"
          >
            ← All organizers
          </Link>
        </div>

        {/* Organizer Detail Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">Organizer Profile</h1>
          <p className="text-neutral-400">ID: {params.organizerId}</p>
        </div>
      </div>
    </div>
  );
}