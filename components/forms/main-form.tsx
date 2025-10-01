"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { SelectBlog } from "@/db/schema";
import { generateBlog } from "@/server/ai";
import { checkBlogExists } from "@/server/blogs";
import { BlogCard } from "../blog-card";

const formSchema = z.object({
  youtubeUrl: z.url().min(1, {
    message: "YouTube URL must be at least 2 characters.",
  }),
});

export function MainForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [blog, setBlog] = useState<SelectBlog | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtubeUrl: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const check = await checkBlogExists(values.youtubeUrl);

      if (check) {
        setBlog(check);
        toast.success("Blog already exists for this video.");
        return;
      }

      const generatedBlog = await generateBlog(values.youtubeUrl);

      setBlog(generatedBlog);
      toast.success("Blog has been created.");
    } catch {
      toast.error("Error creating blog.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          className="flex w-full gap-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="youtubeUrl"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="YouTube URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={isLoading} type="submit">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Convert"
            )}
          </Button>
        </form>
      </Form>

      {blog && (
        <div className="flex max-w-3xl flex-col gap-4">
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline">
              <Link href={`/blog/${blog.slug}`}>View Blog</Link>
            </Button>

            <Button
              onClick={() => {
                navigator.clipboard.writeText(blog.content);
                toast.success("Blog has been copied to clipboard.");
              }}
              variant="outline"
            >
              Copy Markdown
            </Button>
          </div>

          <BlogCard blog={blog} />
        </div>
      )}
    </>
  );
}
