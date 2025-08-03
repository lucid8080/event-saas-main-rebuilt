import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { HeaderSection } from "../shared/header-section";

const pricingFaqData = [
  {
    id: "item-1",
    question: "What is EventCraftAI and how does it work?",
    answer:
      "EventCraftAI is an AI-powered platform that generates custom event images and carousels. Simply describe your event details, choose your preferences, and our AI creates professional visuals in seconds. We support various event types including birthdays, weddings, corporate events, and more.",
  },
  {
    id: "item-2",
    question: "What types of events do you support?",
    answer:
      "We support a wide range of events including birthday parties, weddings, corporate events, family gatherings, BBQs, fundraisers, workshops, holiday celebrations, and more. Our AI adapts to your specific event type and creates appropriate designs.",
  },
  {
    id: "item-3",
    question: "How does the credits system work?",
    answer:
      "Credits are used to generate images and carousels. Each generation costs 1 credit. Free users get limited credits to start, while paid plans provide more credits per billing cycle. Monthly plans give you credits monthly, while yearly plans provide 12x the monthly amount upfront.",
  },
  {
    id: "item-4",
    question: "What are the pricing plans and what do they include?",
    answer:
      "We offer three plans: Starter ($30/month or $288/year) with 100 credits, Pro ($60/month or $576/year) with 200 credits, and Business ($120/month or $1152/year) with 500 credits. Yearly plans provide 12x the monthly credits upfront. All plans include AI image generation, customization tools, and priority support.",
  },
  {
    id: "item-5",
    question: "What is the Carousel Maker feature?",
    answer:
      "The Carousel Maker is an experimental feature that lets you create multi-slide carousels for social media platforms like Instagram, LinkedIn, and TikTok. You can generate AI backgrounds, add editable text overlays, and create professional social media content with up to 20 slides.",
  },
  {
    id: "item-6",
    question: "Can I customize the generated images?",
    answer:
      "Yes! Our platform includes advanced editing tools that allow you to fine-tune colors, text, layouts, and other elements. You can edit text in real-time, adjust positioning, and customize the design to match your exact needs.",
  },
  {
    id: "item-7",
    question: "What image formats and sizes do you support?",
    answer:
      "We support multiple aspect ratios including 1:1 (square), 4:5 (portrait), 16:9 (landscape), and 9:16 (story format). Images are generated in high resolution suitable for social media, print, and digital use.",
  },
  {
    id: "item-8",
    question: "Do you offer a free trial?",
    answer:
      "Yes, we offer a 14-day free trial for both Pro Monthly and Pro Annual plans. This gives you full access to all features so you can experience the platform before committing to a paid subscription.",
  },
  {
    id: "item-9",
    question: "Can I save and organize my generated content?",
    answer:
      "Absolutely! All your generated images and carousels are automatically saved to your gallery. You can organize them, download them, and access them anytime. The gallery separates your event images from carousels for easy management.",
  },
  {
    id: "item-10",
    question: "What if I run out of credits?",
    answer:
      "When you run out of credits, you can upgrade your plan to get more credits, or wait until your next billing cycle when credits are refreshed. You can also purchase additional credits if needed.",
  },
  {
    id: "item-11",
    question: "Is there a limit on how many images I can generate?",
    answer:
      "The limit depends on your plan and available credits. Each image or carousel generation costs 1 credit. Free users have limited credits, while paid plans provide generous amounts that refresh each billing cycle.",
  },
  {
    id: "item-12",
    question: "Do you offer customer support?",
    answer:
      "Yes! We provide email support at support@eventcraftai.com, live chat during business hours (Mon-Fri: 9AM-6PM EST), and phone support for urgent technical issues. Pro and Business plans include priority support.",
  },
];

export function PricingFaq() {
  return (
    <section className="container max-w-4xl py-2">
      <HeaderSection
        label="FAQ"
        title="Frequently Asked Questions"
        subtitle="Explore our comprehensive FAQ to find quick answers to common
          inquiries. If you need further assistance, don't hesitate to
          contact us for personalized help."
      />

      <Accordion type="single" collapsible className="w-full my-12">
        {pricingFaqData.map((faqItem) => (
          <AccordionItem key={faqItem.id} value={faqItem.id}>
            <AccordionTrigger>{faqItem.question}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground sm:text-[15px]">
              {faqItem.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
