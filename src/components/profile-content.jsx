"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateUserProfile } from "@/app/actions/user/user.actions";
import { ShieldCheck, Sparkles, User } from "lucide-react";

export default function ProfileContent({ user }) {
  const [name, setName] = useState(user?.name || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateUserProfile(null, {
        userId: user.id,
        name,
      });

      if (result.success) {
        toast.success(result.msg);
        router.refresh();
      } else {
        toast.error(result.msg);
      }
    });
  };

  return (
    <div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
      <form
        onSubmit={handleSubmit}
        className='rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]'
      >
        <div className='flex items-center gap-3'>
          <Sparkles className='h-5 w-5 text-emerald-500' />
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-400'>
              Profile
            </p>
            <h2 className='text-2xl font-semibold text-slate-900'>
              Personal details
            </h2>
          </div>
        </div>
        <p className='mt-3 text-sm text-slate-500'>
          Keep your displayed name current so the rest of the dashboard uses it.
        </p>

        <div className='mt-6'>
          <div className='space-y-2'>
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        </div>


        <div className='mt-6 flex justify-end'>
          <Button type='submit' disabled={isPending}>
            {isPending ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>

      <aside className='rounded-[32px] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 shadow-inner'>
        <div className='flex items-center gap-3'>
          <User className='h-6 w-6 text-emerald-600' />
          <div>
            <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
              Account
            </p>
            <p className='text-lg font-semibold text-slate-900'>Status</p>
          </div>
        </div>
        <div className='mt-4 flex items-center gap-2'>
          <Badge variant='secondary' className='rounded-full border-slate-200 bg-slate-100 text-slate-600'>
            {user?.approved ? "Approved" : "Pending approval"}
          </Badge>
          <span className='text-xs text-slate-400'>Role: {user?.role}</span>
        </div>
        <Separator className='my-4' />
        <div className='flex items-center gap-2'>
          <ShieldCheck className='h-4 w-4 text-slate-500' />
          <p className='text-sm text-slate-500'>
            Changes are saved directly and reflected immediately in your profile.
          </p>
        </div>
      </aside>
    </div>
  );
}
