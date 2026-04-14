"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Sparkles } from "lucide-react";
import { startTransition, useRef, useState } from "react";
import { updateUserProfileImage } from "@/app/actions/user/user.actions";
import { useRouter } from "next/navigation";

export default function ProfileHeader({ user }) {
  const fileInputRef = useRef();
  const router = useRouter();
  const [preview, setPreview] = useState(user?.profileImage || "/banner.png");

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const tempPreview = URL.createObjectURL(file);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const finalUrl = data.url || tempPreview;

      await updateUserProfileImage(null, {
        userId: user.id,
        imageUrl: finalUrl,
      });
      setPreview(finalUrl);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <Card className='overflow-hidden rounded-[36px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,#f4fdf9,transparent_55%),linear-gradient(180deg,#ffffff,rgba(255,255,255,0.8))] shadow-[0_25px_70px_rgba(15,23,42,0.08)]'>
      <CardContent className='relative overflow-hidden px-6 py-8 sm:px-8'>
        <div className='pointer-events-none absolute -right-16 top-4 h-40 w-40 rounded-full bg-emerald-100/60 blur-3xl' />
        <div className='pointer-events-none absolute left-8 top-0 h-28 w-28 rounded-full bg-sky-100/70 blur-2xl' />
        <div className='relative flex flex-col gap-6 lg:flex-row lg:items-center'>
          <div className='relative'>
            <Avatar className='h-24 w-24 rounded-full object-cover shadow-xl'>
              <AvatarImage src={preview} alt={user?.name || "Avatar"} />
              <AvatarFallback className='text-2xl uppercase'>
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <Button
              variant='outline'
              size='icon'
              className='absolute -right-2 -bottom-2 rounded-full border border-white bg-white text-slate-900 shadow-lg'
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className='h-4 w-4' />
            </Button>
            <input
              type='file'
              ref={fileInputRef}
              className='hidden'
              onChange={handleUpload}
            />
          </div>
          <div className='flex-1 space-y-2 text-slate-900'>
            <div className='flex items-center gap-3'>
              <Sparkles className='h-5 w-5 text-emerald-500' />
              <p className='text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600'>
                Your profile
              </p>
            </div>
            <h1 className='text-3xl font-semibold'>{user?.name || "User"}</h1>
            <p className='text-sm text-slate-500'>{user?.jobTitle || "Creator"}</p>
            <div className='flex flex-wrap gap-4 text-sm text-slate-500'>
              <span className='flex items-center gap-1'>
                <span className='font-semibold text-slate-900'>{user?.email}</span>
              </span>
              <span>{user?.location || "Location not set"}</span>
            </div>
          </div>
          <div>
            <Button variant='ghost' size='lg'>
              View account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
