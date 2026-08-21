"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { SelectBlog } from "@/db/schema";
import { authClient } from "@/lib/auth-client";
import { toPublicBlogError } from "@/server/blog-errors";
import { requestBlog } from "@/server/request-blog";
import { ButtonGroup } from "../ui/button-group";

const formSchema = z.object({
  youtubeUrl: z.url().min(1, {
    message: "YouTube URL must be at least 2 characters.",
  }),
});

interface YoutubeUrlFormProps {
  onBlogCreated: (blog: SelectBlog) => void;
  styleId?: string;
}

export function YoutubeUrlForm({
  onBlogCreated,
  styleId,
}: YoutubeUrlFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      youtubeUrl: "",
    },
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const user = await authClient.getSession();

      if (!user.data) {
        toast.error("Please login to create a blog.");
        return;
      }

      setIsLoading(true);
      const result = await requestBlog(values.youtubeUrl, styleId);

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

      onBlogCreated(result.blog);
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
              <FormLabel className="sr-only">YouTube URL</FormLabel>
              {/* ButtonGroup gives each child its own focus ring, which stops
                  where the button begins. Lift the ring to the wrapper so the
                  joined control lights up as one, and scope it to the input so
                  a keyboard user can still tell the button apart when tabbing
                  to it. */}
              <ButtonGroup className="w-full rounded-md ring-offset-background has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring has-[input:focus-visible]:ring-offset-2">
                <FormControl>
                  <Input
                    className="h-10 px-3 text-sm shadow-none focus-visible:border-input focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="YouTube URL"
                    {...field}
                  />
                </FormControl>
                <Button
                  aria-label="Convert YouTube video to blog"
                  className="h-10 min-w-28 px-4"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Convert"}
                </Button>
              </ButtonGroup>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
