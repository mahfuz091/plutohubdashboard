import { BlogSectionCards, SectionCards } from "@/components/section-cards";

import Blog from "@/components/Dashboard/Blog/Blog";
import { postList } from "../actions/blog/blog.actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
export default async function Page() {
  const allPost = await postList();
  console.log("allPost", allPost);
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  // console.log(session, "session");

  return (
    <div className=''>
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <BlogSectionCards />

            <div className='px-4 lg:px-6'>
              {/* <ChartAreaInteractive /> */}
              <Blog allPost={allPost} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
