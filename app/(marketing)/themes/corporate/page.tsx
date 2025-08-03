"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Download, Share2, Sparkles, Camera, Users, Calendar, Building2, Eye } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

export default function CorporateThemePage() {
  const [images, setImages] = useState<PublicImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<PublicImage | null>(null);

  useEffect(() => {
    const fetchCorporateImages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/public-images?eventType=CORPORATE_EVENT&limit=12');
        if (response.ok) {
          const data = await response.json();
          setImages(data.images || []);
        }
      } catch (error) {
        console.error('Error fetching corporate images:', error);
        toast.error('Failed to load corporate images');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCorporateImages();
  }, []);

  const handleLike = (imageId: string) => {
    const newLikedImages = new Set(likedImages);
    if (newLikedImages.has(imageId)) {
      newLikedImages.delete(imageId);
    } else {
      newLikedImages.add(imageId);
    }
    setLikedImages(newLikedImages);
    localStorage.setItem('likedCorporateImages', JSON.stringify(Array.from(newLikedImages)));
  };

  const handleDownload = async (url: string, filename: string = 'corporate-flyer.png') => {
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
      toast.success('Corporate flyer downloaded successfully!');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleShare = async (imageUrl: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Professional Corporate Event Flyer',
          text: 'Check out this professional corporate event flyer created with EventCraftAI!',
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-20">
        <div className="absolute inset-0 bg-[url('/public/styles/1_wild_card.png')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <Building2 className="mx-auto h-16 w-16 text-blue-600 mb-4" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                Professional Corporate Event Flyers
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                Create sophisticated corporate event invitations that reflect your brand's professionalism. 
                From conferences to team building events, make every business gathering impactful.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">750+</div>
                <div className="text-gray-600">Corporate Flyers Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">95%</div>
                <div className="text-gray-600">Business Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-600 mb-2">10min</div>
                <div className="text-gray-600">Design Time</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg">
                  <Camera className="mr-2 h-5 w-5" />
                  Create Corporate Flyer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Corporate Event Inspiration
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover professional corporate event flyers created by our community. Click any image to see details and use it as a template.
              </p>
            </div>

            {isLoading ? (
              <div className="columns-1 gap-4 space-y-4 sm:columns-2 md:columns-3 lg:columns-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="mb-4 break-inside-avoid">
                  <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                </div>
                ))}
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Corporate Flyers Yet</h3>
                <p className="text-gray-600 mb-6">Be the first to create and share a professional corporate event flyer!</p>
                <Link href="/dashboard">
                  <Button>Create Your First Flyer</Button>
                </Link>
              </div>
            ) : (
              <div className="columns-1 gap-4 space-y-4 sm:columns-2 md:columns-3 lg:columns-4">
                {images.map((image) => (
                  <div 
                    key={image.id} 
                    className="group relative mb-4 break-inside-avoid cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                      <img 
                        src={image.url} 
                        alt={image.prompt} 
                        className="h-auto w-full object-cover transition-transform duration-200 hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                      <div className="bg-white/90 rounded-lg px-3 py-2 text-sm font-medium text-gray-900">
                        View Details
                      </div>
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Corporate Flyer Details</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generated by</h3>
                  <div className="flex items-center space-x-3">
                    {selectedImage.user?.image ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={selectedImage.user.image}
                          alt={selectedImage.user.name || 'User'}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {selectedImage.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedImage.user?.name || 'Anonymous User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedImage.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Prompt Used</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                    {selectedImage.prompt}
                  </p>
                </div>

                <div className="flex justify-center">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-8 py-3 text-lg font-semibold"
                    onClick={() => {
                      // Navigate to dashboard with this prompt as template
                      window.location.href = `/dashboard?template=${encodeURIComponent(selectedImage.prompt)}`;
                    }}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
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
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Why Choose EventCraftAI for Corporate Events?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Professional Design</h3>
                  <p className="text-gray-600">
                    Our AI creates polished, business-appropriate flyers that enhance your brand image.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Brand Consistency</h3>
                  <p className="text-gray-600">
                    Maintain your corporate identity with customizable designs that match your brand guidelines.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Quick Turnaround</h3>
                  <p className="text-gray-600">
                    Create professional corporate flyers in minutes, perfect for last-minute event announcements.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Professional Corporate Event Flyers?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses that trust EventCraftAI for their corporate event marketing. 
            Elevate your brand and create impactful event communications today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                <Camera className="mr-2 h-5 w-5" />
                Start Creating Now
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 