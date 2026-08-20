"use client";

import { Loader2 } from "lucide-react";
import { type ChangeEvent, useId, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MAX_AVATAR_DATA_URI_BYTES,
  MAX_AVATAR_SOURCE_BYTES,
} from "@/lib/account/avatar";
import { toSquareAvatarDataUri } from "@/lib/account/crop-avatar";
import { getAvatarInitials } from "@/lib/account/initials";

interface AvatarPickerProps {
  disabled?: boolean;
  email: string;
  image: string | null;
  isPending?: boolean;
  name: string;
  onRemove?: () => Promise<void> | void;
  onSelect: (dataUri: string) => Promise<void> | void;
}

export function AvatarPicker({
  disabled = false,
  email,
  image,
  isPending = false,
  name,
  onRemove,
  onSelect,
}: AvatarPickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isDisabled = disabled || isPending;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.size > MAX_AVATAR_SOURCE_BYTES) {
      setErrorMessage("Choose an image under 8 MB.");
      return;
    }

    setErrorMessage(null);

    try {
      const dataUri = await toSquareAvatarDataUri(file);

      if (dataUri.length > MAX_AVATAR_DATA_URI_BYTES) {
        setErrorMessage("That image could not be saved. Try a simpler photo.");
        return;
      }

      await onSelect(dataUri);
    } catch {
      setErrorMessage("That file is not a readable image.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-5">
        <Avatar className="size-16">
          {image ? <AvatarImage alt="" src={image} /> : null}
          <AvatarFallback className="text-lg">
            {getAvatarInitials(name, email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={inputId}>
            Profile image file
          </label>
          <input
            accept="image/png,image/jpeg,image/webp"
            aria-label="Profile image file"
            className="sr-only"
            disabled={isDisabled}
            id={inputId}
            onChange={handleFileChange}
            ref={inputRef}
            type="file"
          />
          <Button
            disabled={isDisabled}
            onClick={() => inputRef.current?.click()}
            type="button"
            variant="outline"
          >
            {isPending ? <Loader2 className="animate-spin" /> : null}
            {image ? "Change photo" : "Upload photo"}
          </Button>
          {image && onRemove ? (
            <Button
              disabled={isDisabled}
              onClick={async () => {
                await onRemove();
              }}
              type="button"
              variant="ghost"
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      {errorMessage ? (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
