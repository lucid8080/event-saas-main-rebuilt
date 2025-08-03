"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Heart, Gift, Building2, Music, Trophy, Moon, Calendar } from "lucide-react";
import Link from "next/link";

const themes = [
  {
    id: "weddings",
    title: "Wedding Flyers",
    description: "Create stunning wedding invitations and flyers that tell your unique love story.",
    icon: Heart,
    color: "bg-rose-600 hover:bg-rose-700",
    bgColor: "bg-rose-50",
    iconColor: "text-rose-600",
    stats: "500+ Wedding Flyers Created",
    href: "/themes/weddings"
  },
  {
    id: "birthdays",
    title: "Birthday Party Flyers",
    description: "Create vibrant, fun birthday party invitations that will get everyone excited!",
    icon: Gift,
    color: "bg-orange-600 hover:bg-orange-700",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    stats: "1000+ Birthday Flyers Created",
    href: "/themes/birthdays"
  },
  {
    id: "corporate",
    title: "Corporate Event Flyers",
    description: "Create sophisticated corporate event invitations that reflect your brand's professionalism.",
    icon: Building2,
    color: "bg-blue-600 hover:bg-blue-700",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    stats: "750+ Corporate Flyers Created",
    href: "/themes/corporate"
  },
  {
    id: "concerts",
    title: "Concert Flyers",
    description: "Design electrifying concert and music event flyers that capture the energy of live performances.",
    icon: Music,
    color: "bg-purple-600 hover:bg-purple-700",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    stats: "300+ Concert Flyers Created",
    href: "/themes/concerts"
  },
  {
    id: "sports",
    title: "Sports Event Flyers",
    description: "Create dynamic sports event flyers that build excitement and team spirit.",
    icon: Trophy,
    color: "bg-green-600 hover:bg-green-700",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    stats: "400+ Sports Flyers Created",
    href: "/themes/sports"
  },
  {
    id: "nightlife",
    title: "Nightlife Event Flyers",
    description: "Design trendy nightlife and party flyers that create buzz and excitement.",
    icon: Moon,
    color: "bg-indigo-600 hover:bg-indigo-700",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-600",
    stats: "600+ Nightlife Flyers Created",
    href: "/themes/nightlife"
  },
  {
    id: "holidays",
    title: "Holiday Celebration Flyers",
    description: "Create festive holiday celebration flyers for every season and special occasion.",
    icon: Calendar,
    color: "bg-red-600 hover:bg-red-700",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    stats: "800+ Holiday Flyers Created",
    href: "/themes/holidays"
  }
];

export default function ThemesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-white border-b border-gray-200 overflow-hidden">
        <div className="container relative px-4 mx-auto z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Sparkles className="size-12 mx-auto mb-4 text-gray-600" />
              <h1 className="mb-4 text-4xl text-gray-900 md:text-5xl font-bold">
                Event Flyer Themes
              </h1>
              <p className="mb-8 text-lg text-gray-600 md:text-xl leading-relaxed">
                Explore our collection of beautifully designed event flyer themes. 
                From romantic weddings to exciting concerts, find the perfect style for your event.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 mb-10 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mb-1 text-2xl text-gray-900 font-semibold">4,350+</div>
                <div className="text-gray-600 text-sm">Total Flyers Created</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl text-gray-900 font-semibold">7</div>
                <div className="text-gray-600 text-sm">Event Themes</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl text-gray-900 font-semibold">98%</div>
                <div className="text-gray-600 text-sm">Customer Satisfaction</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="px-6 py-3 bg-gray-900 text-white hover:bg-gray-800">
                  <Sparkles className="size-4 mr-2" />
                  Start Creating Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Themes Grid */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-2xl text-gray-900 md:text-3xl font-semibold">
                Choose Your Event Theme
              </h2>
              <p className="text-gray-600">
                Browse our collection of professionally designed event flyer themes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((theme) => {
                const IconComponent = theme.icon;
                return (
                  <Link key={theme.id} href={theme.href}>
                    <Card className="bg-white border-gray-200 transition-all hover:shadow-md group overflow-hidden duration-200 border">
                      <div className={`${theme.bgColor} p-6`}>
                        <div className="text-center">
                          <div className={`size-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition- duration-200 shadow-sm`}>
                            <IconComponent className={`size-6 ${theme.iconColor}`} />
                          </div>
                          <h3 className="mb-2 text-lg text-gray-900 font-semibold">
                            {theme.title}
                          </h3>
                          <p className="mb-3 text-gray-600 text-sm leading-relaxed">
                            {theme.description}
                          </p>
                          <div className="mb-4 text-xs text-gray-500">
                            {theme.stats}
                          </div>
                          <Button 
                            className={`${theme.color} text-white w-full text-sm`}
                          >
                            Explore Theme
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-10 text-2xl text-center text-gray-900 md:text-3xl font-semibold">
              Why Choose EventCraftAI Themes?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-gray-200 transition-shadow hover:shadow-md border">
                <CardContent className="p-6 text-center">
                  <div className="flex size-12 mx-auto mb-4 bg-gray-100 rounded-lg items-center justify-center">
                    <Sparkles className="size-6 text-gray-600" />
                  </div>
                  <h3 className="mb-2 text-lg text-gray-900 font-semibold">AI-Powered Design</h3>
                  <p className="text-gray-600 text-sm">
                    Our AI creates unique, personalized flyers that perfectly match your event theme and style.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200 transition-shadow hover:shadow-md border">
                <CardContent className="p-6 text-center">
                  <div className="flex size-12 mx-auto mb-4 bg-gray-100 rounded-lg items-center justify-center">
                    <Calendar className="size-6 text-gray-600" />
                  </div>
                  <h3 className="mb-2 text-lg text-gray-900 font-semibold">Theme-Specific</h3>
                  <p className="text-gray-600 text-sm">
                    Each theme is carefully crafted with appropriate colors, fonts, and design elements.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200 transition-shadow hover:shadow-md border">
                <CardContent className="p-6 text-center">
                  <div className="flex size-12 mx-auto mb-4 bg-gray-100 rounded-lg items-center justify-center">
                    <Sparkles className="size-6 text-gray-600" />
                  </div>
                  <h3 className="mb-2 text-lg text-gray-900 font-semibold">Instant Creation</h3>
                  <p className="text-gray-600 text-sm">
                    Create your perfect event flyer in minutes, not hours. No design experience required.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-4 text-2xl text-white md:text-3xl font-semibold">
            Ready to Create Your Perfect Event Flyer?
          </h2>
          <p className="max-w-2xl mx-auto mb-6 text-gray-300">
            Choose your theme and start creating stunning event flyers with EventCraftAI. 
            Join thousands of happy users who trust us for their event marketing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="px-6 py-3 bg-white text-gray-900 hover:bg-gray-100">
                <Sparkles className="size-4 mr-2" />
                Start Creating Now
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="px-6 py-3 text-white border-gray-300 hover:bg-white hover:text-gray-900">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 