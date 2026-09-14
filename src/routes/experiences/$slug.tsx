import { Button } from '@/components/ui/button';
import { GlyphMatrix } from '@/components/ui/glyph-matrix'
import { getExperience, getExperienceList, getProjects } from '@/lib/pb'
import { cn } from '@/lib/utils';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, Award, Calendar, Dot, Rocket, UsersRound } from 'lucide-react';
import { Temporal } from 'temporal-polyfill';

export const Route = createFileRoute('/experiences/$slug')({
  component: RouteComponent,
  loader: async ({ params: { slug }}) => {
    const experience = await getExperience({ data: { slug } });

    return { experience };
  }
})

function RouteComponent() {
  const { experience } = Route.useLoaderData();

  return (
    <main className="max-w-[100ch] mx-auto px-4 py-32">
      <div className="absolute top-0 left-0 -z-10 w-svw h-1/2 opacity-70">
        <GlyphMatrix fadeBottom={1} />
      </div>
      <div>
        <h1 className="font-black text-6xl">{experience.name}</h1>
        <div className="flex-1 flex items-start justify-start flex-col gap-1 w-full mt-4">
          <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" /> {Temporal.Instant.from(experience.start).toLocaleString(undefined, {
                year: "numeric",
                month: "long",
              })} – {experience.end ? Temporal.Instant.from(experience.end).toLocaleString(undefined, {
                year: "numeric",
                month: "long",
              }) : "Present"}
            </span>
            <Dot className="size-3 -mx-1" />
            <span className="flex items-center gap-1">
              <UsersRound className="size-3" /> {experience.roles.map((r) => r.name).toReversed().map((r, i, a) => i == 0 && a.length !== 1 ? `and ${r}` : r).toReversed().reduce((p,c,i,a) => a.length == 2 || i == 0 ? `${p} ${c}` : `${p}, ${c}`, "")}
            </span>
          </div>
        </div>
        <div className="flex-1 flex items-start justify-start flex-col gap-1 w-full mt-4">
          <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
            <span className="font-bold text-muted-foreground">Projects</span>
            {experience.projects.length == 0 ? (
              <div className="text-xs text-muted-foreground italic">
                {"<no projects listed>"}
              </div>
            ) : experience.projects.map((p) => (
              <Button size="sm" variant="outline" className={cn("text-xs h-6 cursor-pointer")} render={<Link to="/projects/$slug" params={{ slug: p.slug }} onClick={(e) => e.stopPropagation()} />}>
                <div className="bg-secondary/30 rounded-full size-2 -ml-1" />
                {p.name}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t typeset" dangerouslySetInnerHTML={{
          __html: experience.display_article?.content ?? '<div class="text-muted-foreground text-xs text-center">No additional content provided</div>'
        }} />
      </div>
    </main>
  );
}
