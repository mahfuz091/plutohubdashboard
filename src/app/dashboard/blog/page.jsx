import Blog from "@/components/Dashboard/Blog/Blog";
import { postList } from "@/app/actions/blog/blog.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const allPost = await postList();

  return (
    <div>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold">Blog</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage all blog posts from one place.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/dashboard/blog/add">Add Blog</Link>
                </Button>
              </div>
              <Blog allPost={allPost} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
