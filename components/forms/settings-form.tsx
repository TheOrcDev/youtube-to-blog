"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AvatarUploadCard } from "@/components/forms/avatar-upload-card";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AccountSettings } from "@/server/users";
import { changeAccountPassword, updateUsername } from "@/server/users";

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 50;
const MIN_PASSWORD_LENGTH = 8;

const usernameSchema = z.object({
  username: z.string().trim().min(MIN_USERNAME_LENGTH).max(MAX_USERNAME_LENGTH),
});

const passwordSchema = z
  .object({
    confirmPassword: z.string().min(MIN_PASSWORD_LENGTH),
    currentPassword: z.string().min(MIN_PASSWORD_LENGTH),
    newPassword: z.string().min(MIN_PASSWORD_LENGTH),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function UsernameForm({ settings }: { settings: AccountSettings }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof usernameSchema>>({
    defaultValues: {
      username: settings.name,
    },
    resolver: zodResolver(usernameSchema),
  });

  async function onSubmit(values: z.infer<typeof usernameSchema>) {
    setIsLoading(true);

    try {
      const result = await updateUsername(values.username);

      if (result.ok) {
        toast.success("Username updated.");
        form.reset({ username: values.username.trim() });
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Could not update your username. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          This is how you appear in the dashboard. Your email stays on the
          account you signed up with.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="gap-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="username"
                      placeholder="your name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    At least {MIN_USERNAME_LENGTH} characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-2">
              <Label htmlFor="account-email">Email</Label>
              <Input
                autoComplete="email"
                disabled
                id="account-email"
                readOnly
                type="email"
                value={settings.email}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={settings.emailVerified ? "secondary" : "outline"}
                >
                  {settings.emailVerified ? "Verified" : "Unverified"}
                </Badge>
                <p className="text-muted-foreground text-sm">
                  Email cannot be changed.
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              <p className="font-medium text-sm">Member since</p>
              <p className="text-muted-foreground text-sm">
                {settings.createdAt}
              </p>
            </div>
          </CardContent>
          <CardFooter className="mt-(--card-spacing) border-t">
            <Button
              disabled={isLoading || !form.formState.isDirty}
              type="submit"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Save username"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

function PasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof passwordSchema>>({
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
    },
    resolver: zodResolver(passwordSchema),
  });

  async function onSubmit(values: z.infer<typeof passwordSchema>) {
    setIsLoading(true);

    try {
      const result = await changeAccountPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (result.ok) {
        toast.success("Password updated.");
        form.reset();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Could not update your password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Choose a new password for email sign-in. This does not change Google
          sign-in.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="gap-6">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="current-password"
                      placeholder="********"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="new-password"
                      placeholder="********"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    At least {MIN_PASSWORD_LENGTH} characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="new-password"
                      placeholder="********"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="mt-(--card-spacing) border-t">
            <Button disabled={isLoading} type="submit">
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Update password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export function SettingsForm({ settings }: { settings: AccountSettings }) {
  return (
    <div className="flex flex-col gap-6">
      <AvatarUploadCard
        email={settings.email}
        image={settings.image}
        name={settings.name}
      />
      <UsernameForm settings={settings} />
      {settings.hasPassword ? (
        <PasswordForm />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              You sign in with Google, so there is no password on this account.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
