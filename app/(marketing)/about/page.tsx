import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us - EventCraftAI",
  description: "Learn about EventCraftAI, the AI-powered event image generation platform that revolutionizes event marketing.",
}

export default function AboutPage() {
  return (
    <div className="container max-w-4xl px-4 py-16 mx-auto">
      <div className="mb-16 text-center">
        <h1 className="mb-6 text-4xl font-bold tracking-tight">
          About EventCraftAI
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
          Revolutionizing event marketing with AI-powered image generation
        </p>
      </div>

      <div className="space-y-16">
        {/* Mission Section */}
        <section>
          <h2 className="mb-6 text-3xl font-semibold">Our Mission</h2>
          <p className="mb-4 text-lg leading-relaxed">
            At EventCraftAI, we believe that every event deserves stunning, professional imagery that captures attention and drives engagement. Our mission is to democratize high-quality event marketing by making AI-powered image generation accessible to event organizers, marketers, and businesses of all sizes.
          </p>
          <p className="text-lg leading-relaxed">
            We're committed to helping you create compelling visual content that tells your event's story, engages your audience, and drives real results.
          </p>
        </section>

        {/* What We Do Section */}
        <section>
          <h2 className="mb-6 text-3xl font-semibold">What We Do</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="mb-4 text-xl font-semibold">AI-Powered Image Generation</h3>
              <p className="text-muted-foreground">
                Our advanced AI technology creates stunning, customized images for your events. From promotional materials to social media content, we generate visuals that perfectly match your brand and event theme.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-xl font-semibold">Carousel Creation</h3>
              <p className="text-muted-foreground">
                Create engaging carousel posts for social media platforms. Our carousel maker helps you design cohesive, multi-image content that tells a complete story about your event.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-xl font-semibold">Custom Branding</h3>
              <p className="text-muted-foreground">
                Every image is tailored to your brand guidelines, event type, and target audience. Our system learns your preferences to deliver consistent, on-brand content.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-xl font-semibold">Event-Specific Templates</h3>
              <p className="text-muted-foreground">
                Whether it's a corporate event, wedding, birthday party, or any special occasion, we have specialized templates and prompts designed for your specific event type.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section>
          <h2 className="mb-6 text-3xl font-semibold">Why Choose EventCraftAI</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 text-center rounded-lg border">
              <div className="mb-4 text-3xl">⚡</div>
              <h3 className="mb-2 text-lg font-semibold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Generate professional images in seconds, not hours. No more waiting for designers or struggling with complex design tools.
              </p>
            </div>
            <div className="p-6 text-center rounded-lg border">
              <div className="mb-4 text-3xl">🎯</div>
              <h3 className="mb-2 text-lg font-semibold">Highly Customizable</h3>
              <p className="text-sm text-muted-foreground">
                Fine-tune every aspect of your images with our advanced editing tools and AI-powered suggestions.
              </p>
            </div>
            <div className="p-6 text-center rounded-lg border">
              <div className="mb-4 text-3xl">💰</div>
              <h3 className="mb-2 text-lg font-semibold">Cost Effective</h3>
              <p className="text-sm text-muted-foreground">
                Save thousands on design costs while getting professional-quality results that rival expensive agency work.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section>
          <h2 className="mb-6 text-3xl font-semibold">Our Story</h2>
          <p className="mb-4 text-lg leading-relaxed">
            EventCraftAI was born from a simple observation: event organizers and marketers were spending too much time and money on creating visual content, often with inconsistent results. We saw an opportunity to leverage cutting-edge AI technology to solve this problem.
          </p>
          <p className="mb-4 text-lg leading-relaxed">
            Our team of AI researchers, designers, and event marketing experts came together to build a platform that combines the creativity of human designers with the efficiency and consistency of artificial intelligence.
          </p>
          <p className="text-lg leading-relaxed">
            Today, we're proud to serve thousands of event organizers, helping them create stunning visual content that drives engagement and delivers real business results.
          </p>
        </section>

        {/* Contact CTA */}
        <section className="p-8 bg-muted/50 text-center rounded-lg">
          <h2 className="mb-4 text-2xl font-semibold">Ready to Transform Your Event Marketing?</h2>
          <p className="mb-6 text-muted-foreground">
            Join thousands of event organizers who are already using EventCraftAI to create stunning visual content.
          </p>
          <a
            href="/pricing"
            className="inline-flex px-6 py-3 bg-primary text-sm text-primary-foreground rounded-md shadow transition-colors hover:bg-primary/90 items-center justify-center font-medium"
          >
            Get Started Today
          </a>
        </section>
      </div>
    </div>
  )
} 