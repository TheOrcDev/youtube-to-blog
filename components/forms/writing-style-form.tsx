"use client";

import { Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getWritingStyleById,
  MAX_STYLE_INSTRUCTIONS_LENGTH,
  WRITING_STYLES,
  type WritingStyleId,
} from "@/lib/writing-styles";
import type { WritingPreferences } from "@/server/user-preferences";
import { saveWritingPreferences } from "@/server/user-preferences";

interface WritingStyleFormProps {
  preferences: WritingPreferences;
}

export function WritingStyleForm({ preferences }: WritingStyleFormProps) {
  const [writingStyle, setWritingStyle] = useState<WritingStyleId>(
    preferences.writingStyle
  );
  const [instructions, setInstructions] = useState(
    preferences.styleInstructions
  );
  const [isSaving, setIsSaving] = useState(false);

  const canUseCustom = preferences.canUseCustomInstructions;

  async function onSave() {
    setIsSaving(true);

    try {
      const result = await saveWritingPreferences({
        styleInstructions: canUseCustom ? instructions : "",
        writingStyle,
      });

      if (result.ok) {
        toast.success("Writing style saved.");
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Writing style</CardTitle>
        <CardDescription>
          Choose the voice your generated blog posts are written in. You can
          still switch styles per generation on the convert form.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="writing-style-select">Default style</Label>
          <Select
            onValueChange={(value) => setWritingStyle(value as WritingStyleId)}
            value={writingStyle}
          >
            <SelectTrigger className="w-full" id="writing-style-select">
              <SelectValue placeholder="Pick a style" />
            </SelectTrigger>
            <SelectContent>
              {WRITING_STYLES.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-sm">
            {getWritingStyleById(writingStyle).description}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label
            className="flex items-center gap-2"
            htmlFor="style-instructions"
          >
            Custom style notes
            {canUseCustom ? null : <Badge variant="secondary">Pro</Badge>}
          </Label>
          {canUseCustom ? (
            <>
              <Textarea
                id="style-instructions"
                maxLength={MAX_STYLE_INSTRUCTIONS_LENGTH}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder={
                  "e.g. Short sentences. Dry humor. Address the reader as 'you'. Never use emoji."
                }
                rows={4}
                value={instructions}
              />
              <p className="text-muted-foreground text-xs">
                Applied on top of the selected style · {instructions.length}/
                {MAX_STYLE_INSTRUCTIONS_LENGTH}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-start gap-2 rounded-md border border-input border-dashed p-4 text-muted-foreground text-sm">
              <p className="flex items-center gap-1.5">
                <Lock className="size-4" />
                Describe your own voice and the AI writes every post in it.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled={isSaving} onClick={onSave} type="button">
          {isSaving ? <Loader2 className="animate-spin" /> : "Save style"}
        </Button>
      </CardFooter>
    </Card>
  );
}
