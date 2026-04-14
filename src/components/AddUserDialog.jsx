"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { createUserByAdmin } from "@/app/actions/user/user.actions";
import { USER_ROLES } from "@/lib/access";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState = { success: false, msg: "" };

export default function AddUserDialog({ isAdmin }) {
  const router = useRouter();
  const formRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(USER_ROLES.AUTHOR);
  const [state, formAction, isPending] = useActionState(
    createUserByAdmin,
    initialState
  );

  useEffect(() => {
    if (!state?.msg) {
      return;
    }

    if (state.success) {
      toast.success(state.msg);
      formRef.current?.reset();
      setRole(USER_ROLES.AUTHOR);
      setOpen(false);
      router.refresh();
      return;
    }

    toast.error(state.msg);
  }, [router, state]);

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Create a new account. Users created here are approved immediately.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="user-name">Name</Label>
            <Input id="user-name" name="name" placeholder="User name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              name="email"
              type="email"
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user-password">Password</Label>
            <Input
              id="user-password"
              name="password"
              type="password"
              placeholder="Enter password"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user-role">Role</Label>
            <Select name="role" value={role} onValueChange={setRole} disabled={isPending}>
              <SelectTrigger id="user-role" className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={USER_ROLES.ADMIN}>Admin</SelectItem>
                <SelectItem value={USER_ROLES.AUTHOR}>Author</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
