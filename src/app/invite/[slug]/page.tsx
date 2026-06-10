import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function InvitePage({ params }: Props) {
  const { slug } = await params;
  const safeSlug = slug.replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);

  if (!safeSlug) {
    redirect("/?openJoin=1");
  }

  redirect(`/?openJoin=1&ref=${encodeURIComponent(safeSlug)}`);
}
