"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { MoreVertical, Download, Trash2, Heart, Filter, X, Pencil, Layers, Image as ImageIcon, Globe, Lock, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
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
import { LazyImage } from "@/components/shared/lazy-image";
import { UpscaleButton } from "@/components/dashboard/upscale-button";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";
import { useBatchLazyLoading } from "@/hooks/use-lazy-loading";
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
  isUpscaled?: boolean;
  originalImageId?: string;
  upscaledImageId?: string;
  userId?: string; // Add userId to check ownership
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
  const { data: session } = useSession();
  const { imageEditEnabled, isLoading: toggleLoading } = useImageEditToggle();
  const [activeTab, setActiveTab] = useState("events");
  const [images, setImages] = useState<ImageData[]>([]);
  const [carousels, setCarousels] = useState<CarouselData[]>([]);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [likedCarousels, setLikedCarousels] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [upscaledImageUrl, setUpscaledImageUrl] = useState<string | null>(null);
  const [showUpscaled, setShowUpscaled] = useState(false);
  const [hasUpscaledVersion, setHasUpscaledVersion] = useState(false);
  const [selectedCarousel, setSelectedCarousel] = useState<CarouselData | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [filteredImages, setFilteredImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [webpUrls, setWebpUrls] = useState<Map<string, { primaryUrl: string; fallbackUrl: string; isWebP: boolean }>>(new Map());
  
  // Server-side pagination state
  const [hasMoreImages, setHasMoreImages] = useState(true);
  const [hasMoreCarousels, setHasMoreCarousels] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentCarouselOffset, setCurrentCarouselOffset] = useState(0);
  const [totalImageCount, setTotalImageCount] = useState(0); // Track total count
  const [totalCarouselCount, setTotalCarouselCount] = useState(0); // Track total count
  const [userCredits, setUserCredits] = useState(0);

  // Calculate optimal batch size based on screen size for 4-column preloading
  const getOptimalBatchSize = () => {
    if (typeof window === 'undefined') return 12; // Default for SSR
    
    const width = window.innerWidth;
    
    // Responsive batch sizes to ensure we fill all columns
    if (width >= 1024) {
      // Large screens (lg:columns-4) - need more images to fill 4 columns
      return 16; // 4 columns × 4 images per column = 16 images
    } else if (width >= 768) {
      // Medium screens (md:columns-3) - need images for 3 columns
      return 12; // 3 columns × 4 images per column = 12 images
    } else if (width >= 640) {
      // Small screens (sm:columns-2) - need images for 2 columns
      return 8; // 2 columns × 4 images per column = 8 images
    } else {
      // Mobile (columns-1) - single column
      return 6; // 1 column × 6 images = 6 images
    }
  };

  // Get current batch size for progressive loading (smaller than initial)
  const getProgressiveBatchSize = () => {
    if (typeof window === 'undefined') return 6; // Default for SSR
    
    const width = window.innerWidth;
    
    // Smaller batches for progressive loading to maintain smooth experience
    if (width >= 1024) {
      return 8; // 4 columns × 2 images per column = 8 images
    } else if (width >= 768) {
      return 6; // 3 columns × 2 images per column = 6 images
    } else if (width >= 640) {
      return 4; // 2 columns × 2 images per column = 4 images
    } else {
      return 3; // 1 column × 3 images = 3 images
    }
  };

  const sentinelRef = useRef<HTMLDivElement>(null);
  
  // Zoom functionality state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Fetch user credits
  useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setUserCredits(userData.credits || 0);
        }
      } catch (error) {
        console.error('Error fetching user credits:', error);
      }
    };

    fetchUserCredits();
  }, []);

  // Fetch initial images and carousels from API
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Calculate optimal batch size for 4-column preloading
      const initialBatchSize = getOptimalBatchSize();
      console.log(`🎯 Gallery: Loading initial batch of ${initialBatchSize} images for 4-column preloading`);
      
      // Fetch initial batch of user images only
      const userImagesResponse = await fetch(`/api/user-images?limit=${initialBatchSize}&offset=0`);
      const userImagesData = userImagesResponse.ok ? await userImagesResponse.json() : { images: [], pagination: { hasMore: false } };
      
      console.log(`Gallery: Found ${userImagesData.images.length} user images`);
      
      // Only show user's own images - no public images from other users
      const userImages = userImagesData.images || [];
      
      setImages(userImages);
      setFilteredImages(userImages);
      setHasMoreImages(userImagesData.pagination.hasMore);
      setCurrentOffset(initialBatchSize); // Next batch will start at offset of initial batch size
      
      // Set total count from user images only
      const totalUserImages = userImagesData.pagination?.total || 0;
      setTotalImageCount(totalUserImages);
      
      // Generate WebP URLs for initial images
      const webpUrlPromises = userImages.map(async (image) => {
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
          const image = uniqueImages[index];
          newWebpUrls.set(image.id, {
            primaryUrl: image.url,
            fallbackUrl: image.url,
            isWebP: false
          });
        }
      });
      
      setWebpUrls(newWebpUrls);
      
      // Fetch initial carousels
      const carouselsResponse = await fetch('/api/user-carousels');
      if (carouselsResponse.ok) {
        const carouselsData = await carouselsResponse.json();
        setCarousels(carouselsData.carousels || []);
        setTotalCarouselCount(carouselsData.carousels?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load gallery data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Add window resize listener to recalculate batch sizes
  useEffect(() => {
    const handleResize = () => {
      // Recalculate batch sizes when window resizes
      // This ensures optimal preloading for different screen sizes
      console.log(`🔄 Window resized: ${window.innerWidth}px - batch sizes recalculated`);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to load more images
  const loadMoreImages = async () => {
    console.log('🚀 loadMoreImages called:', { isLoadingMore, hasMoreImages, currentOffset });
    
    if (isLoadingMore) {
      console.log('❌ Already loading, skipping');
      return;
    }
    
    if (!hasMoreImages) {
      console.log('❌ No more images, skipping');
      return;
    }
    
    try {
      setIsLoadingMore(true);
      
      // Calculate progressive batch size for smooth loading
      const progressiveBatchSize = getProgressiveBatchSize();
      console.log(`📡 Fetching ${progressiveBatchSize} images with offset: ${currentOffset}`);
      
      // Fetch next batch of user images only
      const userImagesResponse = await fetch(`/api/user-images?limit=${progressiveBatchSize}&offset=${currentOffset}`);
      const userImagesData = userImagesResponse.ok ? await userImagesResponse.json() : { images: [], pagination: { hasMore: false } };
      console.log('👤 User images response:', { 
        ok: userImagesResponse.ok, 
        count: userImagesData.images?.length || 0,
        hasMore: userImagesData.pagination?.hasMore,
        total: userImagesData.pagination?.total
      });
      
      // Only use user images - no public images from other users
      const newImages = userImagesData.images || [];
      console.log(`📸 Found ${newImages.length} new user images`);
      
      // Remove duplicates with existing images
      const existingImageIds = new Set(images.map(img => img.id));
      const uniqueNewImages = newImages.filter(img => !existingImageIds.has(img.id));
      console.log(`✨ ${uniqueNewImages.length} unique new images after deduplication`);
      
      if (uniqueNewImages.length > 0) {
        setImages(prev => {
          const updated = [...prev, ...uniqueNewImages];
          console.log(`📸 Updated images count: ${prev.length} -> ${updated.length}`);
          return updated;
        });
        setFilteredImages(prev => {
          const updated = [...prev, ...uniqueNewImages];
          console.log(`🔍 Updated filtered images count: ${prev.length} -> ${updated.length}`);
          return updated;
        });
        
        // Generate WebP URLs for new images
        const webpUrlPromises = uniqueNewImages.map(async (image) => {
          const urlData = await getOptimalImageUrl(
            image.url,
            image.webpKey,
            image.webpEnabled,
            image.originalFormat
          );
          return { id: image.id, ...urlData };
        });
        
        const webpUrlResults = await Promise.allSettled(webpUrlPromises);
        webpUrlResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            setWebpUrls(prev => new Map(prev).set(result.value.id, {
              primaryUrl: result.value.primaryUrl,
              fallbackUrl: result.value.fallbackUrl,
              isWebP: result.value.isWebP
            }));
          } else {
            const image = uniqueNewImages[index];
            setWebpUrls(prev => new Map(prev).set(image.id, {
              primaryUrl: image.url,
              fallbackUrl: image.url,
              isWebP: false
            }));
          }
        });
      }
      
      const newHasMore = userImagesData.pagination.hasMore;
      console.log(`📊 Updating hasMoreImages: ${hasMoreImages} -> ${newHasMore}`);
      setHasMoreImages(newHasMore);
      setCurrentOffset(prev => {
        const newOffset = prev + progressiveBatchSize;
        console.log(`📍 Updating offset: ${prev} -> ${newOffset}`);
        return newOffset;
      });
      
    } catch (error) {
      console.error('💥 Error loading more images:', error);
      toast.error('Failed to load more images');
    } finally {
      console.log('🏁 loadMoreImages finished');
      setIsLoadingMore(false);
    }
  };

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    
    if (!sentinel || !hasMoreImages || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreImages && !isLoadingMore) {
          loadMoreImages();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMoreImages, isLoadingMore]);

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

  // Zoom functionality functions
  const zoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5)); // Max 5x zoom
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1)); // Min 0.1x zoom
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };



  const handleImageSelect = async (image: ImageData) => {
    setSelectedImage(image);
    setOriginalImageUrl(image.url);
    setUpscaledImageUrl(null);
    setShowUpscaled(false);
    setHasUpscaledVersion(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });

    // Fetch both original and upscaled versions
    try {
      const response = await fetch(`/api/image-versions?imageId=${image.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // If the current image is upscaled, set it as the upscaled version and get the original
          if (image.isUpscaled) {
            setUpscaledImageUrl(image.url);
            setOriginalImageUrl(data.originalImage?.url || image.url);
            setShowUpscaled(true); // Show upscaled by default since it's the gallery image
          } else {
            // If the current image is original, set it as original and get the upscaled version
            setOriginalImageUrl(data.originalImage?.url || image.url);
            setUpscaledImageUrl(data.upscaledImage?.url || null);
            setShowUpscaled(false); // Show original by default
          }
          setHasUpscaledVersion(data.hasUpscaledVersion);
        }
      }
    } catch (error) {
      console.error('Error fetching image versions:', error);
    }
  };

  const handleUpscaleSuccess = (upscaledImageUrl: string) => {
    if (selectedImage) {
      // Set the upscaled image URL
      setUpscaledImageUrl(upscaledImageUrl);
      setHasUpscaledVersion(true);
      setShowUpscaled(true); // Show the upscaled version by default
      
      // Update the selected image to show it's now upscaled
      setSelectedImage({
        ...selectedImage,
        url: upscaledImageUrl,
        isUpscaled: true
      });
    }
    
    // Refresh user credits after upscaling
    fetch('/api/user')
      .then(response => response.json())
      .then(userData => setUserCredits(userData.credits || 0))
      .catch(error => console.error('Error fetching updated credits:', error));
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedImage || selectedCarousel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, selectedCarousel]);

  if (isLoading) {
    return (
      <div className="container px-4 py-6 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gallery</h1>
          <p className="text-gray-600">Your AI-generated images and carousels</p>
        </div>
        
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">Images</TabsTrigger>
            <TabsTrigger value="carousels">Carousels</TabsTrigger>
          </TabsList>
          
          <TabsContent value="events" className="mt-0">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Generated Images</h2>
              <p className="text-gray-600">Your AI-generated event images</p>
            </div>
            
            {/* Loading skeleton */}
            <div className="space-y-4 sm:columns-2 md:columns-3 lg:columns-4 columns-1 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="relative mb-4 break-inside-avoid">
                  <div className="rounded-sm overflow-hidden bg-gray-200 dark:bg-gray-700 animate-pulse">
                    <div className="aspect-square w-full"></div>
                  </div>
                  <div className="absolute px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded-md left-2 top-2 w-16 h-6 animate-pulse"></div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
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
              {totalImageCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="carousels" className="flex items-center gap-2">
            <Layers className="size-4" />
            Generated Carousels
            <span className="px-2 py-0.5 ml-1 bg-gray-200 text-xs text-gray-700 rounded-full font-medium">
              {totalCarouselCount}
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
                    onClick={() => handleImageSelect(image)}
                  >
                    <LazyImage
                      src={image.url}
                      webpSrc={webpUrls.get(image.id)?.primaryUrl}
                      alt={`Generated event ${image.id}`}
                      className="w-full h-auto transition-transform hover:scale-105 object-cover duration-200"
                      priority={images.indexOf(image) < getOptimalBatchSize()} // Priority for first batch
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
                  
                  {/* Upscale indicator icon */}
                  {image.isUpscaled && (
                    <div className="absolute px-2 py-1 bg-purple-600 text-sm text-white rounded-md right-2 top-2">
                      <svg
                        className="inline size-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                      HD
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
              
              {/* Loading indicator with skeleton */}
              {isLoadingMore && (
                <div className="col-span-full">
                  <div className="flex justify-center py-8 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="size-6 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-600">Loading more images...</span>
                    </div>
                  </div>
                  {/* Loading skeleton */}
                  <div className="space-y-4 sm:columns-2 md:columns-3 lg:columns-4 columns-1 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={`skeleton-${index}`} className="relative mb-4 break-inside-avoid">
                        <div className="rounded-sm overflow-hidden bg-gray-200 dark:bg-gray-700 animate-pulse">
                          <div className="aspect-square w-full"></div>
                        </div>
                        <div className="absolute px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded-md left-2 top-2 w-16 h-6 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Move sentinel OUTSIDE the CSS columns container to ensure intersection */}
            </div>
          )}
          {/* Load More Section */}
          <div className="mt-8 text-center">
            {hasMoreImages ? (
              <div className="space-y-4">
                <Button 
                  onClick={loadMoreImages} 
                  disabled={isLoadingMore}
                  variant="outline"
                  className="px-8 py-3"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Images'
                  )}
                </Button>
                <p className="text-sm text-gray-500">
                  Showing {filteredImages.length} of {totalImageCount} images
                </p>
                {/* Hidden sentinel for intersection observer */}
                <div ref={sentinelRef} className="h-4 w-full opacity-0"></div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">
                All images loaded ({filteredImages.length} total)
              </p>
            )}
          </div>
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
                    <LazyImage
                      src={carousel.slideUrls[0] || '/placeholder-carousel.png'} 
                      alt={`Carousel ${carousel.title}`} 
                      className="w-full h-auto transition-transform hover:scale-105 object-cover duration-200"
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
              
              {/* Loading indicator */}
              {isLoadingMore && (
                <div className="col-span-full flex justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <div className="size-6 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600">Loading more carousels...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed flex bg-black/80 inset-0 z-50">
          {/* Main Image Area */}
          <div className="relative flex flex-1 overflow-auto">
            {/* Fixed UI Controls */}
            <div className="absolute inset-0 pointer-events-none z-50">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute bg-black/50 text-white hover:bg-black/70 right-2 top-2 pointer-events-auto"
                onClick={() => {
                  setSelectedImage(null);
                  setOriginalImageUrl(null);
                  setUpscaledImageUrl(null);
                  setShowUpscaled(false);
                  setHasUpscaledVersion(false);
                }}
              >
                <X className="size-6" />
              </Button>

              {/* Zoom Controls */}
              <div className="absolute left-2 top-2 flex gap-2 pointer-events-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 text-white hover:bg-black/70"
                  onClick={zoomIn}
                >
                  <ZoomIn className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 text-white hover:bg-black/70"
                  onClick={zoomOut}
                >
                  <ZoomOut className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 text-white hover:bg-black/70"
                  onClick={resetZoom}
                >
                  <RotateCcw className="size-4" />
                </Button>
              </div>

              {/* Zoom Level Display */}
              <div className="absolute left-2 bottom-2 bg-black/50 text-white px-2 py-1 rounded text-sm pointer-events-none">
                {Math.round(zoom * 100)}%
              </div>
            </div>

            {/* Scrollable Image Container */}
            

            <div 
              className="w-full h-full overflow-auto p-4"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
            >
              <div
                className="flex items-start justify-center min-w-full min-h-full"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transformOrigin: 'top center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              >
                {/* Show before/after slider if we have both original and upscaled images */}
                {hasUpscaledVersion && originalImageUrl && upscaledImageUrl ? (
                  <BeforeAfterSlider
                    beforeImage={originalImageUrl}
                    afterImage={upscaledImageUrl}
                    alt="Before and after upscaling"
                    className="max-w-none max-h-none object-contain"
                  />
                ) : (
                  <WebPImage
                    src={showUpscaled && upscaledImageUrl ? upscaledImageUrl : selectedImage.url}
                    webpSrc={webpUrls.get(selectedImage.id)?.primaryUrl}
                    alt="Full size"
                    className="max-w-none max-h-none object-contain"
                  />
                )}
              </div>
            </div>
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

              {/* Version Toggle Section */}
              {hasUpscaledVersion && (
                <div className="pt-4">
                  <h3 className="mb-2 font-semibold">Image Version</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {showUpscaled ? 'Upscaled' : 'Original'}
                    </span>
                    <button
                      onClick={() => setShowUpscaled(!showUpscaled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                        showUpscaled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showUpscaled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

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
                {/* Only show upscale button for images the user owns */}
                {selectedImage.userId && session?.user?.id && selectedImage.userId === session.user.id && (
                  <UpscaleButton
                    imageId={selectedImage.id}
                    onUpscaleSuccess={handleUpscaleSuccess}
                    userCredits={userCredits}
                    variant="outline"
                    size="default"
                    className="w-full"
                  />
                )}
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleDownload(showUpscaled && upscaledImageUrl ? upscaledImageUrl : selectedImage.url)}
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
                    setOriginalImageUrl(null);
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