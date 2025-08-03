import { TestimonialType } from "@/types"

const testimonials: TestimonialType[] = [
  {
    name: "Alexandra Martinez",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    review: "EventCraftAI transformed our event planning. The AI-generated images perfectly captured our vision and saved us hours of design work.",
  },
  {
    name: "David Thompson",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    review: "Incredible platform! The variety of styles and customization options made our corporate event stand out. Highly recommended!",
  },
  {
    name: "Sophie Williams",
    image: "https://randomuser.me/api/portraits/women/67.jpg",
    review: "As a wedding planner, this tool has been a game-changer. Our clients love the unique, personalized event imagery we create.",
  },
  {
    name: "Marcus Johnson",
    image: "https://randomuser.me/api/portraits/men/23.jpg",
    review: "The carousel maker feature is absolutely brilliant! Created stunning social media content in minutes that would have taken hours otherwise.",
  },
  {
    name: "Isabella Chen",
    image: "https://randomuser.me/api/portraits/women/89.jpg",
    review: "Perfect for our startup events. Professional designs without the designer price tag. The watermark feature gives us great brand exposure.",
  },
  {
    name: "Ryan O'Connor",
    image: "https://randomuser.me/api/portraits/men/12.jpg",
    review: "Used this for our charity fundraiser and the results were amazing. The holiday themes made our event feel so festive and engaging.",
  },
]

export function Testimonials() {
  return (
    <section className="container py-8 md:py-12 lg:py-24">
      <div className="flex flex-col max-w-[58rem] mx-auto space-y-4 text-center items-center">
        <h2 className="text-3xl sm:text-3xl md:text-6xl font-heading leading-[1.1]">
          What Our Users Say
        </h2>
        <p className="max-w-[85%] text-muted-foreground sm:text-lg sm:leading-7 leading-normal">
          Don't just take our word for it. Here's what event planners and organizers are saying about EventCraftAI.
        </p>
      </div>
      <div className="grid max-w-5xl py-8 mx-auto gap-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((item) => (
            <div key={item.name} className="h-full">
              <div className="relative h-full bg-muted/25 rounded-xl border">
                <div className="flex flex-col h-full px-4 py-5 sm:p-6">
                  <div className="flex flex-col h-full">
                    <q className="text-muted-foreground grow">{item.review}</q>
                    <div className="flex mt-4 items-center gap-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-8 rounded-full"
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}