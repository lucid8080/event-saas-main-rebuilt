import { Metadata } from "next"
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react"
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

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="space-y-8">
          <div>
            <h2 className="mb-6 text-2xl font-semibold">Get in Touch</h2>
            <p className="mb-8 text-muted-foreground">
              Whether you have questions about our platform, need technical support, or want to discuss partnership opportunities, we're here to help.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex space-x-4 items-start">
              <div className="shrink-0 flex size-10 bg-primary/10 rounded-lg items-center justify-center">
                <Mail className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Email Support</h3>
                <p className="mb-2 text-muted-foreground">For general inquiries and support</p>
                <a 
                  href="mailto:support@eventcraftai.com" 
                  className="text-primary hover:underline"
                >
                  support@eventcraftai.com
                </a>
              </div>
            </div>

            <div className="flex space-x-4 items-start">
              <div className="shrink-0 flex size-10 bg-primary/10 rounded-lg items-center justify-center">
                <MessageSquare className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Live Chat</h3>
                <p className="mb-2 text-muted-foreground">Available during business hours</p>
                <p className="text-sm text-muted-foreground">Mon-Fri: 9AM-6PM EST</p>
              </div>
            </div>

            <div className="flex space-x-4 items-start">
              <div className="shrink-0 flex size-10 bg-primary/10 rounded-lg items-center justify-center">
                <Phone className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Phone Support</h3>
                <p className="mb-2 text-muted-foreground">For urgent technical issues</p>
                <a 
                  href="tel:+1-555-0123" 
                  className="text-primary hover:underline"
                >
                  +1 (555) 012-3456
                </a>
              </div>
            </div>

            <div className="flex space-x-4 items-start">
              <div className="shrink-0 flex size-10 bg-primary/10 rounded-lg items-center justify-center">
                <MapPin className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Office</h3>
                <p className="mb-2 text-muted-foreground">EventCraftAI Headquarters</p>
                <p className="text-sm text-muted-foreground">
                  123 Innovation Drive<br />
                  Tech City, TC 12345<br />
                  United States
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12">
            <h3 className="mb-4 text-xl font-semibold">Frequently Asked Questions</h3>
            <div className="space-y-6">
              <div>
                <h4 className="mb-2 font-medium">How does EventCraftAI work?</h4>
                <p className="text-sm text-muted-foreground">
                  EventCraftAI uses advanced AI to generate custom event images and carousels. Simply describe your event details, choose your preferences, and our AI creates professional visuals in seconds. We support various event types including birthdays, weddings, corporate events, and more.
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium">What types of events do you support?</h4>
                <p className="text-sm text-muted-foreground">
                  We support a wide range of events including birthday parties, weddings, corporate events, family gatherings, BBQs, fundraisers, workshops, holiday celebrations, and more. Our AI adapts to your specific event type and creates appropriate designs.
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium">How does the credits system work?</h4>
                <p className="text-sm text-muted-foreground">
                  Credits are used to generate images and carousels. Each generation costs 1 credit. Free users get limited credits to start, while paid plans provide more credits per billing cycle. Monthly plans give you credits monthly, while yearly plans provide 12x the monthly amount upfront.
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium">What is the Carousel Maker feature?</h4>
                <p className="text-sm text-muted-foreground">
                  The Carousel Maker is an experimental feature that lets you create multi-slide carousels for social media platforms like Instagram, LinkedIn, and TikTok. You can generate AI backgrounds, add editable text overlays, and create professional social media content with up to 20 slides.
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium">Can I customize the generated images?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! Our platform includes advanced editing tools that allow you to fine-tune colors, text, layouts, and other elements. You can edit text in real-time, adjust positioning, and customize the design to match your exact needs.
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium">What image formats and sizes do you support?</h4>
                <p className="text-sm text-muted-foreground">
                  We support multiple aspect ratios including 1:1 (square), 4:5 (portrait), 16:9 (landscape), and 9:16 (story format). Images are generated in high resolution suitable for social media, print, and digital use.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <ContactForm />
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