"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { SelectBlog } from "@/db/schema";
import { authClient } from "@/lib/auth-client";
import { toPublicBlogError } from "@/server/blog-errors";
import { requestBlog } from "@/server/request-blog";
import { BlogCard } from "../blog-card";

const formSchema = z.object({
  youtubeUrl: z.url().min(1, {
    message: "YouTube URL must be at least 2 characters.",
  }),
});

export function MainForm() {
  const router = useRouter();
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
      const user = await authClient.getSession();

      if (!user.data) {
        toast.error("Please login to create a blog.");
        return;
      }

      setIsLoading(true);
      const result = await requestBlog(values.youtubeUrl);

      if (!result.ok) {
        toast.error(result.error.message, {
          action:
            result.error.code === "QUOTA_EXCEEDED"
              ? {
                  label: "Upgrade",
                  onClick: () => router.push("/pricing"),
                }
              : undefined,
        });
        return;
      }

      setBlog(result.blog);
      toast.success(
        result.status === "existing"
          ? "Blog already exists for this video."
          : "Blog has been created."
      );
    } catch (error) {
      toast.error(toPublicBlogError(error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          className="flex w-full gap-2 px-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="youtubeUrl"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="sr-only">YouTube URL</FormLabel>
                <FormControl>
                  <InputGroup className="w-full">
                    <InputGroupInput placeholder="YouTube URL" {...field} />
                    <InputGroupAddon
                      align="inline-end"
                      className="h-full py-0 pr-0 has-[>button]:mr-0"
                    >
                      <InputGroupButton
                        aria-label="Convert YouTube video to blog"
                        className="h-full rounded-none rounded-r-[calc(var(--radius)-1px)]"
                        disabled={isLoading}
                        size="sm"
                        type="submit"
                        variant="default"
                      >
                        {isLoading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Convert"
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {blog ? (
        <div className="mt-6 w-full max-w-3xl text-left">
          <BlogCard blog={blog} />
        </div>
      ) : null}
    </>
  );
}
