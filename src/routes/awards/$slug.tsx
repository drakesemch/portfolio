import { Button } from '@/components/ui/button';
import { GlyphMatrix } from '@/components/ui/glyph-matrix'
import { getAward, getExperience, getExperienceList, getProjects } from '@/lib/pb'
import { cn } from '@/lib/utils';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, Award, Calendar, Dot, Rocket, UsersRound } from 'lucide-react';
import { Temporal } from 'temporal-polyfill';

export const Route = createFileRoute('/awards/$slug')({
  component: RouteComponent,
  loader: async ({ params: { slug }}) => {
    const award = await getAward({ data: { slug } });

    return { award };
  }
})

function numberSuffix(num: number): string {
  switch (num) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function RouteComponent() {
  const { award } = Route.useLoaderData();

  return (
    <main className="max-w-[100ch] mx-auto px-4 py-32">
      <div className="absolute top-0 left-0 -z-10 w-svw h-1/2 opacity-70">
        <GlyphMatrix fadeBottom={1} />
      </div>
      <div>
        <h1 className="font-black text-6xl">{award.name}</h1>
        <div className="flex-1 flex items-start justify-start flex-col gap-1 w-full mt-4">
          <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" /> {Temporal.Instant.from(award.date).toLocaleString(undefined, {
                year: "numeric",
                month: "long",
                day: "2-digit"
              })}
            </span>
            <Dot className="size-3 -mx-1" />
            <div className="">
              {award.place !== 0 ? `${award.place}${numberSuffix(award.place)}` : ""}
            </div>
            <div className="">
              {award.placeOf !== 0 ? `of ${award.placeOf}` : ""}
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-start justify-start flex-col gap-1 w-full mt-4">
          <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
            <span className="font-bold text-muted-foreground">Projects</span>
            {award.projects.length == 0 ? (
              <div className="text-xs text-muted-foreground italic">
                {"<no projects listed>"}
              </div>
            ) : award.projects.map((p) => (
              <Button size="sm" variant="outline" className={cn("text-xs h-6 cursor-pointer")} render={<Link to="/projects/$slug" params={{ slug: p.slug }} onClick={(e) => e.stopPropagation()} />}>
                <div className="bg-secondary/30 rounded-full size-2 -ml-1" />
                {p.name}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t typeset" dangerouslySetInnerHTML={{
          __html: award.display_article?.content ?? '<div class="text-muted-foreground text-xs text-center">No additional content provided</div>'
        }} />
      </div>
    </main>
  );
}
