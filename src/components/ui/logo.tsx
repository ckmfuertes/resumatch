import Image from "next/image";
import { cn } from "@/lib/utils";

const logoSizes = {
  sm: {
    image: "h-13 w-13",
    text: "text-2xl",
  },
  md: {
    image: "h-16 w-16",
    text: "text-3xl",
  },
  lg: {
    image: "h-20 w-20",
    text: "text-4xl",
  },
} as const;

type LogoProps = {
  variant?: "white" | "blue";
  size?: keyof typeof logoSizes;
  hideText?: boolean;
  className?: string;
};

export function Logo({ variant = "white", size = "md", hideText = false, className }: LogoProps) {
  const isBlue = variant === "blue";
  const sizeClasses = logoSizes[size];

  return (
    <div className={cn("flex", isBlue ? "text-primary" : "text-background", className)}>
      <Image
        src={isBlue ? "/resumatch-logo-blue.svg" : "/resumatch-logo-white.svg"}
        alt="Resumatch Logo"
        width={56}
        height={56}
        className={cn("-mr-1 pointer-events-none", sizeClasses.image)}
      />
      {!hideText && (
        <div
          className={cn(
            "flex flex-col justify-between font-semibold leading-none",
            sizeClasses.text,
          )}
        >
          <span>resu</span>
          <span className="-mt-2">match</span>
        </div>
      )}
    </div>
  );
}
