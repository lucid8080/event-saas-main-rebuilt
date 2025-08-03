"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical, Download, Trash2, Heart, Filter, X, Pencil, Layers, Image as ImageIcon, Globe, Lock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useImageEditToggle } from "@/hooks/use-image-edit-toggle";
import { ImageEditorModal } from "@/components/dashboard/image-editor-modal";
import { WebPImage } from "@/components/shared/webp-image";
import { getOptimalImageUrl } from "@/lib/webp-url-utils";

const eventTypes = [
  { id: 1, name: "Birthday Party" },
  { id: 2, name: "Wedding" },
  { id: 3, name: "Corporate Event" },
  { id: 4, name: "Holiday Celebration" },
  { id: 5, name: "Concert" },
  { id: 6, name: "Sports Event" },
  { id: 7, name: "Nightlife" },
  { id: 8, name: "Family Gathering" },
  { id: 9, name: "BBQ" },
  { id: 10, name: "Park Gathering" },
  { id: 11, name: "Community Event" },
  { id: 12, name: "Fundraiser" },
  { id: 13, name: "Workshop" },
  { id: 14, name: "Meetup" },
  { id: 15, name: "Celebration" },
  { id: 16, name: "Reunion" },
  { id: 17, name: "Potluck" },
  { id: 18, name: "Game Night" },
  { id: 19, name: "Book Club" },
  { id: 20, name: "Art Class" },
  { id: 21, name: "Fitness Class" },
];

interface ImageData {
  id: string;
  url: string;
  prompt: string;
  eventType?: string;
  eventDetails?: any;
  isPublic: boolean;
  createdAt: string;
  // WebP-specific fields
  webpKey?: string;
  originalFormat?: string;
  compressionRatio?: number;
  webpEnabled?: boolean;
}

interface CarouselData {
  id: string;
  title: string;
  description?: string;
  slides: any[];
  slideUrls: string[];
  aspectRatio: string;
  slideCount: number;
  isPublic: boolean;
  createdAt: string;
}

export default function GalleryPage() {
  const { imageEditEnabled, isLoading: toggleLoading } = useImageEditToggle();
  const [activeTab, setActiveTab] = useState("events");
  const [images, setImages] = useState<ImageData[]>([]);
  const [carousels, setCarousels] = useState<CarouselData[]>([]);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [likedCarousels, setLikedCarousels] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [selectedCarousel, setSelectedCarousel] = useState<CarouselData | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [filteredImages, setFilteredImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [webpUrls, setWebpUrls] = useState<Map<string, { primaryUrl: string; fallbackUrl: string; isWebP: boolean }>>(new Map());

  // Fetch images and carousels from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user images
        const userImagesResponse = await fetch('/api/user-images');
        const userImages = userImagesResponse.ok ? (await userImagesResponse.json()).images || [] : [];
        
        // Fetch public images
        const publicImagesResponse = await fetch('/api/public-images');
        const publicImages = publicImagesResponse.ok ? (await publicImagesResponse.json()).images || [] : [];
        
        // Combine user images and public images, removing duplicates
        const allImages = [...userImages];
        const userImageIds = new Set(userImages.map((img: ImageData) => img.id));
        
        publicImages.forEach((publicImg: any) => {
          if (!userImageIds.has(publicImg.id)) {
            allImages.push({
              id: publicImg.id,
              url: publicImg.url,
              prompt: publicImg.prompt,
              eventType: publicImg.eventType,
              eventDetails: publicImg.eventDetails,
              isPublic: publicImg.isPublic,
              createdAt: publicImg.createdAt
            });
          }
        });
        
        setImages(allImages);
        setFilteredImages(allImages);
        
        // Generate WebP URLs for all images
        const webpUrlPromises = allImages.map(async (image) => {
          const urlData = await getOptimalImageUrl(
            image.url,
            image.webpKey,
            image.webpEnabled,
            image.originalFormat
          );
          return { id: image.id, ...urlData };
        });
        
        const webpUrlResults = await Promise.allSettled(webpUrlPromises);
        const newWebpUrls = new Map();
        
        webpUrlResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            newWebpUrls.set(result.value.id, {
              primaryUrl: result.value.primaryUrl,
              fallbackUrl: result.value.fallbackUrl,
              isWebP: result.value.isWebP
            });
          } else {
            // Fallback to original URL if WebP generation fails
            const image = allImages[index];
            newWebpUrls.set(image.id, {
              primaryUrl: image.url,
              fallbackUrl: image.url,
              isWebP: false
            });
          }
        });
        
        setWebpUrls(newWebpUrls);
        
        // Fetch carousels
        const carouselsResponse = await fetch('/api/user-carousels');
        if (carouselsResponse.ok) {
          const carouselsData = await carouselsResponse.json();
          setCarousels(carouselsData.carousels || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load gallery data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filter when selectedEventType changes
  useEffect(() => {
    if (selectedEventType) {
      const filtered = images.filter((image: ImageData) => 
        image.eventType === selectedEventType
      );
      setFilteredImages(filtered);
    } else {
      setFilteredImages(images);
    }
  }, [selectedEventType, images]);

  // Handle like/unlike for images
  const handleImageLike = (imageId: string) => {
    const newLikedImages = new Set(likedImages);
    if (newLikedImages.has(imageId)) {
      newLikedImages.delete(imageId);
    } else {
      newLikedImages.add(imageId);
    }
    setLikedImages(newLikedImages);
    localStorage.setItem('likedImages', JSON.stringify(Array.from(newLikedImages)));
  };

  // Handle like/unlike for carousels
  const handleCarouselLike = (carouselId: string) => {
    const newLikedCarousels = new Set(likedCarousels);
    if (newLikedCarousels.has(carouselId)) {
      newLikedCarousels.delete(carouselId);
    } else {
      newLikedCarousels.add(carouselId);
    }
    setLikedCarousels(newLikedCarousels);
    localStorage.setItem('likedCarousels', JSON.stringify(Array.from(newLikedCarousels)));
  };

  // Handle download
  const handleDownload = async (url: string, filename: string = 'generated-image.png') => {
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
      toast.success('File downloaded successfully!');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  // Handle delete image
  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/user-images/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Remove from local state
      const newImages = images.filter(img => img.id !== imageId);
      setImages(newImages);
      setFilteredImages(newImages.filter(image => 
        !selectedEventType || image.eventType === selectedEventType
      ));
      
      // Remove from liked images if it was liked
      if (likedImages.has(imageId)) {
        const newLikedImages = new Set(likedImages);
        newLikedImages.delete(imageId);
        setLikedImages(newLikedImages);
        localStorage.setItem('likedImages', JSON.stringify(Array.from(newLikedImages)));
      }

      toast.success('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  // Handle delete carousel
  const handleDeleteCarousel = async (carouselId: string) => {
    try {
      const response = await fetch(`/api/user-carousels/${carouselId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete carousel');
      }

      // Remove from local state
      const newCarousels = carousels.filter(carousel => carousel.id !== carouselId);
      setCarousels(newCarousels);
      
      // Remove from liked carousels if it was liked
      if (likedCarousels.has(carouselId)) {
        const newLikedCarousels = new Set(likedCarousels);
        newLikedCarousels.delete(carouselId);
        setLikedCarousels(newLikedCarousels);
        localStorage.setItem('likedCarousels', JSON.stringify(Array.from(newLikedCarousels)));
      }

      toast.success('Carousel deleted successfully!');
    } catch (error) {
      console.error('Error deleting carousel:', error);
      toast.error('Failed to delete carousel');
    }
  };

  // Handle public/private toggle for images
  const handleImagePublicToggle = async (imageId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/user-images/${imageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update image visibility');
      }

      // Update local state
      const newImages = images.map(img => 
        img.id === imageId ? { ...img, isPublic: !currentStatus } : img
      );
      setImages(newImages);
      setFilteredImages(newImages.filter(image => 
        !selectedEventType || image.eventType === selectedEventType
      ));

      toast.success(`Image ${!currentStatus ? 'made public' : 'made private'} successfully!`);
    } catch (error) {
      console.error('Error updating image visibility:', error);
      toast.error('Failed to update image visibility');
    }
  };

  // Handle public/private toggle for carousels
  const handleCarouselPublicToggle = async (carouselId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/user-carousels/${carouselId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update carousel visibility');
      }

      // Update local state
      const newCarousels = carousels.map(carousel => 
        carousel.id === carouselId ? { ...carousel, isPublic: !currentStatus } : carousel
      );
      setCarousels(newCarousels);

      toast.success(`Carousel ${!currentStatus ? 'made public' : 'made private'} successfully!`);
    } catch (error) {
      console.error('Error updating carousel visibility:', error);
      toast.error('Failed to update carousel visibility');
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-6 mx-auto">
        <div className="flex py-12 items-center justify-center">
          <div className="text-center">
            <div className="size-8 mx-auto border-b-2 border-purple-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Loading your gallery...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Gallery</h1>
        <p className="text-gray-600">View and manage all your AI-generated content</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-6">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <ImageIcon className="size-4" />
            Generated Events
            <span className="px-2 py-0.5 ml-1 bg-gray-200 text-xs text-gray-700 rounded-full font-medium">
              {images.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="carousels" className="flex items-center gap-2">
            <Layers className="size-4" />
            Generated Carousels
            <span className="px-2 py-0.5 ml-1 bg-gray-200 text-xs text-gray-700 rounded-full font-medium">
              {carousels.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="mt-0">
          <div className="flex mb-6 items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Generated Events</h2>
              <p className="text-gray-600">Your AI-generated event images</p>
            </div>
            
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="size-4" />
                  {selectedEventType || "All Events"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setSelectedEventType(null)}
                  className="cursor-pointer"
                >
                  All Events
                </DropdownMenuItem>
                {eventTypes.map((type) => (
                  <DropdownMenuItem 
                    key={type.id}
                    onClick={() => setSelectedEventType(type.name)}
                    className="cursor-pointer"
                  >
                    {type.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Events Grid */}
          {filteredImages.length === 0 ? (
            <div className="py-12 text-center">
              <div className="flex size-24 mx-auto mb-4 bg-gray-100 rounded-full items-center justify-center">
                <span className="text-2xl">🖼️</span>
              </div>
              <h3 className="mb-2 text-lg text-gray-900 font-medium">No event images yet</h3>
              <p className="mb-4 text-gray-600">
                {selectedEventType 
                  ? `No images found for ${selectedEventType} events`
                  : "Generate your first event image to see it here"
                }
              </p>
              {selectedEventType && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedEventType(null)}
                >
                  View all images
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 sm:columns-2 md:columns-3 lg:columns-4 columns-1 gap-4">
              {filteredImages.map((image) => (
                <div key={image.id} className="relative mb-4 group break-inside-avoid">
                  <div 
                    className="rounded-sm cursor-pointer overflow-hidden"
                    onClick={() => setSelectedImage(image)}
                  >
                    <WebPImage
                      src={image.url}
                      webpSrc={webpUrls.get(image.id)?.primaryUrl}
                      alt={`Generated event ${image.id}`}
                      className="w-full h-auto transition- hover:scale-105 object-cover duration-200"
                    />
                  </div>
                  {image.eventType && (
                    <div className="absolute px-2 py-1 bg-black/50 text-sm text-white rounded-md left-2 top-2">
                      {image.eventType}
                    </div>
                  )}
                  {image.isPublic && (
                    <div className="absolute px-2 py-1 bg-green-500 text-sm text-white rounded-md left-2 bottom-2">
                      <Globe className="inline size-3 mr-1" />
                      Public
                    </div>
                  )}
                  <div className="absolute opacity-0 transition-opacity group-hover:opacity-100 right-2 top-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-700/90 backdrop-blur-sm"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDownload(image.url)}>
                          <Download className="size-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleImagePublicToggle(image.id, image.isPublic)}>
                          {image.isPublic ? (
                            <>
                              <Lock className="size-4 mr-2" />
                              Make Private
                            </>
                          ) : (
                            <>
                              <Globe className="size-4 mr-2" />
                              Make Public
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleImageLike(image.id)}>
                          <Heart className={`mr-2 size-4 ${likedImages.has(image.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          {likedImages.has(image.id) ? 'Unlike' : 'Like'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteImage(image.id)}>
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Carousels Tab */}
        <TabsContent value="carousels" className="mt-0">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Generated Carousels</h2>
            <p className="text-gray-600">Your AI-generated social media carousels</p>
          </div>

          {/* Carousels Grid */}
          {carousels.length === 0 ? (
            <div className="py-12 text-center">
              <div className="flex size-24 mx-auto mb-4 bg-gray-100 rounded-full items-center justify-center">
                <span className="text-2xl">🎠</span>
              </div>
              <h3 className="mb-2 text-lg text-gray-900 font-medium">No carousels yet</h3>
              <p className="mb-4 text-gray-600">
                Create your first carousel to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:columns-2 md:columns-3 lg:columns-4 columns-1 gap-4">
              {carousels.map((carousel) => (
                <div key={carousel.id} className="relative mb-4 group break-inside-avoid">
                  <div 
                    className="rounded-sm cursor-pointer overflow-hidden"
                    onClick={() => setSelectedCarousel(carousel)}
                  >
                    {/* Show first slide as preview */}
                    <img 
                      src={carousel.slideUrls[0] || '/placeholder-carousel.png'} 
                      alt={`Carousel ${carousel.title}`} 
                      className="w-full h-auto transition- hover:scale-105 object-cover duration-200"
                    />
                  </div>
                  <div className="absolute px-2 py-1 bg-black/50 text-sm text-white rounded-md left-2 top-2">
                    {carousel.slideCount} slides
                  </div>
                  {carousel.isPublic && (
                    <div className="absolute px-2 py-1 bg-green-500 text-sm text-white rounded-md left-2 bottom-2">
                      <Globe className="inline size-3 mr-1" />
                      Public
                    </div>
                  )}
                  <div className="absolute opacity-0 transition-opacity group-hover:opacity-100 right-2 top-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-700/90 backdrop-blur-sm"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDownload(carousel.slideUrls[0], `${carousel.title}.png`)}>
                          <Download className="size-4 mr-2" />
                          Download First Slide
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCarouselPublicToggle(carousel.id, carousel.isPublic)}>
                          {carousel.isPublic ? (
                            <>
                              <Lock className="size-4 mr-2" />
                              Make Private
                            </>
                          ) : (
                            <>
                              <Globe className="size-4 mr-2" />
                              Make Public
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCarouselLike(carousel.id)}>
                          <Heart className={`mr-2 size-4 ${likedCarousels.has(carousel.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          {likedCarousels.has(carousel.id) ? 'Unlike' : 'Like'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteCarousel(carousel.id)}>
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed flex bg-black/80 inset-0 z-50">
          {/* Main Image Area */}
          <div className="relative flex flex-1 p-4 items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute bg-black/50 text-white hover:bg-black/70 right-2 top-2 z-50"
              onClick={() => setSelectedImage(null)}
            >
              <X className="size-6" />
            </Button>
            <WebPImage
              src={selectedImage.url}
              webpSrc={webpUrls.get(selectedImage.id)?.primaryUrl}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          {/* Side Panel */}
          <div className="w-80 p-6 bg-background border-l overflow-y-auto">
            <div className="space-y-6">
              {/* Event Type Section */}
              {selectedImage.eventType && (
                <div>
                  <h3 className="mb-2 font-semibold">Event Type</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedImage.eventType}
                  </p>
                </div>
              )}

              {/* Prompt Section */}
              <div>
                <h3 className="mb-2 font-semibold">Your Prompt</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedImage.prompt}
                </p>
              </div>

              {/* Date Section */}
              <div>
                <h3 className="mb-2 font-semibold">Created</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedImage.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions Section */}
              <div className="pt-4 space-y-2">
                {!toggleLoading && imageEditEnabled && (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      setEditingImageUrl(selectedImage.url);
                      setIsEditing(true);
                    }}
                  >
                    <Pencil className="size-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleDownload(selectedImage.url)}
                >
                  <Download className="size-4 mr-2" />
                  Download
                </Button>
                
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleImageLike(selectedImage.id)}
                >
                  <Heart className={`mr-2 size-4 ${
                    likedImages.has(selectedImage.id) 
                      ? 'fill-red-500 text-red-500' 
                      : ''
                  }`} />
                  {likedImages.has(selectedImage.id) 
                    ? 'Unlike' 
                    : 'Like'}
                </Button>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    handleDeleteImage(selectedImage.id);
                    setSelectedImage(null);
                  }}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Carousel Modal */}
      {selectedCarousel && (
        <div className="fixed flex bg-black/80 inset-0 z-50">
          {/* Main Carousel Area */}
          <div className="relative flex flex-1 p-4 items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute bg-black/50 text-white hover:bg-black/70 right-2 top-2 z-50"
              onClick={() => setSelectedCarousel(null)}
            >
              <X className="size-6" />
            </Button>
            
            {/* Carousel Slides Display */}
            <div className="flex p-4 gap-4 overflow-x-auto">
              {selectedCarousel.slideUrls.map((url, index) => (
                <div key={index} className="shrink-0">
                  <img
                    src={url}
                    alt={`Slide ${index + 1}`}
                    className="max-w-sm max-h-[80vh] object-contain"
                  />
                  <p className="mt-2 text-center text-sm text-white">
                    Slide {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="w-80 p-6 bg-background border-l overflow-y-auto">
            <div className="space-y-6">
              {/* Title Section */}
              <div>
                <h3 className="mb-2 font-semibold">Title</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCarousel.title}
                </p>
              </div>

              {/* Description Section */}
              {selectedCarousel.description && (
                <div>
                  <h3 className="mb-2 font-semibold">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCarousel.description}
                  </p>
                </div>
              )}

              {/* Details Section */}
              <div>
                <h3 className="mb-2 font-semibold">Details</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Slides: {selectedCarousel.slideCount}</p>
                  <p>Aspect Ratio: {selectedCarousel.aspectRatio}</p>
                  <p>Created: {new Date(selectedCarousel.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Actions Section */}
              <div className="pt-4 space-y-2">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleDownload(selectedCarousel.slideUrls[0], `${selectedCarousel.title}-slide1.png`)}
                >
                  <Download className="size-4 mr-2" />
                  Download First Slide
                </Button>
                
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleCarouselLike(selectedCarousel.id)}
                >
                  <Heart className={`mr-2 size-4 ${
                    likedCarousels.has(selectedCarousel.id) 
                      ? 'fill-red-500 text-red-500' 
                      : ''
                  }`} />
                  {likedCarousels.has(selectedCarousel.id) 
                    ? 'Unlike' 
                    : 'Like'}
                </Button>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    handleDeleteCarousel(selectedCarousel.id);
                    setSelectedCarousel(null);
                  }}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Editor Modal */}
      {isEditing && editingImageUrl && (
        <ImageEditorModal
          imageUrl={editingImageUrl}
          onClose={() => {
            setIsEditing(false);
            setEditingImageUrl(null);
          }}
          onEdit={(editedImageUrl: string) => {
            // Update the image in the gallery
            setImages(prevImages => 
              prevImages.map(img => 
                img.url === editingImageUrl 
                  ? { ...img, url: editedImageUrl }
                  : img
              )
            );
            setFilteredImages(prevImages => 
              prevImages.map(img => 
                img.url === editingImageUrl 
                  ? { ...img, url: editedImageUrl }
                  : img
              )
            );
            setIsEditing(false);
            setEditingImageUrl(null);
          }}
        />
      )}
    </div>
  );
} 