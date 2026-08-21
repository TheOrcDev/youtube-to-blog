"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { UploadVideoForm } from "@/components/forms/upload-video-form";
import { YoutubeUrlForm } from "@/components/forms/youtube-url-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SelectBlog } from "@/db/schema";
import {
  DEFAULT_WRITING_STYLE_ID,
  WRITING_STYLES,
  type WritingStyleId,
} from "@/lib/writing-styles";
import { BlogCard } from "../blog-card";

interface MainFormProps {
  canUpload: boolean;
  defaultStyle?: WritingStyleId;
}

export function MainForm({ canUpload, defaultStyle }: MainFormProps) {
  const [blog, setBlog] = useState<SelectBlog | null>(null);
  const [styleId, setStyleId] = useState<WritingStyleId>(
    defaultStyle ?? DEFAULT_WRITING_STYLE_ID
  );

  return (
    <div className="flex w-full min-w-0 flex-col items-center">
      <Tabs className="w-full items-center px-5" defaultValue="youtube">
        <TabsList>
          <TabsTrigger value="youtube">YouTube link</TabsTrigger>
          <TabsTrigger value="upload">
            Upload video
            {canUpload ? null : <Badge variant="secondary">Pro</Badge>}
          </TabsTrigger>
        </TabsList>
        <TabsContent className="w-full" value="youtube">
          <YoutubeUrlForm onBlogCreated={setBlog} styleId={styleId} />
        </TabsContent>
        <TabsContent className="w-full" value="upload">
          {canUpload ? (
            <UploadVideoForm onBlogCreated={setBlog} styleId={styleId} />
          ) : (
            <div className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-md border border-input border-dashed text-muted-foreground text-sm">
              <p className="flex items-center gap-1.5">
                <Lock className="size-4" />
                Video uploads are a Pro feature.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span>Writing style</span>
          <Select
            onValueChange={(value) => setStyleId(value as WritingStyleId)}
            value={styleId}
          >
            <SelectTrigger
              aria-label="Writing style"
              className="h-8 w-auto gap-1.5 border-none bg-transparent px-2 font-medium text-foreground shadow-none"
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WRITING_STYLES.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Tabs>

      {blog ? (
        <div className="mt-6 w-full max-w-3xl px-5">
          <BlogCard blog={blog} />
        </div>
      ) : null}
    </div>
  );
}
