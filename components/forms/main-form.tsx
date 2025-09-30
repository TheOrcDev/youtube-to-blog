"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { remark } from "remark";
import html from "remark-html";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { generateBlog } from "@/server/ai";

const formSchema = z.object({
  youtubeUrl: z.url().min(1, {
    message: "YouTube URL must be at least 2 characters.",
  }),
});

export function MainForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [blog, setBlog] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtubeUrl: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const generatedBlog = await generateBlog(values.youtubeUrl);
      const result = await remark().use(html).process(generatedBlog);
      const htmlBlog = result.toString();
      setBlog(htmlBlog);
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
          className="w-full space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="youtubeUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube URL</FormLabel>
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
        <div className="max-w-3xl">
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline">
              <Link href={`/blog/${blog}`}>View Blog</Link>
            </Button>

            <Button
              onClick={() => {
                navigator.clipboard.writeText(blog);
                toast.success("Blog has been copied to clipboard.");
              }}
              variant="outline"
            >
              Copy Markdown
            </Button>
          </div>
          <div className="typography">
            <div dangerouslySetInnerHTML={{ __html: blog }} />
          </div>
        </div>
      )}
    </>
  );
}
