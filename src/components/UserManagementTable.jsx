"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateUserApproval, updateUserRole } from "@/app/actions/user/user.actions";
import { USER_ROLES } from "@/lib/access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function ApprovalBadge({ approved }) {
  if (approved) {
    return (
      <Badge className="bg-green-600 text-white hover:bg-green-600">
        Approved
      </Badge>
    );
  }

  return <Badge variant="secondary">Pending</Badge>;
}

export default function UserManagementTable({ users, currentUserId }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedRoles, setSelectedRoles] = useState(
    Object.fromEntries(users.map((user) => [user.id, user.role]))
  );

  const handleRoleUpdate = (userId) => {
    startTransition(async () => {
      const result = await updateUserRole({
        userId,
        role: selectedRoles[userId],
      });

      if (result.success) {
        toast.success(result.msg);
        router.refresh();
        return;
      }

      toast.error(result.msg || "Failed to update role");
    });
  };

  const handleApprovalUpdate = (userId, approved) => {
    startTransition(async () => {
      const result = await updateUserApproval({ userId, approved });

      if (result.success) {
        toast.success(result.msg);
        router.refresh();
        return;
      }

      toast.error(result.msg || "Failed to update approval");
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isCurrentUser = user.id === currentUserId;

          return (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.name || "Unnamed user"}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <div className="flex min-w-[180px] items-center gap-2">
                  <Select
                    value={selectedRoles[user.id]}
                    onValueChange={(value) =>
                      setSelectedRoles((prev) => ({ ...prev, [user.id]: value }))
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={USER_ROLES.ADMIN}>Admin</SelectItem>
                      <SelectItem value={USER_ROLES.AUTHOR}>Author</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      isPending ||
                      isCurrentUser ||
                      selectedRoles[user.id] === user.role
                    }
                    onClick={() => handleRoleUpdate(user.id)}
                  >
                    Save role
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <ApprovalBadge approved={user.approved} />
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isPending || user.approved}
                    onClick={() => handleApprovalUpdate(user.id, true)}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isPending || !user.approved || isCurrentUser}
                    onClick={() => handleApprovalUpdate(user.id, false)}
                  >
                    Revoke
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
