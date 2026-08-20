"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { UploadVideoForm } from "@/components/forms/upload-video-form";
import { YoutubeUrlForm } from "@/components/forms/youtube-url-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SelectBlog } from "@/db/schema";
import { BlogCard } from "../blog-card";

interface MainFormProps {
  canUpload: boolean;
}

export function MainForm({ canUpload }: MainFormProps) {
  const [blog, setBlog] = useState<SelectBlog | null>(null);

  return (
    <>
      <Tabs className="w-full items-center px-5" defaultValue="youtube">
        <TabsList>
          <TabsTrigger value="youtube">YouTube link</TabsTrigger>
          <TabsTrigger value="upload">
            Upload video
            {canUpload ? null : <Badge variant="secondary">Pro</Badge>}
          </TabsTrigger>
        </TabsList>
        <TabsContent className="w-full" value="youtube">
          <YoutubeUrlForm onBlogCreated={setBlog} />
        </TabsContent>
        <TabsContent className="w-full" value="upload">
          {canUpload ? (
            <UploadVideoForm onBlogCreated={setBlog} />
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
      </Tabs>

      {blog ? (
        <div className="mt-6 w-full max-w-3xl text-left">
          <BlogCard blog={blog} />
        </div>
      ) : null}
    </>
  );
}
