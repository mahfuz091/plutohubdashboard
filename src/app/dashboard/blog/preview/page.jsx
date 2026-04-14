import { auth } from "@/auth";
import SeeBlog from "@/components/PreviewBlog/PreviewBlog";
import CategoryAdd from "@/components/PreviewBlog/CategoryAdd";

export default async function PreviewBlogContainer() {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <div className="mx-auto flex max-w-6xl gap-8 py-8">
      <div className="w-1/2">
        <SeeBlog userId={userId} />
      </div>
      <div className="sticky top-9 w-1/2 self-start">
        <CategoryAdd />
      </div>
    </div>
  );
}
