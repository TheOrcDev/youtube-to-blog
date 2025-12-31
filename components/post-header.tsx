interface Props {
  title: string;
  date: string;
  author: string;
}

export function PostHeader({ title, date, author }: Props) {
  return (
    <>
      <h1 className="mb-12 text-center font-bold text-5xl leading-tight tracking-tighter md:text-7xl md:leading-none lg:text-8xl">
        {title}
      </h1>

      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-2 md:mb-12">
          <div className="flex items-center gap-2">
            <p className="text-lg">{author}</p>
          </div>
          {date}
        </div>
      </div>
    </>
  );
}
