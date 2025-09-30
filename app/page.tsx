import { MainForm } from "@/components/forms/main-form";

export default function Generate() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 p-4">
      <h1 className="font-bold text-2xl">YouTube to Blog</h1>
      <p className="text-muted-foreground text-sm">
        Enter a YouTube video URL to convert to a blog post
      </p>
      <MainForm />
    </main>
  );
}
