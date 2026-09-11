import { Backlight } from '@/components/ui/backlight';
import { Button } from '@/components/ui/button';
import { GlyphMatrix } from '@/components/ui/glyph-matrix'
import { getProject } from '@/lib/pb';
import { createFileRoute } from '@tanstack/react-router'
import { cn } from 'cn';
import { ArrowUpRight, Award, BadgeCheck, Calendar, CloudUpload, Dot, Globe, UploadCloud } from 'lucide-react';
import { Temporal } from 'temporal-polyfill';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export const Route = createFileRoute('/projects/$slug')({
  component: RouteComponent,
  loader: async ({params: {slug}}) => {
    const project = await getProject({ data: { slug } });

    return { project };
  }
})

function RouteComponent() {
  const { project } = Route.useLoaderData();

  return (
    <main className="max-w-[100ch] mx-auto px-4 pt-16 pb-32">
      <div className="absolute top-0 left-0 -z-10 w-svw h-1/2 opacity-70">
        <GlyphMatrix fadeBottom={1} />
      </div>
      <div>
        <div
          className="flex items-start gap-2 relative h-64 overflow-clip [mask-image:linear-gradient(to_bottom,black_30%,transparent_100%)] p-20 -m-20 -mb-8"
        >
          {/*{project.desktop_preview && (*/}
          <Backlight blur={30} saturation={10} className="-rotate-2">
            {project.desktop_preview ? (<img src={project.desktop_preview} className="w-full aspect-video border border-foreground/20! rounded-md" />) : (<div className="w-full -bg-linear-60 from-background to-secondary/20 aspect-video" />)}
          </Backlight>
          {/*)}*/}
          {project.mobile_preview && (
            <img src={project.mobile_preview} className="absolute h-4/5 rotate-3 top-2/4 right-8 aspect-9/19.5 border border-foreground/20! rounded-md" />
          )}
        </div>
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="-mx-4"
        >
          <div className="rounded-md overflow-clip">
          <CarouselContent className="h-96 -ml-2">
            {project.presentation_url && (
              <CarouselItem className="pl-2 basis-auto h-full">
                <iframe
                  src={project.presentation_url}
                  className="h-full aspect-video rounded-md border border-foreground/20!"
                />
              </CarouselItem>
            )}
            {project.desktop_preview && (
              <CarouselItem className="pl-2 basis-auto h-full">
                <img
                  src={project.desktop_preview}
                  className="h-full w-auto rounded-md border border-foreground/20!"
                />
              </CarouselItem>
            )}
            {project.mobile_preview && (
              <CarouselItem className="pl-2 basis-auto h-full">
                <img
                  src={project.mobile_preview}
                  className="h-full w-auto rounded-md border border-foreground/20!"
                />
              </CarouselItem>
            )}
            {project.screenshots.map((s) => (
              <CarouselItem key={s} className="pl-2 basis-auto h-full">
                <img
                  src={s}
                  className="h-full w-auto rounded-md border border-foreground/20!"
                />
              </CarouselItem>
            ))}
            </CarouselContent>
          </div>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <h1 className="font-black text-6xl mt-6">{project.name}</h1>
        <div className="flex-1 flex items-start justify-start flex-col gap-1 w-full mt-4">
          <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" /> Released {project.released ? Temporal.Instant.from(project.released).toLocaleString(undefined, {
                year: "numeric",
                month: "long",
              }) : "Unknown"}
            </span>
            {project.published && (
              <>
                <Dot className="size-3 -mx-1" />
                <span className="flex items-center gap-1">
                  <BadgeCheck className="size-3" /> Published
                </span>
              </>
            )}
            {project.awards.length >= 1 && (
              <>
                <Dot className="size-3 -mx-1" />
                <span className="flex items-center gap-1">
                  <Award className="size-3" /> Recieved {project.awards.length} award{project.awards.length !== 1 ? "s" : ""}
                </span>
              </>
            )}
            {project.deployable && (
              <>
                <Dot className="size-3 -mx-1" />
                <span className="flex items-center gap-1">
                  <UploadCloud className="size-3" /> Deployable
                </span>
              </>
            )}
            {project.open_source && (
              <>
                <Dot className="size-3 -mx-1" />
                <span className="flex items-center gap-1">
                  <Globe className="size-3" /> Open Source
                </span>
              </>
            )}
          </div>
          <div className="my-2 flex items-center gap-2">
            {project.deployable && (
              <Button size="sm" variant="secondary" className="text-xs h-6 cursor-not-allowed opacity-10">
                Deploy <CloudUpload />
              </Button>
            )}
            {project.published && (
              <Button size="sm" variant="secondary" className={cn("text-xs h-6 cursor-pointer", !project.display_url && "opacity-10 cursor-not-allowed")} disabled={!project.display_url} render={<a href={project.display_url || `/projects/${project.slug}`} onClick={(e) => e.stopPropagation()} target="_blank" />}>
                {project.deployable ? "Open Demo" : "Open Application"} <ArrowUpRight />
              </Button>
            )}
          </div>
          <div className="text-xs text-muted-foreground h-12 line-clamp-3">
            {project.description || <>{"> description"}<br/>{">"}<br/>{">"}</>}
          </div>
        </div>
      </div>
    </main>
  )
}
