"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AvatarPicker } from "@/components/forms/avatar-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateUserImage } from "@/server/users";

interface AvatarUploadCardProps {
  email: string;
  image: string | null;
  name: string;
}

export function AvatarUploadCard({
  email,
  image,
  name,
}: AvatarUploadCardProps) {
  const router = useRouter();
  const [preview, setPreview] = useState(image);
  const [isPending, setIsPending] = useState(false);

  async function save(nextImage: string | null) {
    setIsPending(true);

    try {
      const result = await updateUserImage(nextImage);

      if (result.ok) {
        setPreview(nextImage);
        toast.success(
          nextImage ? "Profile photo updated." : "Profile photo removed."
        );
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Could not update your photo. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile photo</CardTitle>
        <CardDescription>
          A square image works best. It is cropped to the centre and resized
          before it is saved. Google sign-up uses your Google photo unless you
          replace it here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AvatarPicker
          email={email}
          image={preview}
          isPending={isPending}
          name={name}
          onRemove={() => save(null)}
          onSelect={(dataUri) => save(dataUri)}
        />
      </CardContent>
    </Card>
  );
}
