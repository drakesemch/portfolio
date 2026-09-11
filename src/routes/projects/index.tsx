import { Button } from '@/components/ui/button';
import { GlyphMatrix } from '@/components/ui/glyph-matrix'
import { getProjects } from '@/lib/pb'
import { createFileRoute, Link } from '@tanstack/react-router';
import { cn } from 'cn';
import { ArrowUpRight, Award, BadgeCheck, Calendar, CloudUpload, Dot, Globe, UploadCloud } from 'lucide-react';
import { Temporal } from 'temporal-polyfill';

export const Route = createFileRoute('/projects/')({
  component: RouteComponent,
  loader: async () => {
    const projects = await getProjects({ data: {} });

    return { projects };
  }
})

function RouteComponent() {
  const { projects } = Route.useLoaderData();

  return (
    <main className="max-w-[100ch] mx-auto px-4 py-32">
      <div className="absolute top-0 left-0 -z-10 w-svw h-1/2 opacity-70">
        <GlyphMatrix fadeBottom={1} />
      </div>
      <div>
        <h1 className="font-black text-6xl">Projects</h1>
        <div className="flex flex-col gap-2 mt-6">
          {projects.map((p) => (
            <Link className="flex md:flex-row flex-col items-center gap-4 group/link hover:bg-secondary/30 rounded-xl p-2 transition-all cursor-pointer" to={`/projects/${p.slug}`}>
              <div className="h-42 flex aspect-video items-center gap-2 overflow-clip mr-auto">
                <div className="aspect-video h-full rounded-lg overflow-clip border border-foreground/20!">{p.desktop_preview ? <img src={p.desktop_preview} className="h-full w-full" /> : <div className="w-full h-full -bg-linear-60 from-background to-secondary/20" />}</div>
                <div className="aspect-9/19.5 h-full -ml-24 border border-foreground/20! relative top-28 shadow-2xl rounded-sm overflow-clip rotate-3 scale-90 group-hover/link:rotate-0 group-hover/link:top-0 group-hover/link:-ml-22.5 transition-all">{p.mobile_preview ? <img src={p.mobile_preview} className="h-full w-full" /> : <div className="w-full h-full -bg-linear-60 from-background to-secondary/20" />}</div>
              </div>
              <div className="flex-1 flex items-start justify-start flex-col gap-1 w-full">
                <h2 className="h2 font-black!">{p.name}</h2>
                <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" /> Released {p.released ? Temporal.Instant.from(p.released).toLocaleString(undefined, {
                      year: "numeric",
                      month: "long",
                    }) : "Unknown"}
                  </span>
                  {p.published && (
                    <>
                      <Dot className="size-3 -mx-1" />
                      <span className="flex items-center gap-1">
                        <BadgeCheck className="size-3" /> Published
                      </span>
                    </>
                  )}
                  {p.awards.length >= 1 && (
                    <>
                      <Dot className="size-3 -mx-1" />
                      <span className="flex items-center gap-1">
                        <Award className="size-3" /> Recieved {p.awards.length} award{p.awards.length !== 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                  {p.deployable && (
                    <>
                      <Dot className="size-3 -mx-1" />
                      <span className="flex items-center gap-1">
                        <UploadCloud className="size-3" /> Deployable
                      </span>
                    </>
                  )}
                  {p.open_source && (
                    <>
                      <Dot className="size-3 -mx-1" />
                      <span className="flex items-center gap-1">
                        <Globe className="size-3" /> Open Source
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs text-muted-foreground h-12 line-clamp-3">
                  {p.description || <>{"> description"}<br/>{">"}<br/>{">"}</>}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {p.deployable && (
                    <Button size="sm" variant="secondary" className="text-xs h-6 cursor-not-allowed opacity-10">
                      Deploy <CloudUpload />
                    </Button>
                  )}
                  {p.published && (
                    <Button size="sm" variant="secondary" className={cn("text-xs h-6 cursor-pointer", !p.display_url && "opacity-10 cursor-not-allowed")} disabled={!p.display_url} render={<a href={p.display_url || `/projects/${p.slug}`} onClick={(e) => e.stopPropagation()} target="_blank" />}>
                      {p.deployable ? "Open Demo" : "Open Application"} <ArrowUpRight />
                    </Button>
                  )}
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
