import Image from "next/image";
import { MainForm } from "@/components/forms/main-form";

export default function Generate() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center justify-center p-4">
      <h1 className="sr-only font-bold text-2xl">YouTube to Blog</h1>

      <Image
        alt="YouTube to Blog"
        height={500}
        src="/youtube-to-blog-logo.png"
        width={500}
      />

      <div className="absolute top-1/2 left-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 px-2">
        <MainForm />
      </div>
    </main>
  );
}
