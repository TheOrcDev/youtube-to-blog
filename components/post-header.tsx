import Image from "next/image";
import DateFormatter from "@/components/date-formatter";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  author: string;
};

export function PostHeader({ title, coverImage, date, author }: Props) {
  return (
    <>
      <h1 className="mb-12 text-center font-bold text-5xl leading-tight tracking-tighter md:text-left md:text-7xl md:leading-none lg:text-8xl">
        {title}
      </h1>

      <div className="mb-8 sm:mx-0 md:mb-16">
        <Image
          alt={`Cover Image for ${title}`}
          className={cn("w-full shadow-sm", {
            "transition-shadow duration-200 hover:shadow-lg": title,
          })}
          height={630}
          src={coverImage}
          width={1300}
        />
      </div>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-2 md:mb-12">
          <div className="flex items-center gap-2">
            <p className="text-lg">{author}</p>
          </div>
          <DateFormatter dateString={date} />
        </div>
      </div>
    </>
  );
}
