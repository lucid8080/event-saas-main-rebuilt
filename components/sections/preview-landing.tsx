import Image from "next/image";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
// This is a preview landing page for the app that shows a preview of the app on home page.
export default function PreviewLanding() {
//   return (
//    <div className="pb-6 sm:pb-16">
      <MaxWidthWrapper>
        <div className="rounded-xl md:bg-muted/30 md:p-3.5 md:ring-1 md:ring-inset md:ring-border">
          <div className="relative rounded-xl md:rounded-lg aspect-video overflow-hidden border">
            <Image
              className="size-full dark:opacity-85 dark:invert object-cover object-center"
              src="/_static/blog/blog-post-3.jpg"
              alt="preview landing"
              width={2000}
              height={1000}
              priority={true}
            />
           </div>
         </div>
       </MaxWidthWrapper>
//     </div>
//   );
 }
