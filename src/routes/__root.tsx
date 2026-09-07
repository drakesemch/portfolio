import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Wrench } from "lucide-react";
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
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
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
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { config, headers } = Route.useLoaderData();

  const colorTheme =
    headers?.get?.("Cookie")?.match(/ui--theme=([^;]+)/)?.[1] || "system";
  const systemTheme =
    headers?.get?.("Cookie")?.match(/ui--system-theme=([^;]+)/)?.[1] || "light";

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
