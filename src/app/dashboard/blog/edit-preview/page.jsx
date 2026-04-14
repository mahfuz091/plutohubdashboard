import { auth } from "@/auth";
import EditSeeBlog from "@/components/EditPreviewBlog/EditPreviewBlog";
import EditCategoryAdd from "@/components/EditPreviewBlog/EditCategoryAdd";

export default async function EditPreviewBlogContainer() {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <div className="mx-auto flex max-w-[1320px] gap-8 py-8">
      <div className="w-1/2">
        <EditSeeBlog userId={userId} />
      </div>
      <div className="sticky top-9 w-1/2 self-start">
        <EditCategoryAdd />
      </div>
    </div>
  );
}
