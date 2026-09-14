import { Button } from '@/components/ui/button';
import { GlyphMatrix } from '@/components/ui/glyph-matrix'
import { getExperienceList, getProjects } from '@/lib/pb'
import { createFileRoute, Link } from '@tanstack/react-router';
import { cn } from 'cn';
import { ArrowUpRight, Award, BadgeCheck, BriefcaseBusiness, Calendar, CloudUpload, Dot, Globe, Rocket, UploadCloud, UsersRound } from 'lucide-react';
import { Temporal } from 'temporal-polyfill';

export const Route = createFileRoute('/experiences/')({
  component: RouteComponent,
  loader: async () => {
    const experiences = await getExperienceList({ data: { limit: 100_000 } });

    return { experiences };
  }
})

function RouteComponent() {
  const { experiences } = Route.useLoaderData();

  return (
    <main className="max-w-[100ch] mx-auto px-4 py-32">
      <div className="absolute top-0 left-0 -z-10 w-svw h-1/2 opacity-70">
        <GlyphMatrix fadeBottom={1} />
      </div>
      <div>
        <h1 className="font-black text-6xl">Experiences</h1>
        <div className="flex flex-col gap-2 mt-6">
          {experiences.map((e) => (
            <Link className="flex md:flex-row flex-col items-start gap-4 group/link hover:bg-secondary/30 rounded-xl p-2 transition-all cursor-pointer" to={`/experiences/${e.slug}`}>
              <div className="size-16 bg-secondary/30 rounded-md grid place-items-center">
                <BriefcaseBusiness className="size-8 stroke-3" />
              </div>
              <div className="flex-1 flex items-start justify-start flex-col gap-1 w-full">
                <h2 className="h2 font-black!">{e.name}</h2>
                <div className="flex-1 flex items-start justify-start flex-col gap-1 w-full mb-2">
                  <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" /> {Temporal.Instant.from(e.start).toLocaleString(undefined, {
                        year: "numeric",
                        month: "long",
                      })} – {e.end ? Temporal.Instant.from(e.end).toLocaleString(undefined, {
                        year: "numeric",
                        month: "long",
                      }) : "Present"}
                    </span>
                    <Dot className="size-3 -mx-1" />
                    <span className="flex items-center gap-1">
                      <UsersRound className="size-3" /> {e.roles.map((r) => r.name).toReversed().map((r, i, a) => i == 0 && a.length !== 1 ? `and ${r}` : r).toReversed().reduce((p,c,i,a) => a.length == 2 || i == 0 ? `${p} ${c}` : `${p}, ${c}`, "") || "<no roles>"}
                    </span>
                    <Dot className="size-3 -mx-1" />
                    <span className="flex items-center gap-1">
                      <Rocket className="size-3" /> {e.projects.length} mentioned projects
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground h-12 line-clamp-3">
                  {e.description || <>{"> description"}<br/>{">"}<br/>{">"}</>}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="text-xs h-6 cursor-pointer">
                    View Details <ArrowUpRight />
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
