import { Button } from '@/components/ui/button';
import { GlyphMatrix } from '@/components/ui/glyph-matrix'
import { getAwards, getExperienceList, getProjects } from '@/lib/pb'
import { createFileRoute, Link } from '@tanstack/react-router';
import { cn } from 'cn';
import { ArrowUpRight, Award, BadgeCheck, Calendar, CloudUpload, Dot, Globe, Rocket, UploadCloud, UsersRound } from 'lucide-react';
import { Temporal } from 'temporal-polyfill';

export const Route = createFileRoute('/awards/')({
  component: RouteComponent,
  loader: async () => {
    const awards = await getAwards({ data: { limit: 100_000 } });

    return { awards };
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
  const { awards } = Route.useLoaderData();

  return (
    <main className="max-w-[100ch] mx-auto px-4 py-32">
      <div className="absolute top-0 left-0 -z-10 w-svw h-1/2 opacity-70">
        <GlyphMatrix fadeBottom={1} />
      </div>
      <div>
        <h1 className="font-black text-6xl">Awards</h1>
        <div className="flex flex-col gap-2 mt-6">
          {awards.map((a) => (
            <Link className="flex md:flex-row flex-col items-start gap-4 group/link hover:bg-secondary/30 rounded-xl p-2 transition-all cursor-pointer pr-8 text-pretty" to={`/awards/${a.slug}`}>
              <div className="flex flex-row md:flex-col gap-2 items-center">
                <div className="size-16 bg-secondary/30 rounded-md grid place-items-center">
                  <Award className="size-8 stroke-3" />
                </div>
                <div className="text-center font-bold text-lg">
                  {a.place !== 0 ? `${a.place}${numberSuffix(a.place)}` : ""}
                </div>
                <div className="text-center text-muted-foreground text-xs">
                  {a.placeOf !== 0 ? `of ${a.placeOf}` : ""}
                </div>
              </div>
              <div className="flex-1 flex items-start justify-start flex-col gap-1 w-full">
                <h2 className="h2 font-black!">{a.name}</h2>
                <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" /> {Temporal.Instant.from(a.date).toLocaleString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "2-digit"
                    })}
                  </span>
                  <Dot className="size-3 -mx-1" />
                  <span className="flex items-center gap-1">
                    <Rocket className="size-3" /> {a.projects.length} mentioned projects
                  </span>
                </div>
                <div className="text-xs text-muted-foreground h-12 line-clamp-3">
                  {a.description || <>{"> description"}<br/>{">"}<br/>{">"}</>}
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
