import Image from "next/image";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Design Section */}
      <section className="relative hidden h-screen flex-col overflow-hidden bg-primary p-12 text-background lg:flex">
        {/* Logo */}
        <div className="z-10">
          <Logo />
        </div>

        {/* Tagline */}
        <div className="z-10 flex flex-1 items-center">
          <div className="max-w-md lg:max-w-lg space-y-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl">
              Know your fit before you submit
            </h1>

            <p className="text-base leading-7 sm:text-lg lg:text-lg xl:text-xl xl:leading-8">
              Upload your resume, track applications, and get AI-powered analysis for every job.
            </p>
          </div>
        </div>

        {/* Decoration */}
        <div className="absolute inset-x-0 bottom-0 h-screen">
          <Image
            src="/hex-design.svg"
            alt="Decoration"
            fill
            className="pointer-events-none object-contain object-bottom opacity-30"
            priority
          />
        </div>
      </section>

      {/* Forms Section */}
      <section>{children}</section>
    </div>
  );
}
