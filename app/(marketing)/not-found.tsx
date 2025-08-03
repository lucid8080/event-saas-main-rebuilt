import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>
      <Image
        src="/_static/illustrations/rocket-crashed.svg"
        alt="404"
        width={400}
        height={400}
        className="mt-6 mb-5 dark:invert pointer-events-none"
      />
      <p className="px-4 text-balance text-center text-2xl font-medium">
        Page not found. Back to{" "}
        <Link
          href="/"
          className="text-muted-foreground hover:text-purple-500 underline underline-offset-4"
        >
          Homepage
        </Link>
        .
      </p>
    </div>
  );
}
