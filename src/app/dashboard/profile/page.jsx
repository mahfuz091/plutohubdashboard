import ProfileContent from "@/components/profile-content";
import ProfileHeader from "@/components/profile-header";
import { getUserProfile } from "@/app/actions/user/user.actions";

export default async function Page() {
  const { user } = await getUserProfile();

  if (!user) {
    return <div className='min-h-screen px-4 py-16 text-center text-lg'>No profile found.</div>;
  }

  return (
    <div className='mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'>
      <ProfileHeader user={user} />
      <ProfileContent user={user} />
    </div>
  );
}
