import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { getPB } from "./pb.server";

export const getConfigByKey = createServerFn()
  .validator(z.object({ key: z.string() }))
  .handler(async ({ data }) => {
    const pb = await getPB();

    const resultList = await pb.collection("config").getList(1, 1, {
      filter: `key = "${data.key}"`,
      requestKey: JSON.stringify(["key", data.key]),
    });

    if (resultList.totalItems === 0) {
      throw new Error("Config value not found!");
    }

    return (resultList.items[0].value || null) as string | null;
  });

export const getSkills = createServerFn()
  .validator(
    z.object({}),
  )
  .handler(async ({ data }) => {
    const pb = await getPB();

    // let filter = "";
    // if (data.id) {
    //   filter = `id = "${data.id}"`;
    // }

    // if (data.slug) {
    //   filter = filter
    //     ? `${filter} && slug = "${data.slug}"`
    //     : `slug = "${data.slug}"`;
    // }

    const resultList = await pb.collection("tools").getFullList({
      filter: "displayAsSkill = true",
      requestKey: JSON.stringify(["tools"]),
    });

    return resultList;
  });

export const getProjects = createServerFn()
  .validator(
    z.object({}),
  )
  .handler(async ({ data }) => {
    const pb = await getPB();

    let resultList = await pb.collection("projects").getFullList({
      expand: "links,awards",
      filter: "slug != '<global>'",
      requestKey: JSON.stringify(["project", data.id, data.slug]),
    });

    resultList = resultList.map((item) => {
      if (item.desktop_preview) {
        item.desktop_preview = pb.files.getURL(item, item.desktop_preview);
      }
      if (item.mobile_preview) {
        item.mobile_preview = pb.files.getURL(item, item.mobile_preview);
      }
      if (item.screenshots) {
        item.screenshots = item.screenshots.map((screenshot) =>
          pb.files.getURL(item, screenshot),
        );
      }
      item.links = item.expand?.links ?? [];
      item.awards = item.expand?.awards ?? [];
      return item;
    });

    return resultList.sort((a,b) => a.order >= b.order ? 1 : -1);
  });

export const getProject = createServerFn()
  .validator(
    z.object({ id: z.string().optional(), slug: z.string().optional() }),
  )
  .handler(async ({ data }) => {
    const pb = await getPB();

    if (!data.id && !data.slug) {
      throw new Error("Either id or slug must be provided");
    }

    let filter = "";
    if (data.id) {
      filter = `id = "${data.id}"`;
    }

    if (data.slug) {
      filter = filter
        ? `${filter} && slug = "${data.slug}"`
        : `slug = "${data.slug}"`;
    }

    const resultList = await pb.collection("projects").getList(1, 1, {
      filter,
      expand: "links,awards",
      requestKey: JSON.stringify(["project", data.id, data.slug]),
    });

    if (resultList.totalItems === 0) {
      throw new Error(`Project not found (filter: "${filter}")!`);
    }

    resultList.items = resultList.items.map((item) => {
      if (item.desktop_preview) {
        item.desktop_preview = pb.files.getURL(item, item.desktop_preview);
      }
      if (item.mobile_preview) {
        item.mobile_preview = pb.files.getURL(item, item.mobile_preview);
      }
      if (item.screenshots) {
        item.screenshots = item.screenshots.map((screenshot) =>
          pb.files.getURL(item, screenshot),
        );
      }
      item.links = item.expand?.links ?? [];
      item.awards = item.expand?.awards ?? [];
      return item;
    });

    return resultList.items[0];
  });

export const getExperienceList = createServerFn()
  .validator(z.object({ limit: z.number() }))
  .handler(async ({ data }) => {
    const pb = await getPB();

    if (!data.limit) {
      throw new Error("Either id or slug must be provided");
    }

    // let filter = "";
    // if (data.id) {
    //   filter = `id = "${data.id}"`;
    // }

    // if (data.slug) {
    //   filter = filter
    //     ? `${filter} && slug = "${data.slug}"`
    //     : `slug = "${data.slug}"`;
    // }

    const resultList = await pb.collection("jobs").getFullList({
      // filter,
      perPage: 100,
      requestKey: JSON.stringify(["experience"]),
    });

    return resultList.sort((a, b) => (b.end ? new Date(b.end).getTime() : new Date().getTime()) - (a.end ? new Date(a.end).getTime() : new Date().getTime())).filter((_, i) => i < data.limit);
  });

export const getAward = createServerFn()
  .validator(
    z.object({ id: z.string().optional(), slug: z.string().optional() }),
  )
  .handler(async ({ data }) => {
    const pb = await getPB();

    if (!data.id && !data.slug) {
      throw new Error("Either id or slug must be provided");
    }

    let filter = "";
    if (data.id) {
      filter = `id = "${data.id}"`;
    }

    if (data.slug) {
      filter = filter
        ? `${filter} && slug = "${data.slug}"`
        : `slug = "${data.slug}"`;
    }

    const resultList = await pb.collection("awards").getList(1, 1, {
      filter,
      requestKey: JSON.stringify(["awards", data.id, data.slug]),
    });

    if (resultList.totalItems === 0) {
      throw new Error(`Award not found (filter: "${filter}")!`);
    }

    return resultList.items[0];
  });
