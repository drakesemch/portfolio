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
import { DynamicIcon } from 'lucide-react/dynamic';

export const Route = createFileRoute('/projects/$slug')({
  component: RouteComponent,
  loader: async ({params: {slug}}) => {
    const project = await getProject({ data: { slug } });

    return { project };
  }
})

function RouteComponent() {
  const { project } = Route.useLoaderData();

  const links = [
    ...(project.repository_url ? [
      {
        label: "Git Repository",
        icon: "git-branch",
        url: project.repository_url,
      }
    ] : []),
    ...(project.presentation_url ? [
      {
        label: "Presentation",
        icon: "presentation",
        url: project.presentation_url,
      }
    ] : []),
    ...project.links,
  ]

  return (
    <main className="max-w-[100ch] mx-auto px-4 pt-16 pb-32">
      <div className="absolute top-0 left-0 -z-10 w-svw h-1/2 opacity-70">
        <GlyphMatrix fadeBottom={1} />
      </div>
      <div>
        {(project.desktop_preview || project.mobile_preview) && (
          <div
            className="flex items-start gap-2 relative h-64 overflow-clip [mask-image:linear-gradient(to_bottom,black_30%,transparent_100%)] p-20 -m-20 -mb-8"
          >
            {project.desktop_preview && (
              <Backlight blur={40} saturation={10} className="-rotate-2 absolute top-1/5">
                <img src={project.desktop_preview} className="w-full aspect-video border border-foreground/20! rounded-md" />
              </Backlight>
            )}
            {project.mobile_preview && project.desktop_preview && (
              <img src={project.mobile_preview} className="absolute h-[120%] rotate-4 top-1/4 right-20 aspect-9/19.5 border border-foreground/20! rounded-md" />
            )}
            {project.mobile_preview && !project.desktop_preview && (
              <img src={project.mobile_preview} className="absolute w-1/2 rotate-4 top-1/4 left-1/2 -ml-8 -translate-x-1/2 aspect-9/19.5 border border-foreground/20! rounded-md" />
            )}
          </div>
        )}
        {(project.presentation_url || project.desktop_preview || project.mobile_preview || project.screenshots.length > 0) && (
          <div className="max-w-[calc(100vw-16rem)] w-[calc(100%)] mx-auto">
            <Carousel
              opts={{
                align: "start",
                dragFree: true,
              }}
              className="-mx-12"
            >
              <div className="rounded-md overflow-clip">
                <CarouselContent className="h-64 -ml-2">
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
          </div>
        )}
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
              <Button size="sm" variant="secondary" className={cn("text-xs h-6 cursor-pointer", !project.display_url && "opacity-10 cursor-not-allowed")} disabled={!project.display_url} render={<a href={project.display_url || undefined} onClick={(e) => e.stopPropagation()} target="_blank" />}>
                {project.deployable ? "Open Demo" : "Open Application"} <ArrowUpRight />
              </Button>
            )}
            {links.length > 0 && (
              <>
                {(project.deployable || project.published) && (<Dot className="size-3 -mx-1 text-muted-foreground" />)}
                {links.map((l) => (
                  <Button size="sm" variant="outline" className={cn("text-xs h-6 cursor-pointer")} render={<a href={l.url || undefined} onClick={(e) => e.stopPropagation()} target="_blank" />}>
                    <div className="size-3">
                    <DynamicIcon name={l.icon} className="size-3" />
                    </div>
                    {l.label}
                  </Button>
                ))}
              </>
            )}
          </div>
          {project.tech_stack.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap -mt-2">
              <span className="font-bold text-xs text-muted-foreground mr-2">Tech Stack / APIs</span>
              {project.tech_stack.map((s) => (
                <Button size="sm" variant="outline" className={cn("text-xs h-6 cursor-pointer")} render={<a href={s.url} target="_blank" />}>
                  <div className="size-3">
                    <DynamicIcon name={s.icon} className="size-3" />
                  </div>
                  {s.name}
                </Button>
              ))}
            </div>
          )}
          <div className="text-xs text-muted-foreground h-12 line-clamp-3">
            {project.description || <>{"> description"}<br/>{">"}<br/>{">"}</>}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t typeset" dangerouslySetInnerHTML={{
          __html: project.start_article?.content ?? '<div class="text-muted-foreground text-xs text-center">No additional content provided</div>'
        }} />
      </div>
    </main>
  )
}
