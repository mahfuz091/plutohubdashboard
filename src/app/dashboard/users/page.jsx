import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { userList } from "@/app/actions/user/user.actions";
import { canManageUsers } from "@/lib/access";
import UserManagementTable from "@/components/UserManagementTable";
import AddUserDialog from "@/components/AddUserDialog";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();

  if (!session || !canManageUsers(session.user)) {
    redirect("/dashboard");
  }

  const users = await userList();

  return (
    <div className="p-4 lg:p-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>User Access</CardTitle>
            <CardDescription>
              New accounts from public signup are created as pending authors.
              Admins can add users, approve accounts, and change roles.
            </CardDescription>
          </div>
          <CardAction>
            <AddUserDialog isAdmin={canManageUsers(session.user)} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <UserManagementTable
            users={users}
            currentUserId={session.user.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
