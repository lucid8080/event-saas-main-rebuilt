import { Metadata } from "next"
import { ContactForm } from "@/components/forms/contact-form"

export const metadata: Metadata = {
  title: "Contact Us - EventCraftAI",
  description: "Get in touch with the EventCraftAI team. We're here to help with your event marketing needs.",
}

export default function ContactPage() {
  return (
    <div className="container max-w-4xl px-4 py-16 mx-auto">
      <div className="mb-16 text-center">
        <h1 className="mb-6 text-4xl font-bold tracking-tight">
          Contact Us
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
          Have questions about EventCraftAI? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Contact Form */}
        <ContactForm />
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h3 className="mb-8 text-2xl font-semibold text-center">Frequently Asked Questions</h3>
        <div className="space-y-8">
          <div>
            <h4 className="mb-3 text-lg font-medium">How does EventCraftAI work?</h4>
            <p className="text-muted-foreground">
              EventCraftAI uses advanced AI to generate custom event images and carousels. Simply describe your event details, choose your preferences, and our AI creates professional visuals in seconds. We support various event types including birthdays, weddings, corporate events, and more.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-medium">What types of events do you support?</h4>
            <p className="text-muted-foreground">
              We support a wide range of events including birthday parties, weddings, corporate events, family gatherings, BBQs, fundraisers, workshops, holiday celebrations, and more. Our AI adapts to your specific event type and creates appropriate designs.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-medium">How does the credits system work?</h4>
            <p className="text-muted-foreground">
              Credits are used to generate images and carousels. Each generation costs 1 credit. Free users get limited credits to start, while paid plans provide more credits per billing cycle. Monthly plans give you credits monthly, while yearly plans provide 12x the monthly amount upfront.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-medium">What is the Carousel Maker feature?</h4>
            <p className="text-muted-foreground">
              The Carousel Maker is an experimental feature that lets you create multi-slide carousels for social media platforms like Instagram, LinkedIn, and TikTok. You can generate AI backgrounds, add editable text overlays, and create professional social media content with up to 20 slides.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-medium">Can I customize the generated images?</h4>
            <p className="text-muted-foreground">
              Yes! Our platform includes advanced editing tools that allow you to fine-tune colors, text, layouts, and other elements. You can edit text in real-time, adjust positioning, and customize the design to match your exact needs.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-medium">What image formats and sizes do you support?</h4>
            <p className="text-muted-foreground">
              We support multiple aspect ratios including 1:1 (square), 4:5 (portrait), 16:9 (landscape), and 9:16 (story format). Images are generated in high resolution suitable for social media, print, and digital use.
            </p>
          </div>
        </div>
      </div>

      {/* Response Time Info */}
      <div className="p-6 mt-16 bg-muted/50 text-center rounded-lg">
        <h3 className="mb-2 text-lg font-semibold">Response Time</h3>
        <p className="text-muted-foreground">
          We typically respond to all inquiries within 24 hours during business days. 
          For urgent technical issues, please call our support line.
        </p>
      </div>
    </div>
  )
} 