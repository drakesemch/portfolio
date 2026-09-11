import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Bug, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";
import { getConfigByKey } from "@/lib/pb";
import { Drawer } from "@base-ui/react/drawer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { NavigationViewTransitions } from "@/components/system/navigation-view-transitions";
import { RouterProgressBar } from "@/components/system/router-progress";
import { Toaster } from "@/components/ui/sonner";
import { getHeaders } from "@/lib/headers";
import { GlyphMatrix } from "@/components/ui/glyph-matrix";
import { useEffect } from "react";
import { toast } from "sonner";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Drake's Portfolio",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.png"
      }
    ],
  }),
  loader: async () => {
    const headers = await getHeaders();

    return {
      config: {
        colorTheme: await getConfigByKey({ data: { key: "color-theme" } }),
        rounding: await getConfigByKey({ data: { key: "rounding" } }),
      },
      headers,
    };
  },
  shellComponent: RootDocument,
  notFoundComponent: NotFoundDocument,
  errorComponent: ErrorDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { config, headers } = Route.useLoaderData();

  const colorTheme =
    headers?.get?.("Cookie")?.match(/ui--theme=([^;]+)/)?.[1] || "system";
  const systemTheme =
    headers?.get?.("Cookie")?.match(/ui--system-theme=([^;]+)/)?.[1] || "light";

  useEffect(() => {
    setTimeout(() => {
      toast.warning("Site in active development", {
        description: "Links and functionality are likely to break",
        duration: Infinity,
        id: "dev",
        action: <Button variant="outline" className="ml-auto" onClick={() => toast.dismiss("dev")}>Hide</Button>,
      })
    }, 2000);
  }, []);

  return (
    <html
      lang="en"
      className={`ui--color-theme--${config.colorTheme} ui--rounding--${config.rounding} ${colorTheme === "system" ? (systemTheme === "light" ? "ui--light" : "ui--dark") : `ui--${colorTheme}`} select-none scroll-pt-10 scroll-pb-36`}
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body className="-bg-linear-30 from-primary/20 to-background bg-fixed">
        <Drawer.Provider>
          <Drawer.IndentBackground />
          <Drawer.Indent className="min-h-full w-full">
            <ThemeProvider defaultTheme="system" storageKey="ui--theme">
              <NavigationViewTransitions />
              <RouterProgressBar />
              {children}
              <div data-toaster>
                <Toaster richColors offset={{ /*bottom: 105 + 8*/ }} className="[--radius:var(--ui-radius)]" />
              </div>
            </ThemeProvider>
          </Drawer.Indent>
        </Drawer.Provider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
            customTrigger: (
              <Button
                variant="secondary"
                size="icon-sm"
                className="z-999 print:hidden"
              >
                <Wrench />
              </Button>
            ),
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

function NotFoundDocument() {
  return (
    <div className="place-items-center stack">
      <div className="w-svw h-svh">
        <GlyphMatrix fadeBottom={0.2} />
      </div>
      <div className="mx-2 w-full max-w-[80ch] bg-background/30 border rounded-md backdrop-blur-lg px-4 py-4 font-mono">
        <div className="p-6 bg-background border rounded-sm w-max">
          <Bug className="size-12 stroke-3" />
        </div>
        <h1 className="h1 uppercase">HTTP Status: 404</h1>
        <h2 className="h2 uppercase text-muted-foreground mb-8">Definition: Page Not Found</h2>
        <div className="text-muted-foreground text-lg flex flex-col">
          <span className="font-black text-foreground">What does this mean?</span>
          <span>
            This means that the page doesn't exist. It could either be a dead-link, meaning the URL got typed incorrectly, or the page got moved or deleted. Try contacting the author of the link to see what the issue is.
          </span>
        </div>
      </div>
    </div>
  )
}

function ErrorDocument({error}: {error: Error}) {
  return (
    <div className="place-items-center stack">
      <div className="w-svw h-svh fixed top-0">
        <GlyphMatrix fadeBottom={0.2} />
      </div>
      <div className="my-4 mx-2 w-full max-w-[80ch] bg-background/30 border rounded-md backdrop-blur-lg px-4 py-4 font-mono">
        <div className="p-6 bg-background border rounded-sm w-max">
          <Bug className="size-12 stroke-3" />
        </div>
        <h1 className="h1 uppercase">HTTP Status: 500</h1>
        <h2 className="h2 uppercase text-muted-foreground mb-8">Definition: Server Error</h2>
        <div className="text-muted-foreground text-lg flex flex-col">
          <span className="font-black text-foreground">What does this mean?</span>
          <span>
            We... screwed something up...
          </span>
          <span className="font-black text-foreground">Error Message:</span>
          <span>
            {error.name || "<ERROR_NAME>"}: {error.message || "<error message>"}
          </span>
          <span className="font-black text-foreground">Error Stack:</span>
          <span>
            {error.stack || "<no stack>"}
          </span>
          <span className="font-black text-foreground">Error Cause:</span>
          <span>
            {String(error.cause ?? "<unknown>")}
          </span>
        </div>
      </div>
    </div>
  )
}
