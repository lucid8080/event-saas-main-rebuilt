"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Download, Share2, Sparkles, Camera, Users, Calendar, Eye } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { SkiperMarquee } from "@/components/ui/skiper-marquee";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

interface PublicImage {
  id: string;
  url: string;
  prompt: string;
  eventType: string;
  createdAt: string;
  user: {
    name: string;
    image: string;
  };
}

export default function WeddingThemePage() {
  const [images, setImages] = useState<PublicImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<PublicImage | null>(null);

  useEffect(() => {
    const fetchWeddingImages = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Fetching wedding images...');
        
        const response = await fetch('/api/public-images?eventType=WEDDING&limit=12');
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 API Response:', data);
          console.log('📊 Images count:', data.images?.length || 0);
          
          setImages(data.images || []);
        } else {
          console.error('❌ API Error:', response.status, response.statusText);
          toast.error('Failed to load wedding images');
        }
      } catch (error) {
        console.error('❌ Error fetching wedding images:', error);
        toast.error('Failed to load wedding images');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeddingImages();
  }, []);

  const handleLike = (imageId: string) => {
    const newLikedImages = new Set(likedImages);
    if (newLikedImages.has(imageId)) {
      newLikedImages.delete(imageId);
    } else {
      newLikedImages.add(imageId);
    }
    setLikedImages(newLikedImages);
    localStorage.setItem('likedWeddingImages', JSON.stringify(Array.from(newLikedImages)));
  };

  const handleDownload = async (url: string, filename: string = 'wedding-flyer.png') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Wedding flyer downloaded successfully!');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleShare = async (imageUrl: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Beautiful Wedding Flyer',
          text: 'Check out this stunning wedding flyer created with EventCraftAI!',
          url: imageUrl,
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast.success('Image URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share image');
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      {/* Hero Section */}
      <section className="relative flex min-h-[800px] py-32 bg-gradient-to-br overflow-hidden from-[#fdfbf7] via-[#faf8f3] to-[#f5f2ea] items-center">
        <SkiperMarquee weddingImages={images} />
        <div className="container relative px-4 mx-auto z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Sparkles className="size-16 mx-auto mb-6 text-[#9f8a7a]" />
              <h1 className="mb-6 text-5xl text-[#6b5b4a] md:text-6xl font-bold leading-tight">
                Wedding Flyers That Capture Love
              </h1>
              <p className="max-w-3xl mx-auto mb-8 text-xl text-[#8b7d6b] md:text-2xl leading-relaxed">
                Create stunning wedding invitations and flyers that tell your unique love story. 
                From elegant garden ceremonies to intimate beach celebrations, make your special day unforgettable with AI-powered design.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 mb-12 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="mb-2 text-3xl text-[#9f8a7a] font-bold">500+</div>
                <div className="text-[#8b7d6b]">Wedding Flyers</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl text-[#b8a99a] font-bold">98%</div>
                <div className="text-[#8b7d6b]">Happy Couples</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl text-[#d4c4b3] font-bold">16</div>
                <div className="text-[#8b7d6b]">Wedding Styles</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl text-[#e8d5c4] font-bold">24hr</div>
                <div className="text-[#8b7d6b]">Design Time</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="px-8 py-4 bg-[#9f8a7a] text-white text-lg shadow-lg hover:bg-[#8b7d6b] font-semibold">
                  <Camera className="size-5 mr-2" />
                  Create Your Wedding Flyer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-[#faf8f3]">
        <div className="container px-4 mx-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl text-[#6b5b4a] md:text-4xl font-bold">
                Wedding Flyer Inspiration
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-[#8b7d6b]">
                Discover beautiful wedding flyers created by our community. Click any image to see details and use it as a template.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4 sm:columns-2 md:columns-3 lg:columns-4 columns-1 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="mb-4 break-inside-avoid">
                    <div className="h-64 bg-[#e8e2d8] rounded-lg animate-pulse" />
                  </div>
                ))}
              </div>
            ) : images.length === 0 ? (
              <div className="py-12 text-center">
                <div className="flex size-24 mx-auto mb-4 bg-[#f0ede6] rounded-full items-center justify-center">
                  <Heart className="size-12 text-[#9f8a7a]" />
                </div>
                <h3 className="mb-2 text-xl text-[#6b5b4a] font-semibold">No Wedding Flyers Yet</h3>
                <p className="mb-6 text-[#8b7d6b]">Be the first to create and share a beautiful wedding flyer!</p>

                <Link href="/dashboard">
                  <Button className="bg-[#9f8a7a] text-white hover:bg-[#8b7d6b]">Create Your First Flyer</Button>
                </Link>
              </div>
                        ) : (
              <div className="space-y-4 sm:columns-2 md:columns-3 lg:columns-4 columns-1 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative mb-4 group break-inside-avoid">
                    <div 
                      className="rounded-sm cursor-pointer overflow-hidden"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img 
                        src={image.url} 
                        alt={image.prompt} 
                        className="w-full h-auto transition- hover:scale-105 object-cover duration-200"
                        onError={(e) => {
                          console.error('❌ Image load error:', image.url);
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-auto bg-red-100 flex items-center justify-center text-red-600 p-4">Image failed to load</div>';
                        }}
                        onLoad={() => {
                          console.log('✅ Image loaded successfully:', image.url);
                        }}
                      />
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Image Details Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] bg-[#fdfbf7] border-[#e8e2d8] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#6b5b4a] font-bold">Wedding Flyer Details</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative bg-white rounded-lg shadow-lg aspect-square overflow-hidden">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-lg text-[#6b5b4a] font-semibold">Generated by</h3>
                  <div className="flex space-x-3 items-center">
                    {selectedImage.user?.image ? (
                      <div className="size-10 rounded-full overflow-hidden">
                        <Image
                          src={selectedImage.user.image}
                          alt={selectedImage.user.name || 'User'}
                          width={40}
                          height={40}
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-10 bg-[#b8a99a] rounded-full items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {selectedImage.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-[#6b5b4a] font-medium">
                        {selectedImage.user?.name || 'Anonymous User'}
                      </p>
                      <p className="text-sm text-[#8b7d6b]">
                        {new Date(selectedImage.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-2 text-lg text-[#6b5b4a] font-semibold">Prompt Used</h3>
                  <p className="p-3 bg-[#f5f2ea] text-[#8b7d6b] text-sm border-[#e8e2d8] rounded-lg border">
                    {selectedImage.prompt}
                  </p>
                </div>

                <div className="flex justify-center">
                  <Button 
                    size="lg"
                    className="px-8 py-3 bg-[#9f8a7a] text-lg text-white shadow-lg hover:bg-[#8b7d6b] font-semibold"
                    onClick={() => {
                      // Navigate to dashboard with this prompt as template
                      window.location.href = `/dashboard?template=${encodeURIComponent(selectedImage.prompt)}`;
                    }}
                  >
                    <Sparkles className="size-5 mr-2" />
                    Use This as Template
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-12 text-3xl text-center text-[#6b5b4a] md:text-4xl font-bold">
              Why Choose EventCraftAI for Your Wedding?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-[#faf8f3] border-[#e8e2d8] shadow-lg transition-shadow hover:shadow-xl border">
                <CardContent className="p-6 text-center">
                  <div className="flex size-16 mx-auto mb-4 bg-[#f0ede6] rounded-full items-center justify-center">
                    <Sparkles className="size-8 text-[#9f8a7a]" />
                  </div>
                  <h3 className="mb-3 text-xl text-[#6b5b4a] font-semibold">AI-Powered Design</h3>
                  <p className="text-[#8b7d6b]">
                    Our AI creates unique, personalized wedding flyers that reflect your style and theme.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#faf8f3] border-[#e8e2d8] shadow-lg transition-shadow hover:shadow-xl border">
                <CardContent className="p-6 text-center">
                  <div className="flex size-16 mx-auto mb-4 bg-[#f0ede6] rounded-full items-center justify-center">
                    <Users className="size-8 text-[#b8a99a]" />
                  </div>
                  <h3 className="mb-3 text-xl text-[#6b5b4a] font-semibold">Perfect for Every Couple</h3>
                  <p className="text-[#8b7d6b]">
                    From traditional ceremonies to modern celebrations, we have designs for every couple.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#faf8f3] border-[#e8e2d8] shadow-lg transition-shadow hover:shadow-xl border">
                <CardContent className="p-6 text-center">
                  <div className="flex size-16 mx-auto mb-4 bg-[#f0ede6] rounded-full items-center justify-center">
                    <Calendar className="size-8 text-[#d4c4b3]" />
                  </div>
                  <h3 className="mb-3 text-xl text-[#6b5b4a] font-semibold">Quick & Easy</h3>
                  <p className="text-[#8b7d6b]">
                    Create your perfect wedding flyer in minutes, not hours. No design skills required.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#9f8a7a] to-[#b8a99a]">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-6 text-3xl text-white md:text-4xl font-bold">
            Ready to Create Your Perfect Wedding Flyer?
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-xl text-[#f5f2ea]">
            Join thousands of happy couples who have created stunning wedding flyers with EventCraftAI. 
            Start your journey today and make your special day even more memorable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="px-8 py-4 bg-white text-[#6b5b4a] text-lg shadow-lg hover:bg-[#faf8f3] font-semibold">
                <Camera className="size-5 mr-2" />
                Start Creating Now
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="px-8 py-4 text-white text-lg border-2 border-white hover:bg-white hover:text-[#6b5b4a] font-semibold">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 