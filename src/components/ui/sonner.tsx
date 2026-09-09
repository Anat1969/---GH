import { Toaster as Sonner } from "sonner";

import { useTheme } from "@/contexts/ThemeContext";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Toasts follow the app's own theme context. The upstream shadcn version reads
 * from `next-themes`, which this app does not use — reading the real theme here
 * keeps light mode from showing dark toasts.
 */
const Toaster = (props: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      dir="rtl"
      position="bottom-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
