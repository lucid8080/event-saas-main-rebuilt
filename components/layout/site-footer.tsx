import { siteConfig } from "@/config/site"
import Link from "next/link"

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={`border-t py-6 md:py-0 ${className || ""}`}>
      <div className="container flex flex-col md:h-24 md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col px-8 md:flex-row md:gap-2 md:px-0 items-center gap-4">
          <p className="text-center text-sm text-muted-foreground md:text-left leading-loose">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
        
        {/* Footer Links */}
        <div className="flex flex-col px-8 md:flex-row md:gap-6 md:px-0 items-center gap-4">
          <nav className="flex flex-wrap text-sm text-muted-foreground items-center gap-4">
            <Link 
              href="/about" 
              className="transition-colors hover:text-foreground"
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className="transition-colors hover:text-foreground"
            >
              Contact
            </Link>
            <Link 
              href="/faq" 
              className="transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
            <Link 
              href="/privacy" 
              className="transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}