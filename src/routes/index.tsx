import { Button } from "@/components/ui/button";
import { getAward, getConfigByKey, getExperienceList, getProject, getSkills } from "@/lib/pb";
import { cn } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Award, BriefcaseBusiness, Calendar, ChevronsUp, ChevronsUpDown, Dot, Download, FileUser, Link2, PanelsTopLeft, TriangleAlert, Trophy, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DynamicIcon } from "lucide-react/dynamic";
import { Temporal } from "temporal-polyfill";
import { toast } from "sonner";
import { Backlight } from "@/components/ui/backlight";
import { GlyphMatrix } from "@/components/ui/glyph-matrix";
import { Marquee } from "@/components/ui/marquee";
import seedrandom from "seedrandom";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger, PopoverClose } from "@/components/ui/popover";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const resumeLink = await getConfigByKey({ data: { key: "resume" } });

    const previews = (await Promise.all(
      Array.from({ length: 5 }).map(
        async (_, i) =>
          await getConfigByKey({ data: { key: `preview-${i + 1}` } }),
      ),
    )) as Awaited<ReturnType<typeof getConfigByKey>>[];
    const projects = await Promise.all(
      previews.map(
        async (preview) => await getProject({ data: { slug: preview ?? undefined } }),
      ),
    );
    const skills = await getSkills({ data: {} });
    const experiences = await getExperienceList({ data: { limit: 3 } });
    const awardKeys = (await Promise.all(
      Array.from({ length: 3 }).map(
        async (_, i) =>
          await getConfigByKey({ data: { key: `award-${i + 1}` } }),
      ),
    )) as Awaited<ReturnType<typeof getConfigByKey>>[];
    const awards = await Promise.all(
      awardKeys.map(
        async (item) => await getAward({ data: { slug: item ?? undefined } }),
      ),
    );
    const subtext = await getConfigByKey({ data: { key: "subtext" } });
    const globalProject = await getProject({ data: { slug: "<global>" } });
    return { resumeLink, subtext, projects, skills, experiences, awards, globalProject };
  },
});

type ThumbStyle = {
  offset: string;
  top: string;
  rotate: string;
  z: string;
  delay: string;
  hoverDelay: string;
  revealedDelay: string;
};

const PROJECT_STYLES: ThumbStyle[] = [
  {
    offset: "",
    top: "",
    rotate: "-rotate-3",
    z: "z-3 shadow-xl",
    delay: "delay-120 *:delay-120",
    hoverDelay: "group-hover/row:delay-20 *:group-hover/row:delay-20",
    revealedDelay: "delay-20!",
  },
  {
    offset: "-ml-32",
    top: "-top-1/20",
    rotate: "",
    z: "z-4 shadow-xl",
    delay: "delay-100 *:delay-100",
    hoverDelay: "group-hover/row:delay-40 *:group-hover/row:delay-40",
    revealedDelay: "delay-40!",
  },
  {
    offset: "-ml-12",
    top: "-top-1/25",
    rotate: "rotate-2",
    z: "z-3 shadow-xl",
    delay: "delay-80 *:delay-80",
    hoverDelay: "group-hover/row:delay-60 *:group-hover/row:delay-60",
    revealedDelay: "delay-60!",
  },
  {
    offset: "-ml-30",
    top: "-top-1/30",
    rotate: "rotate-3",
    z: "z-2 shadow-xl",
    delay: "delay-60 *:delay-60",
    hoverDelay: "group-hover/row:delay-80 *:group-hover/row:delay-80",
    revealedDelay: "delay-80!",
  },
  {
    offset: "-ml-32",
    top: "-top-1/40",
    rotate: "rotate-5",
    z: "z-1 shadow-xl",
    delay: "delay-40 *:delay-40",
    hoverDelay: "group-hover/row:delay-100 *:group-hover/row:delay-100",
    revealedDelay: "delay-100!",
  },
];

const AWARD_STYLES: ThumbStyle[] = [
  {
    offset: "",
    top: "-top-0",
    rotate: "rotate-2",
    z: "z-3 shadow-xl",
    delay: "delay-120 *:delay-120",
    hoverDelay: "group-hover/row:delay-20 *:group-hover/row:delay-20",
    revealedDelay: "delay-20!",
  },
  {
    offset: "-ml-96",
    top: "-top-1/30",
    rotate: "-rotate-1",
    z: "z-2 shadow-xl",
    delay: "delay-100 *:delay-100",
    hoverDelay: "group-hover/row:delay-40 *:group-hover/row:delay-40",
    revealedDelay: "delay-40!",
  },
  {
    offset: "-ml-96",
    top: "-top-0",
    rotate: "rotate-3",
    z: "z-1 shadow-xl",
    delay: "delay-80 *:delay-80",
    hoverDelay: "group-hover/row:delay-60 *:group-hover/row:delay-60",
    revealedDelay: "delay-60!",
  },
];

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

function useIsCoarsePointer() {
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(pointer: coarse)");
    setIsCoarse(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsCoarse(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isCoarse;
}

type Item = { id: string; name: string };

type SectionProps<T extends Item> = {
  title: string;
  icon: LucideIcon;
  items: T[];
  styles: ThumbStyle[];
  to: (item: T | null) => string;
  allLabel: string;
  allClass?: string;
  /** aspect class for the trailing "view all" card, e.g. "aspect-9/16" */
  allAspect: string;
  /** extra classes applied to each thumbnail Link (border, bg, aspect, etc.) */
  thumbClassName?: string;
  /** renders the content unique to each item type: an <img>, a colored box, etc. */
  renderThumb: (item: T, idx: number) => React.ReactNode;
};

function Section<T extends Item>({
  title,
  icon: Icon,
  items,
  styles,
  to,
  allLabel,
  allAspect,
  thumbClassName,
  renderThumb,
  allClass,
}: SectionProps<T>) {
  const isCoarse = useIsCoarsePointer();
  const [revealed, setRevealed] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCoarse || !revealed) return;
    const handleOutside = (e: PointerEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setRevealed(false);
      }
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [isCoarse, revealed]);

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isCoarse && !revealed) {
      e.preventDefault();
      setRevealed(true);
    }
  };

  return (
    <div ref={rowRef} className="group/row">
      <div className="relative">
        <h2
          className={cn(
            "absolute top-4 left-4 transition-all duration-250 delay-20 group-hover/row:delay-0 group-focus-within/row:delay-0 flex items-center gap-1 text-muted-foreground",
            "group-hover/row:opacity-0 group-focus-within/row:opacity-0",
            revealed && "opacity-0",
          )}
        >
          <Icon className="size-4" /> {title}
        </h2>
        <h2
          className={cn(
            "h2 absolute top-32 left-4 transition-all delay-0 group-hover/row:delay-20 group-focus-within/row:delay-20 duration-250 flex items-center gap-2",
            "group-hover/row:top-0 group-focus-within/row:top-0 group-hover/row:-rotate-4 group-focus-within/row:-rotate-4",
            revealed && "top-0! -rotate-4!",
          )}
        >
          <Icon className="size-6 stroke-3" /> {title}
        </h2>
        <Button
          size="sm"
          variant="secondary"
          className="group/btn absolute top-6 right-0 opacity-0! group-hover/row:opacity-100! group-focus-within/row:opacity-100! group-hover/row:top-2 group-focus-within/row:top-2 group-hover/row:delay-200 group-focus-within/row:delay-200"
          render={<Link to={to(null)} />}
          nativeButton={false}
        >
          View All <ArrowUpRight className="rotate-45 group-hover/btn:rotate-0 group-focus-within/btn:rotate-0 transition-all" />
        </Button>
      </div>
      <div className="relative gap-2 h-96 mt-6 flex items-center overflow-auto pb-16 px-4 pt-12 overflow-x-scroll hidden-scrollbar -mx-4 scroll-fade-x pointer-events-none *:pointer-events-auto">
        {items.map((item, idx) => {
          const style = styles[idx];
          if (!style) return null;

          return (
            <Link
              key={item.id}
              onClick={handleLinkClick}
              className={cn(
                "group/image relative shrink-0 h-full rounded-lg transition-all w-auto",
                "group-hover/row:ml-0 group-focus-within/row:ml-0 group-hover/row:rotate-0 group-focus-within/row:rotate-0 group-hover/row:top-0 group-focus-within/row:top-0 group-hover/row:shadow-none group-focus-within/row:shadow-none",
                thumbClassName,
                style.offset,
                style.top,
                style.rotate,
                style.z,
                style.delay,
                style.hoverDelay,
                revealed && cn("ml-0! rotate-0! top-0!", style.revealedDelay),
              )}
               to={to(item)}
            >
              {renderThumb(item, idx)}
              <div
                className={cn(
                  "bg-background/60 backdrop-blur-md rounded-full absolute top-1/2 left-1/2 -translate-1/2 size-16 pointer-coarse:size-20 opacity-0 transition-opacity grid place-items-center",
                  "group-hover/image:opacity-100 group-focus-within/image:opacity-100",
                  revealed && "opacity-100!",
                )}
              >
                <ArrowUpRight
                  className={cn(
                    "size-8 rotate-45 transition-all delay-100",
                    "group-hover/row:rotate-0 group-focus-within/row:rotate-0",
                    revealed && "rotate-0!",
                  )}
                />
              </div>
              <div
                className={cn(
                  "bg-background absolute bottom-2 left-2 inline-flex items-center gap-0.5 max-w-4/5 text-xs px-2 py-0.5 rounded-full opacity-0 transition-opacity",
                  "group-hover/row:opacity-100 group-focus-within/row:opacity-100",
                  revealed && "opacity-100!",
                )}
              >
                <span className="truncate">{item.name}</span>
              </div>
            </Link>
          );
        })}
        <Link
          onClick={handleLinkClick}
          className={cn(
            "group/image relative shrink-0 h-full rounded-lg transition-all w-auto overflow-clip",
            "-ml-36 -top-1 rotate-7 z-0 delay-20",
            "group-hover/row:ml-0 group-focus-within/row:ml-0 group-hover/row:rotate-0 group-focus-within/row:rotate-0 group-hover/row:top-0 group-focus-within/row:top-0 group-hover/row:delay-120 group-focus-within/row:delay-120",
            revealed && "ml-0! rotate-0! top-0! delay-120!",
            allClass,
          )}
          to={to(null)}
        >
          <div className={cn("h-full bg-muted-foreground/10 group-hover/image:bg-muted-foreground/20 transition-colors", allAspect)}>
            <div className="bg-muted-foreground/10 backdrop-blur-md rounded-full absolute top-1/2 left-1/2 -translate-1/2 size-16 pointer-coarse:size-20 transition-opacity grid place-items-center">
              <ArrowUpRight
                className={cn(
                  "size-8 rotate-45 transition-all delay-100",
                  "group-hover/image:rotate-0! group-focus-within/image:rotate-0!",
                  revealed && "rotate-0!",
                )}
              />
            </div>
            <div
              className={cn(
                "bg-background absolute bottom-2 left-2 inline-flex items-center gap-0.5 max-w-4/5 text-xs px-2 py-0.5 rounded-full opacity-0 transition-opacity",
                "group-hover/row:opacity-100 group-focus-within/row:opacity-100",
                revealed && "opacity-100!",
              )}
            >
              <span className="truncate">{allLabel}</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

function Home() {
  const { resumeLink, subtext, projects, skills, experiences, awards, globalProject } = Route.useLoaderData();

  const rand = seedrandom("12345");

  return (
    <main className="max-w-[100ch] mx-auto px-4 py-32">
      <div className="absolute top-0 left-0 -z-10 w-svw h-1/2 opacity-70">
        <GlyphMatrix fadeBottom={1} />
      </div>
      <div>
        <small className="text-2xl text-muted-foreground font-cursive">
          Hiya. I'm
        </small>
        <h1 className="font-black text-6xl">Drake Semchyshyn</h1>
        <small className="text-2xl text-muted-foreground mt-2">{subtext}</small>
      </div>
      <Section
        title="My Projects"
        icon={PanelsTopLeft}
        items={projects}
        styles={PROJECT_STYLES}
        to={(project) => project?.slug ? `/projects/${project.slug}` : `/projects`}
        allLabel="All Projects"
        allAspect="aspect-9/16"
        // thumbClassName="group-hover/row:mr-6"
        renderThumb={(project, idx) => (
          <div className={cn("w-full h-full", idx === 0 ? "aspect-video" : "aspect-9/19.5")}>
            <img
              src={idx === 0 ? project.desktop_preview : project.mobile_preview}
              alt={project.name}
              className={cn("w-full h-full object-cover rounded-md")}
            />
          </div>
        )}
      />
      <Popover>
        <PopoverTrigger render={<button className="-mt-8 mb-8 w-full cursor-pointer" />}>
          <div className="group/row flex items-center bg-secondary/30 rounded-lg py-1 pl-2 w-full">
            <h2
              className="font-bold flex items-center gap-1 shrink-0 w-max bg-secondary pl-3 pr-4 py-1 rounded-sm"
            >
              <ChevronsUp className="size-4 shrink-0" /> My Skills
            </h2>
            <div className="relative flex-1 shrink overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-1/2 rounded-md px-3 py-1 backdrop-blur-2xl z-10 flex items-center gap-1 border scale-70 group-hover/row:scale-100 group-hover/row:opacity-100 opacity-0 transition-all bg-secondary/60">
                <ChevronsUpDown className="size-4" /> Expand
              </div>
              <Marquee className="text-xs [--duration:120s] group-hover/row:opacity-20 transition-all">
                {skills.sort(() => rand() - rand()).map((s) => (
                  <div className="flex items-center gap-1 p-1 pl-2 pr-3 rounded-xl bg-secondary/30">
                    <div className="size-4 grid place-items-center">
                      <DynamicIcon name={s.icon} className="size-3" />
                    </div>
                    <span>{s.name}</span>
                  </div>
                ))}
              </Marquee>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent align="start" className="-mt-(--anchor-height) w-(--anchor-width)" alignOffset={1} sideOffset={0}>
          <PopoverClose render={<button className="cursor-pointer w-full h-full" />}>
            <PopoverHeader className="flex flex-row justify-between items-center mb-2">
              <PopoverTitle className="font-bold text-xl flex items-center gap-1">
                <ChevronsUp className="size-6 stroke-3 shrink-0" /> My Skills
              </PopoverTitle>
              <Button variant="secondary" size="sm" className="items-center" render={<div/>}>
                <span>Close</span> <X />
              </Button>
            </PopoverHeader>
            <div className="flex items-center gap-2 flex-wrap">
              {skills.sort(() => rand() - rand()).map((s) => (
                <div className="flex items-center gap-1 p-1 pl-2 pr-3 rounded-xl bg-secondary/30">
                  <div className="size-4 grid place-items-center">
                    <DynamicIcon name={s.icon} className="size-3" />
                  </div>
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </PopoverClose>
        </PopoverContent>
      </Popover>
      <div className="group/row">
        <div className="relative h-16 overflow-clip -mb-8">
          <h2
            className={cn(
              "absolute top-4 left-4 transition-all duration-250 delay-20 group-hover/row:delay-0 group-focus-within/row:delay-0 flex items-center gap-1 text-muted-foreground",
              "group-hover/row:opacity-0 group-focus-within/row:opacity-0"
            )}
          >
            <BriefcaseBusiness className="size-4" /> My Experiences
          </h2>
          <h2
            className={cn(
              "h2 absolute top-32 left-4 transition-all delay-0 group-hover/row:delay-20 group-focus-within/row:delay-20 duration-250 flex items-center gap-2",
              "group-hover/row:top-0 group-focus-within/row:top-0 group-hover/row:-rotate-4 group-focus-within/row:-rotate-4"
            )}
          >
            <BriefcaseBusiness className="size-6 stroke-3" /> My Experiences
          </h2>
        </div>
        <div className="p-6 rounded-md z-2 scroll-fade-y">
          <div className="flex flex-col gap-2 border-l-2 border-foreground/20! pl-2 py-1">
            {experiences.map(((ex) => (
              <Link key={ex.id} to={`/experiences/${ex.slug}`} className="overflow-y-clip relative flex flex-col gap-1 group/link hover:bg-background/30 transition-all rounded-md px-4 py-2">
                <div className="z-10 absolute top-5.25 -left-2.75 size-1 rounded-full bg-foreground group-hover/link:bg-primary group-hover/link:top-3 group-hover/link:h-[calc(100%-1rem)] transition-all" />
                <span className="font-bold text-xl">{ex.name}</span>
                <div className="text-xs text-muted-foreground line-clamp-3 h-12 pr-10 text-pretty">{ex.description || <>{"> description"}<br />{">"}<br />{">"}</>}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{ex.start ? Temporal.Instant.from(ex.start).toLocaleString(undefined, {
                    year: "numeric",
                    month: "long",
                  }) : "Unknown"} — {ex.end ? Temporal.Instant.from(ex.end).toLocaleString(undefined, {
                    year: "numeric",
                    month: "long",
                  }) : "Present"}</span>
                  <Dot className="size-3" />
                  <div className="flex items-center gap-1 underline-offset-4 group-hover/link:underline group-hover/link:text-foreground transition-all">
                    More Details <ArrowRight className="size-3" />
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <ArrowUpRight className="size-12 -translate-x-36 translate-y-36 group-hover/link:translate-0 transition-all opacity-5 stroke-foreground duration-50 group-hover/link:delay-50" />
                  </div>
                </div>
              </Link>
            )))}
            <Link to={"/experiences"} className="overflow-clip relative flex flex-col gap-1 group/link hover:bg-background/30 transition-all rounded-md px-4 py-2">
              <div className="z-10 absolute top-5.25 -left-2.75 size-1 rounded-full bg-foreground group-hover/link:bg-primary group-hover/link:top-3 group-hover/link:h-[calc(100%-1rem)] transition-all" />
              <span className="font-bold text-xl">View All</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>No more items</span>
                <Dot className="size-3" />
                <div className="flex items-center gap-1 underline-offset-4 group-hover/link:underline group-hover/link:text-foreground transition-all">
                  More Details <ArrowRight className="size-3" />
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <ArrowUpRight className="size-12 -translate-x-36 translate-y-36 group-hover/link:translate-0 transition-all opacity-5 stroke-foreground group-hover/link:delay-50" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <Section
        title="My Awards"
        icon={Trophy}
        items={awards}
        styles={AWARD_STYLES}
        to={(aw) => aw?.slug ? `/awards/${aw.slug}` : `/awards`}
        allLabel="All Awards"
        allAspect="aspect-3/2"
        allClass="-ml-96 rotate-3 top-1/35"
        thumbClassName="border-2 border-black/30! bg-gradient-to-br from-[color-mix(in_oklch,var(--ui-background),var(--ui-secondary)_45%)] to-[color-mix(in_oklch,var(--ui-background),var(--ui-secondary)_60%)] aspect-3/2"
        renderThumb={(award, idx) => (
          <div
            className="w-full h-full text-left p-8 flex items-start justify-end flex-col text-balance gap-2"
          >
            <div className="flex items-end gap-2">
              <Award className="size-8 stroke-3" />
              <span className="text-2xl text-muted-foreground font-bold">{award.place}{numberSuffix(award.place)}</span>
              <span className="text-sm text-muted-foreground pb-1.25">{award.placeOf !== 0 ? `of ${award.placeOf}` : ""}</span>
            </div>
            <span className="line-clamp-2 pr-6 font-bold text-3xl">
              {award.name}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" />
              {Temporal.Instant.from(award.date).toLocaleString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      />
      <div className="group/row">
        <div className="relative h-16 overflow-clip -mb-12">
          <h2
            className={cn(
              "absolute top-4 left-4 transition-all duration-250 delay-20 group-hover/row:delay-0 group-focus-within/row:delay-0 flex items-center gap-1 text-muted-foreground",
              "group-hover/row:opacity-0 group-focus-within/row:opacity-0"
            )}
          >
            <Link2 className="size-4" /> My Links
          </h2>
          <h2
            className={cn(
              "h2 absolute top-32 left-4 transition-all delay-0 group-hover/row:delay-20 group-focus-within/row:delay-20 duration-250 flex items-center gap-2",
              "group-hover/row:top-0 group-focus-within/row:top-0 group-hover/row:-rotate-4 group-focus-within/row:-rotate-4"
            )}
          >
            <Link2 className="size-6 stroke-3" /> My Links
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-8">
          <Button variant="outline" className="relative overflow-clip h-42 bg-[color-mix(var(--ui-background),var(--ui-secondary)_80%)]! hover:bg-[color-mix(var(--ui-background),var(--ui-secondary)_100%)]! group/link" render={<a target="_blank" href={resumeLink} />} nativeButton={false}>
            <FileUser className="absolute -bottom-8 -left-8 size-36 opacity-5 -rotate-10 group-hover/link:bottom-0 group-hover/link:left-2 group-hover/link:rotate-0 transition-all" />
            <div className="flex-1 w-full h-full flex justify-start items-end">
              <div className="flex items-center gap-2 font-bold text-3xl origin-bottom-left group-hover/link:scale-125 transition-all">
                <div className="relative size-10 overflow-clip">
                  <FileUser className="absolute top-1/2 left-1/2 -translate-1/2 size-8 stroke-3" />
                </div>
                Resume
              </div>
            </div>
            <div className="opacity-0 group-hover/link:opacity-100 bg-muted-foreground/10 backdrop-blur-md rounded-full absolute top-1/2 right-12 -translate-y-1/2 size-16 pointer-coarse:size-20 transition-all grid place-items-center">
              <Download
                className={cn(
                  "size-8 -rotate-45 transition-all delay-50",
                  "group-hover/link:rotate-0 group-focus-within/link:rotate-0",
                )}
              />
            </div>
          </Button>
          {globalProject.links.map((l) => (
            <Button key={l.id} variant="outline" className="relative overflow-clip h-42 bg-[color-mix(var(--ui-background),var(--ui-secondary)_40%)]! hover:bg-[color-mix(var(--ui-background),var(--ui-secondary)_65%)]! group/link" render={<a href={l.url} target="_blank" />} nativeButton={false}>
              <DynamicIcon name={l.icon} className="absolute -bottom-8 -left-8 size-36 opacity-5 -rotate-10 group-hover/link:bottom-0 group-hover/link:left-2 group-hover/link:rotate-0 transition-all" />
              <div className="flex-1 w-full h-full flex justify-start items-end">
                <div className="flex items-center gap-2 font-bold text-3xl origin-bottom-left group-hover/link:scale-125 transition-all">
                  <div className="relative size-10 overflow-clip">
                    <DynamicIcon name={l.icon} className="absolute top-1/2 left-1/2 -translate-1/2 size-8 stroke-3" />
                  </div>
                  {l.label}
                </div>
              </div>
              <div className="opacity-0 group-hover/link:opacity-100 bg-muted-foreground/10 backdrop-blur-md rounded-full absolute top-1/2 right-12 -translate-y-1/2 size-16 pointer-coarse:size-20 transition-all grid place-items-center">
                <ArrowUpRight
                  className={cn(
                    "size-8 rotate-45 transition-all delay-100",
                    "group-hover/link:rotate-0 group-focus-within/link:rotate-0",
                  )}
                />
              </div>
            </Button>
          ))}
        </div>
      </div>
    </main>
  );
}
