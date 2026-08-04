import type { StoredBuilderCircle } from "@/lib/builder-circle-config";
import Link from "next/link";

type MeetupHubCardProps = {
  loading: boolean;
  meetupId: string;
  eventName?: string;
  eventCity?: string;
  eventCountry?: string;
  circlesAssigned: boolean;
  myCircle: StoredBuilderCircle | null;
  communityId: string;
  attendanceVerified: boolean;
  onChainReputation: number | null;
  statusLoading: boolean;
  canRefreshStatus: boolean;
  onRefreshStatus: () => void;
};

function Kicker({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">{children}</p>
  );
}

export function MeetupHubCard({
  loading,
  meetupId,
  eventName,
  eventCity,
  eventCountry,
  circlesAssigned,
  myCircle,
  communityId,
  attendanceVerified,
  onChainReputation,
  statusLoading,
  canRefreshStatus,
  onRefreshStatus,
}: MeetupHubCardProps) {
  const hasMeetupToAttend = Boolean(circlesAssigned && myCircle);
  const location = [eventCity, eventCountry].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight">Attend our next meetup</h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500">
          Your organizer assigns Builder Circles before the event. When you are placed in a circle, your meetup
          details appear here.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading meetup status…</p>
      ) : hasMeetupToAttend ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6">
          <Kicker>Your upcoming meetup</Kicker>
          <h3 className="mt-2 text-xl font-black text-white">{eventName ?? meetupId}</h3>
          {location ? <p className="mt-1 text-sm text-zinc-400">{location}</p> : null}
          <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">
              Your Builder Circle
            </p>
            <h4 className="mt-2 text-lg font-black text-white">{myCircle!.id}</h4>
            <ul className="mt-4 space-y-2">
              {myCircle!.members.map((member) => (
                <li
                  key={member.communityId}
                  className={`flex justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${
                    member.communityId === communityId
                      ? "border-brand-sky/30 bg-brand-sky/10"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <span className="font-bold text-white">{member.fullName}</span>
                  <span className="text-zinc-500">{member.role}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={`/meetup/${meetupId}/circles?communityId=${encodeURIComponent(communityId)}`}
            className="mt-4 inline-flex text-xs font-bold text-brand-sky hover:text-white"
          >
            View full circle details →
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <p className="text-sm font-bold text-zinc-300">No current meetup to attend</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            {circlesAssigned
              ? "Builder Circles are published, but you have not been placed in a circle for this event yet. Contact your city organizer if you expected an assignment."
              : "An organizer must assign you to a Builder Circle before you can attend. RSVP for the meetup, then check back after matching runs."}
          </p>
          <Link
            href={`/meetup/${meetupId}`}
            className="mt-4 inline-flex text-xs font-bold text-brand-sky hover:text-white"
          >
            RSVP for this meetup →
          </Link>
        </div>
      )}

      <div className="border-t border-white/10 pt-6">
        <Link
          href="/checkin"
          className="inline-flex rounded-xl bg-brand-sash-diag px-7 py-3 text-sm font-black text-white shadow-[0_0_36px_-14px_rgba(233,30,140,0.95)] transition hover:opacity-95"
        >
          Verify participation
        </Link>
        <p className="mt-2 max-w-md text-xs leading-relaxed text-zinc-500">
          Scan the QR code at the event to record your participation on-chain.
        </p>

        {attendanceVerified ? (
          <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">
            Participation verified on-chain
            {onChainReputation !== null ? ` · ${onChainReputation} reputation` : ""}.
          </p>
        ) : null}

        {canRefreshStatus ? (
          <button
            type="button"
            onClick={onRefreshStatus}
            disabled={statusLoading}
            className="mt-4 block rounded-xl border border-white/10 px-5 py-2.5 text-xs font-bold text-zinc-400 transition hover:border-white/20 hover:text-white disabled:opacity-60"
          >
            {statusLoading ? "Refreshing…" : "Refresh on-chain status"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
