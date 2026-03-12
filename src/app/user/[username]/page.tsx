import { Suspense } from "react";
import UserProfile from "./UserProfile";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-300 font-sans selection:bg-green-500/30">
      <Suspense fallback={<ProfileSkeleton />}>
        <UserProfile username={username} />
      </Suspense>
    </main>
  );
}
