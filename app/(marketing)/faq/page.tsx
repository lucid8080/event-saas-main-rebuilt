import { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HeaderSection } from "@/components/shared/header-section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Image, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  Zap,
  Palette,
  Download,
  Share2,
  Smartphone,
  Globe,
  Shield,
  Trophy
} from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ - EventCraftAI",
  description: "Frequently asked questions about EventCraftAI - AI-powered event image generation platform",
};

const faqCategories = [
  {
    id: "general",
    title: "General Questions",
    icon: HelpCircle,
    questions: [
      {
        id: "what-is-eventcraftai",
        question: "What is EventCraftAI and how does it work?",
        answer: "EventCraftAI is an AI-powered platform that generates custom event images and carousels. Simply describe your event details, choose your preferences, and our AI creates professional visuals in seconds. We support various event types including birthdays, weddings, corporate events, and more."
      },
      {
        id: "event-types",
        question: "What types of events do you support?",
        answer: "We support a wide range of events including birthday parties, weddings, corporate events, family gatherings, BBQs, fundraisers, workshops, holiday celebrations, and more. Our AI adapts to your specific event type and creates appropriate designs."
      },
      {
        id: "how-to-get-started",
        question: "How do I get started with EventCraftAI?",
        answer: "Getting started is easy! Simply sign up for a free account, choose your event type, answer a few questions about your event details, and let our AI generate beautiful images for you. You can start with our free plan to explore the features."
      }
    ]
  },
  {
    id: "features",
    title: "Features & Functionality",
    icon: Sparkles,
    questions: [
      {
        id: "image-customization",
        question: "Can I customize the generated images?",
        answer: "Yes! Our platform includes advanced editing tools that allow you to fine-tune colors, text, layouts, and other elements. You can edit text in real-time, adjust positioning, and customize the design to match your exact needs."
      },
      {
        id: "carousel-maker",
        question: "What is the Carousel Maker feature?",
        answer: "The Carousel Maker is an experimental feature that lets you create multi-slide carousels for social media platforms like Instagram, LinkedIn, and TikTok. You can generate AI backgrounds, add editable text overlays, and create professional social media content with up to 20 slides."
      },
      {
        id: "image-formats",
        question: "What image formats and sizes do you support?",
        answer: "We support multiple aspect ratios including 1:1 (square), 4:5 (portrait), 16:9 (landscape), and 9:16 (story format). Images are generated in high resolution suitable for social media, print, and digital use."
      },
      {
        id: "gallery-organization",
        question: "Can I save and organize my generated content?",
        answer: "Absolutely! All your generated images and carousels are automatically saved to your gallery. You can organize them, download them, and access them anytime. The gallery separates your event images from carousels for easy management."
      }
    ]
  },
  {
    id: "pricing",
    title: "Pricing & Credits",
    icon: CreditCard,
    questions: [
      {
        id: "credits-system",
        question: "How does the credits system work?",
        answer: "Credits are used to generate images and carousels. Each generation costs 1 credit. Free users get limited credits to start, while paid plans provide more credits per billing cycle. Monthly plans give you credits monthly, while yearly plans provide 12x the monthly amount upfront."
      },
      {
        id: "pricing-plans",
        question: "What are the pricing plans and what do they include?",
        answer: "We offer three plans: Starter ($30/month or $288/year) with 100 credits, Pro ($60/month or $576/year) with 200 credits, and Business ($120/month or $1152/year) with 500 credits. Yearly plans provide 12x the monthly credits upfront. All plans include AI image generation, customization tools, and priority support."
      },
      {
        id: "free-trial",
        question: "Do you offer a free trial?",
        answer: "Yes, we offer a 14-day free trial for both Pro Monthly and Pro Annual plans. This gives you full access to all features so you can experience the platform before committing to a paid subscription."
      },
      {
        id: "run-out-credits",
        question: "What if I run out of credits?",
        answer: "When you run out of credits, you can upgrade your plan to get more credits, or wait until your next billing cycle when credits are refreshed. You can also purchase additional credits if needed."
      },
      {
        id: "generation-limits",
        question: "Is there a limit on how many images I can generate?",
        answer: "The limit depends on your plan and available credits. Each image or carousel generation costs 1 credit. Free users have limited credits, while paid plans provide generous amounts that refresh each billing cycle."
      }
    ]
  },
  {
    id: "technical",
    title: "Technical & Support",
    icon: Settings,
    questions: [
      {
        id: "customer-support",
        question: "Do you offer customer support?",
        answer: "Yes! We provide email support at support@eventcraftai.com, live chat during business hours (Mon-Fri: 9AM-6PM EST), and phone support for urgent technical issues. Pro and Business plans include priority support."
      },
      {
        id: "data-privacy",
        question: "How do you protect my data and privacy?",
        answer: "We take data privacy seriously. Your event details and generated images are stored securely. We don't share your personal information with third parties, and you have full control over your content. You can delete your images and account at any time."
      },
      {
        id: "browser-compatibility",
        question: "What browsers and devices do you support?",
        answer: "EventCraftAI works on all modern browsers including Chrome, Firefox, Safari, and Edge. Our platform is fully responsive and works great on desktop, tablet, and mobile devices."
      },
      {
        id: "export-options",
        question: "What export options are available?",
        answer: "You can download your generated images in high resolution. For carousels, we support image sequence export for social media platforms. PDF export for LinkedIn carousels is coming soon."
      }
    ]
  },
  {
    id: "competitive-advantage",
    title: "Why Choose EventCraftAI?",
    icon: Trophy,
    questions: [
      {
        id: "vs-chatgpt-midjourney",
        question: "What makes EventCraftAI better than ChatGPT, Midjourney, and other AI image tools?",
        answer: "EventCraftAI is specifically designed for event marketing, unlike general-purpose AI tools. Here's what sets us apart: 1) **Event-Specific Expertise**: Our AI is trained on event imagery and understands event context, themes, and requirements better than generic tools. 2) **Built-in Event Templates**: Pre-designed layouts for birthdays, weddings, corporate events, etc., saving you hours of prompt engineering. 3) **Real-time Text Editing**: Edit text directly on generated images without regenerating - something ChatGPT and Midjourney can't do. 4) **Social Media Optimization**: Multiple aspect ratios (1:1, 4:5, 16:9, 9:16) specifically for different platforms. 5) **Carousel Creation**: Generate multi-slide carousels for Instagram, LinkedIn, and TikTok in one workflow. 6) **Professional Event Focus**: No need to craft complex prompts - just describe your event and get professional results instantly."
      },
      {
        id: "time-savings",
        question: "How much time does EventCraftAI save compared to other tools?",
        answer: "EventCraftAI saves significant time compared to general AI tools: 1) **No Prompt Engineering**: Instead of spending 10-15 minutes crafting the perfect prompt, just describe your event naturally. 2) **Instant Templates**: Our event-specific templates eliminate the need to design layouts from scratch. 3) **Real-time Editing**: Make changes instantly without regenerating images (saves 2-3 minutes per edit). 4) **Batch Processing**: Generate multiple variations and formats simultaneously. 5) **Social Media Ready**: Images are automatically optimized for different platforms. What takes 30-45 minutes with ChatGPT/Midjourney takes just 2-3 minutes with EventCraftAI."
      },
      {
        id: "professional-quality",
        question: "How does the quality compare to professional design tools?",
        answer: "EventCraftAI bridges the gap between AI generation and professional design: 1) **Event Industry Standards**: Our AI understands event marketing best practices and brand guidelines. 2) **Consistent Branding**: Maintain consistent colors, fonts, and style across all your event materials. 3) **Professional Layouts**: Pre-designed templates follow design principles used by professional event marketers. 4) **High Resolution**: All images are generated in print-ready quality suitable for both digital and physical marketing materials. 5) **Customizable Elements**: Fine-tune colors, text, positioning, and other design elements to match your exact needs. 6) **Brand Compliance**: Easy to maintain brand consistency across multiple events and campaigns."
      },
      {
        id: "cost-effectiveness",
        question: "Is EventCraftAI more cost-effective than hiring designers or using other AI tools?",
        answer: "Yes, EventCraftAI offers significant cost advantages: 1) **vs. Professional Designers**: Save $100-500 per event design project. Our platform costs $30-120/month vs. $50-200/hour for designers. 2) **vs. ChatGPT Plus**: More cost-effective for event marketing - $20/month for ChatGPT Plus vs. $30/month for EventCraftAI with event-specific features. 3) **vs. Midjourney**: $10/month for Midjourney + time spent on prompts + design software costs vs. all-inclusive EventCraftAI pricing. 4) **ROI**: Generate 100+ professional event images per month vs. 5-10 designs from a designer. 5) **No Learning Curve**: No need to learn complex design software or prompt engineering. 6) **Scalability**: Handle multiple events simultaneously without additional costs."
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="container max-w-6xl py-8 md:py-12">
      <HeaderSection
        label="FAQ"
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about EventCraftAI. Can't find what you're looking for? Contact our support team for personalized help."
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">AI-Powered</div>
            <div className="text-sm text-muted-foreground">Advanced AI Generation</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Image className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">Multiple Formats</div>
            <div className="text-sm text-muted-foreground">Images & Carousels</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold">Fast Generation</div>
            <div className="text-sm text-muted-foreground">Seconds, Not Hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold">Secure</div>
            <div className="text-sm text-muted-foreground">Your Data Protected</div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {faqCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <IconComponent className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">{category.title}</h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faqItem) => (
                  <AccordionItem key={faqItem.id} value={faqItem.id}>
                    <AccordionTrigger className="text-left">
                      {faqItem.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground sm:text-[15px] leading-relaxed">
                      {faqItem.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          );
        })}
      </div>

      {/* Contact Support Section */}
      <div className="mt-16 p-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-semibold">Still Have Questions?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our support team is here to help you get the most out of EventCraftAI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center px-6 py-3 border border-input bg-background rounded-lg hover:bg-accent transition-colors"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 