"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

if (!process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY) {
  throw new Error('Missing IDEOGRAM_API_KEY environment variable');
}

interface ImageEditorModalProps {
  imageUrl: string;
  onClose: () => void;
  onEdit: (editedImageUrl: string) => void;
}

export function ImageEditorModal({ imageUrl, onClose, onEdit }: ImageEditorModalProps) {
  // Check API key availability immediately
  const apiKey = process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY;
  console.log('=== IMAGE EDITOR MODAL ===');
  console.log('API Key available:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  
  if (!apiKey) {
    console.error('❌ IDEogram API key is missing! Please add NEXT_PUBLIC_IDEOGRAM_API_KEY to your .env.local file');
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [drawingCtx, setDrawingCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [imageLoading, setImageLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  console.log("ImageEditorModal opened with imageUrl:", imageUrl);

  // Function to get canvas coordinates accounting for zoom and pan
  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas ref not found");
      return { x: 0, y: 0 };
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;
    
    console.log('getCanvasCoordinates:', { clientX, clientY, rectLeft: rect.left, rectTop: rect.top, pan, zoom, result: { x, y } });
    
    return { x, y };
  };

  // Function to apply zoom and pan transformations
  const applyTransformations = () => {
    if (!ctx) return;
    
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
  };

  // Function to restore transformations
  const restoreTransformations = () => {
    if (!ctx) return;
    ctx.restore();
  };

  // Function to redraw the canvas with current zoom and pan
  const redrawCanvas = () => {
    if (!ctx || !originalImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    applyTransformations();
    ctx.drawImage(originalImage, 0, 0, canvas.width / zoom, canvas.height / zoom);
    restoreTransformations();
    
    // Also clear the drawing canvas to keep it synchronized
    if (drawingCtx && drawingCanvasRef.current) {
      drawingCtx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    }
  };

  // Zoom functions
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

  // Pan functions
  const startPan = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only pan on middle mouse or Ctrl+Left click
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      console.log('Starting pan');
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const panCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPanning) return;
    
    const deltaX = e.clientX - lastPanPoint.x;
    const deltaY = e.clientY - lastPanPoint.y;
    
    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  };

  const stopPan = () => {
    if (isPanning) {
      console.log('Stopping pan');
    }
    setIsPanning(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));
    
    // Calculate new pan to zoom towards mouse position
    const zoomRatio = newZoom / zoom;
    const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
    const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas not found");
      return;
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      console.log("Canvas context not found");
      return;
    }

    // Check drawing canvas ref
    const drawingCanvas = drawingCanvasRef.current;
    console.log("Initial setup - Image canvas found:", !!canvas);
    console.log("Initial setup - Image context created:", !!context);
    console.log("Initial setup - Drawing canvas found:", !!drawingCanvas);
    
    if (drawingCanvas) {
      const drawingContext = drawingCanvas.getContext("2d", { willReadFrequently: true });
      console.log("Initial setup - Drawing context created:", !!drawingContext);
    }

    console.log("Loading image:", imageUrl);
    setImageLoading(true);

    // Function to load image through proxy to avoid CORS issues
    const loadImageThroughProxy = async () => {
      try {
        console.log("Fetching image through proxy to avoid CORS...");
        
        // Fetch the image through our server to avoid CORS
        const response = await fetch('/api/proxy-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        console.log("Image fetched successfully, creating blob URL:", blobUrl);
        
        const img = new Image();
        img.onload = () => {
          console.log("Image loaded successfully from blob:", img.width, "x", img.height);
          setImageLoading(false);
          
          // Set canvas size to match the container while maintaining aspect ratio
          const container = canvas.parentElement;
          console.log("Container found:", !!container);
          if (container) {
            const containerRect = container.getBoundingClientRect();
            console.log("Container rect:", containerRect);
            // Use 95% of available space to make image much bigger
            const maxWidth = containerRect.width * 0.95;
            const maxHeight = containerRect.height * 0.95;
            
            // Calculate aspect ratio
            const aspectRatio = img.width / img.height;
            
            let canvasWidth, canvasHeight;
            
            if (maxWidth / aspectRatio <= maxHeight) {
              // Width is the limiting factor
              canvasWidth = maxWidth;
              canvasHeight = maxWidth / aspectRatio;
            } else {
              // Height is the limiting factor
              canvasHeight = maxHeight;
              canvasWidth = maxHeight * aspectRatio;
            }
            
            // Ensure minimum size but make it much larger
            const minSize = 600; // Increased from 300 to 600
            const maxSize = Math.min(maxWidth, maxHeight);
            if (canvasWidth < minSize || canvasHeight < minSize) {
              if (aspectRatio > 1) {
                canvasWidth = minSize;
                canvasHeight = minSize / aspectRatio;
              } else {
                canvasHeight = minSize;
                canvasWidth = minSize * aspectRatio;
              }
            }
            
            // Ensure we don't exceed container bounds
            if (canvasWidth > maxSize) {
              canvasWidth = maxSize;
              canvasHeight = maxSize / aspectRatio;
            }
            if (canvasHeight > maxSize) {
              canvasHeight = maxSize;
              canvasWidth = maxSize * aspectRatio;
            }
            
            console.log("Calculated canvas size:", canvasWidth, "x", canvasHeight);
            
            // Set up both canvases
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            console.log("Image canvas set to:", canvas.width, "x", canvas.height);
            
            // Set up drawing canvas with exact same size and position
            const drawingCanvas = drawingCanvasRef.current;
            console.log("Drawing canvas ref found:", !!drawingCanvas);
            if (drawingCanvas) {
              drawingCanvas.width = canvasWidth;
              drawingCanvas.height = canvasHeight;
              console.log("Drawing canvas set to:", drawingCanvas.width, "x", drawingCanvas.height);
              const drawingContext = drawingCanvas.getContext("2d", { willReadFrequently: true });
              console.log("Drawing context created:", !!drawingContext);
              if (drawingContext) {
                // Clear the drawing canvas
                drawingContext.clearRect(0, 0, canvasWidth, canvasHeight);
                setDrawingCtx(drawingContext);
                console.log("Drawing canvas context set up with size:", canvasWidth, "x", canvasHeight);
              } else {
                console.error("Failed to create drawing context!");
              }
            } else {
              console.error("Drawing canvas ref not found!");
            }
            
            // Draw the image to fill the canvas
            context.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            setCtx(context);
            setOriginalImage(img);
            
            console.log("Canvas sized to:", canvasWidth, "x", canvasHeight);
            
            // Clean up blob URL
            URL.revokeObjectURL(blobUrl);
          } else {
            console.log("Container not found, using fallback sizing");
            // Fallback to original image size
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Set up drawing canvas with same size
            const drawingCanvas = drawingCanvasRef.current;
            if (drawingCanvas) {
              drawingCanvas.width = img.width;
              drawingCanvas.height = img.height;
              const drawingContext = drawingCanvas.getContext("2d", { willReadFrequently: true });
              if (drawingContext) {
                // Clear the drawing canvas
                drawingContext.clearRect(0, 0, img.width, img.height);
                setDrawingCtx(drawingContext);
                console.log("Drawing canvas context set up (fallback) with size:", img.width, "x", img.height);
              } else {
                console.error("Failed to create drawing context in fallback!");
              }
            } else {
              console.error("Drawing canvas ref not found in fallback!");
            }
            
            context.drawImage(img, 0, 0);
            setCtx(context);
            setOriginalImage(img);
            
            // Clean up blob URL
            URL.revokeObjectURL(blobUrl);
          }
        };

        img.onerror = (e) => {
          console.error("Error loading image from blob:", e);
          setImageLoading(false);
        };

        img.src = blobUrl;
        
      } catch (error) {
        console.error("Error fetching image through proxy:", error);
        setImageLoading(false);
        
        // Fallback to direct loading (will likely fail due to CORS, but worth trying)
        console.log("Trying direct image loading as fallback...");
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
          console.log("Direct image loading succeeded (unexpected)");
          setImageLoading(false);
          // ... same canvas setup logic as above
        };
        
        img.onerror = (e) => {
          console.error("Direct image loading also failed:", e);
          setImageLoading(false);
        };
        
        img.src = imageUrl;
      }
    };

    // Start loading the image
    loadImageThroughProxy();
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (imageLoading) {
        console.log("Image loading timed out, showing fallback");
        setImageLoading(false);
      }
    }, 10000); // 10 second timeout
    
    return () => {
      clearTimeout(timeout);
    };
  }, [imageUrl]);

  // Redraw canvas when zoom or pan changes
  useEffect(() => {
    redrawCanvas();
  }, [zoom, pan]);

  // Monitor canvas context state changes
  useEffect(() => {
    console.log("Canvas context state changed:", {
      hasCtx: !!ctx,
      hasDrawingCtx: !!drawingCtx,
      hasOriginalImage: !!originalImage,
      imageLoading
    });
  }, [ctx, drawingCtx, originalImage, imageLoading]);

  const createMask = async () => {
    const canvas = canvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    if (!canvas || !drawingCanvas || !drawingCtx || !originalImage) return null;

    console.log('Creating mask from drawing canvas...');
    console.log('Original image dimensions:', originalImage.width, 'x', originalImage.height);
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    console.log('Drawing canvas dimensions:', drawingCanvas.width, 'x', drawingCanvas.height);

    // Create a mask canvas with the SAME dimensions as the original image
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = originalImage.width;  // Use original image width
    maskCanvas.height = originalImage.height; // Use original image height
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });

    if (!maskCtx) return null;

    // Fill the mask with white (areas to preserve)
    maskCtx.fillStyle = 'white';
    maskCtx.fillRect(0, 0, originalImage.width, originalImage.height);

    // Scale the drawing canvas to match the original image dimensions
    // Calculate the scale factors
    const scaleX = originalImage.width / drawingCanvas.width;
    const scaleY = originalImage.height / drawingCanvas.height;
    
    console.log('Scale factors:', { scaleX, scaleY });

    // Copy the drawing canvas to the mask with proper scaling
    maskCtx.globalCompositeOperation = 'destination-out';
    maskCtx.drawImage(
      drawingCanvas, 
      0, 0, drawingCanvas.width, drawingCanvas.height,  // Source rectangle
      0, 0, originalImage.width, originalImage.height   // Destination rectangle (scaled)
    );
    maskCtx.globalCompositeOperation = 'source-over';

    // Invert the mask so drawn areas are black (to edit) and white areas are preserved
    const imageData = maskCtx.getImageData(0, 0, originalImage.width, originalImage.height);
    const data = imageData.data;
    
    let hasDrawn = false;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 255) { // If pixel is not fully opaque white
        data[i] = 0;     // R = 0 (black)
        data[i + 1] = 0; // G = 0 (black)
        data[i + 2] = 0; // B = 0 (black)
        data[i + 3] = 255; // A = 255 (opaque)
        hasDrawn = true;
      } else {
        data[i] = 255;     // R = 255 (white)
        data[i + 1] = 255; // G = 255 (white)
        data[i + 2] = 255; // B = 255 (white)
        data[i + 3] = 255; // A = 255 (opaque)
      }
    }

    if (!hasDrawn) {
      console.log('No drawing detected');
      return null;
    }

    maskCtx.putImageData(imageData, 0, 0);
    console.log('Mask created successfully with dimensions:', originalImage.width, 'x', originalImage.height);

    return new Promise<Blob | null>((resolve) => {
      maskCanvas.toBlob((blob) => {
        console.log('Mask blob created, size:', blob?.size);
        resolve(blob);
      }, 'image/png');
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('=== START DRAWING ===');
    console.log('Event:', { button: e.button, ctrlKey: e.ctrlKey, clientX: e.clientX, clientY: e.clientY });
    console.log('State:', { hasCtx: !!ctx, hasDrawingCtx: !!drawingCtx, hasCanvas: !!canvasRef.current, isDrawing, brushSize, zoom });
    
    // Only draw on left click without Ctrl key
    if (e.button !== 0 || e.ctrlKey) {
      console.log('Drawing blocked - wrong button or Ctrl pressed');
      return;
    }
    
    if (!drawingCtx || !drawingCanvasRef.current) {
      console.log('Drawing blocked - no drawing context or canvas');
      return;
    }
    
    console.log('Starting drawing...');
    setIsDrawing(true);
    
    // Use the drawing canvas for coordinate calculation
    const drawingCanvas = drawingCanvasRef.current;
    const rect = drawingCanvas.getBoundingClientRect();
    
    // Calculate coordinates relative to the drawing canvas, accounting for zoom and pan
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    console.log('Drawing canvas coordinates:', { 
      x, y, 
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      canvasSize: { width: drawingCanvas.width, height: drawingCanvas.height },
      pan, zoom 
    });
    
    // Draw a simple dot to test if drawing is working
    drawingCtx.fillStyle = 'red';
    drawingCtx.fillRect(x - 2, y - 2, 4, 4);
    
    // Start drawing path on the drawing canvas
    drawingCtx.beginPath();
    drawingCtx.lineWidth = brushSize;
    drawingCtx.lineCap = "round";
    drawingCtx.strokeStyle = "rgba(255, 0, 0, 0.8)"; // More visible red
    drawingCtx.moveTo(x, y);
    
    console.log('Drawing started successfully');
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingCtx || !drawingCanvasRef.current) {
      return;
    }
    
    // Use the drawing canvas for coordinate calculation
    const drawingCanvas = drawingCanvasRef.current;
    const rect = drawingCanvas.getBoundingClientRect();
    
    // Calculate coordinates relative to the drawing canvas, accounting for zoom and pan
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    // Continue drawing path on the drawing canvas
    drawingCtx.lineTo(x, y);
    drawingCtx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && drawingCtx) {
      console.log('Stopping drawing');
      drawingCtx.closePath();
    }
    setIsDrawing(false);
  };

  const handleEdit = async () => {
    console.log('=== HANDLE EDIT START ===');
    
    // Get the prompt from the textarea
    const editPrompt = prompt.trim();
    
    if (!editPrompt) {
      alert('Please enter a prompt describing the desired changes.');
      return;
    }

    console.log('Creating mask...');
    const maskBlob = await createMask();
    if (!maskBlob) {
      alert('Please draw on the area you want to edit.');
      return;
    }
    console.log('Mask created successfully, size:', maskBlob.size);

    try {
      console.log('Fetching original image from:', imageUrl);
      
      // Use the same proxy approach to avoid CORS issues
      const imageResponse = await fetch('/api/proxy-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });
      
      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error('Proxy API error:', errorText);
        throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
      }
      const imageBlob = await imageResponse.blob();
      console.log('Original image fetched, size:', imageBlob.size);

      if (!(maskBlob instanceof Blob) || !(imageBlob instanceof Blob)) {
        throw new Error('Invalid Blob type');
      }

      // Check API key
      const apiKey = process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY;
      if (!apiKey) {
        throw new Error('Ideogram API key is not configured');
      }
      console.log('API key found, length:', apiKey.length);

      // Create FormData for Ideogram 3.0 edit API
      const formData = new FormData();
      formData.append('image', imageBlob, 'original.png');
      formData.append('mask', maskBlob, 'mask.png');
      formData.append('prompt', editPrompt);

      console.log('Sending edit request to Ideogram 3.0 with prompt:', editPrompt);
      console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => `${key}: ${value instanceof Blob ? `Blob(${value.size} bytes)` : value}`));

      const response = await fetch("https://api.ideogram.ai/v1/ideogram-v3/edit", {
        method: "POST",
        headers: {
          "Api-Key": apiKey
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Edit Response:', data);

      if (data.data && data.data[0]?.url) {
        console.log('Success! Edited image URL:', data.data[0].url);
        const editedImage = new Image();
        editedImage.crossOrigin = "anonymous";
        editedImage.src = data.data[0].url;
        
        editedImage.onload = () => {
          console.log('Edited image loaded successfully');
          const canvas = canvasRef.current;
          if (!canvas || !ctx) return;

          canvas.width = editedImage.width;
          canvas.height = editedImage.height;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(editedImage, 0, 0);
          
          setOriginalImage(editedImage);
          setZoom(1);
          setPan({ x: 0, y: 0 });
          onEdit(data.data[0].url);
        };
        
        editedImage.onerror = (e) => {
          console.error('Error loading edited image:', e);
          alert('Failed to load edited image. Please try again.');
        };
      } else {
        console.error('No image URL in response:', data);
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error("Error editing image:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('NetworkError')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Failed to connect to the image editing service. Please try again.';
      } else if (error.message.includes('API key')) {
        errorMessage = 'API key configuration error. Please contact support.';
      }
      
      alert(`Failed to edit image: ${errorMessage}. Please try again.`);
    }
  };

  // Add useEffect to handle body scrolling and window resize
  useEffect(() => {
    // Disable scrolling on the main body when modal is open
    document.body.style.overflow = 'hidden';
    
    // Handle window resize to update canvas size
    const handleResize = () => {
      if (originalImage && canvasRef.current && ctx) {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          // Use 90% of available space to ensure it fits with some padding
          const maxWidth = containerRect.width * 0.9;
          const maxHeight = containerRect.height * 0.9;
          
          const aspectRatio = originalImage.width / originalImage.height;
          
          let canvasWidth, canvasHeight;
          
          if (maxWidth / aspectRatio <= maxHeight) {
            canvasWidth = maxWidth;
            canvasHeight = maxWidth / aspectRatio;
          } else {
            canvasHeight = maxHeight;
            canvasWidth = maxHeight * aspectRatio;
          }
          
          // Ensure minimum size but not too large
          const minSize = 300;
          const maxSize = Math.min(maxWidth, maxHeight);
          if (canvasWidth < minSize || canvasHeight < minSize) {
            if (aspectRatio > 1) {
              canvasWidth = minSize;
              canvasHeight = minSize / aspectRatio;
            } else {
              canvasHeight = minSize;
              canvasWidth = minSize * aspectRatio;
            }
          }
          
          // Ensure we don't exceed container bounds
          if (canvasWidth > maxSize) {
            canvasWidth = maxSize;
            canvasHeight = maxSize / aspectRatio;
          }
          if (canvasHeight > maxSize) {
            canvasHeight = maxSize;
            canvasWidth = maxSize * aspectRatio;
          }
          
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          
          redrawCanvas();
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Re-enable scrolling when modal is closed
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('resize', handleResize);
    };
  }, [originalImage, ctx]);

  // Add clearCanvas function
  const clearCanvas = () => {
    if (!ctx || !originalImage || !canvasRef.current) return;
    
    // Clear the drawing canvas
    if (drawingCtx && drawingCanvasRef.current) {
      drawingCtx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
      console.log('Drawing canvas cleared');
    }
    
    // Reset image canvas to original image
    redrawCanvas();
  };

  // Clear only the drawing canvas
  const clearDrawingOnly = () => {
    if (drawingCtx && drawingCanvasRef.current) {
      const drawingCanvas = drawingCanvasRef.current;
      drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      console.log('Drawing canvas cleared only');
      alert('Drawing canvas cleared! You can now draw again.');
    } else {
      console.log('Cannot clear drawing - no drawing context');
      alert('Cannot clear drawing - drawing canvas not ready. Please wait for image to load.');
    }
  };

  // Test drawing function for debugging
  const testDrawing = () => {
    console.log('=== TEST DRAWING ===');
    console.log('Canvas ref:', !!canvasRef.current);
    console.log('Drawing canvas ref:', !!drawingCanvasRef.current);
    console.log('Context:', !!ctx);
    console.log('Drawing context:', !!drawingCtx);
    console.log('Original image:', !!originalImage);
    console.log('Current zoom:', zoom);
    console.log('Current pan:', pan);
    
    if (!drawingCtx || !drawingCanvasRef.current) {
      console.log('Cannot test drawing - no drawing context or canvas');
      alert('Drawing canvas not ready. Please wait for image to load.');
      return;
    }
    
    // Log canvas dimensions
    const imageCanvas = canvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    console.log('Image canvas dimensions:', {
      width: imageCanvas?.width,
      height: imageCanvas?.height,
      styleWidth: imageCanvas?.style.width,
      styleHeight: imageCanvas?.style.height,
      offsetWidth: imageCanvas?.offsetWidth,
      offsetHeight: imageCanvas?.offsetHeight
    });
    console.log('Drawing canvas dimensions:', {
      width: drawingCanvas?.width,
      height: drawingCanvas?.height,
      styleWidth: drawingCanvas?.style.width,
      styleHeight: drawingCanvas?.style.height,
      offsetWidth: drawingCanvas?.offsetWidth,
      offsetHeight: drawingCanvas?.offsetHeight
    });
    
    console.log('Testing drawing functionality...');
    
    // Clear the drawing canvas first
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    
    // Draw a large, very visible red square in the center
    const centerX = drawingCanvas.width / 2;
    const centerY = drawingCanvas.height / 2;
    const size = Math.min(drawingCanvas.width, drawingCanvas.height) * 0.2; // 20% of smaller dimension
    
    drawingCtx.fillStyle = 'red';
    drawingCtx.fillRect(centerX - size/2, centerY - size/2, size, size);
    
    // Draw a blue border around it
    drawingCtx.strokeStyle = 'blue';
    drawingCtx.lineWidth = 5;
    drawingCtx.strokeRect(centerX - size/2, centerY - size/2, size, size);
    
    // Draw a large green circle
    drawingCtx.beginPath();
    drawingCtx.arc(centerX + size, centerY, size/2, 0, 2 * Math.PI);
    drawingCtx.fillStyle = 'green';
    drawingCtx.fill();
    
    // Draw some text
    drawingCtx.fillStyle = 'black';
    drawingCtx.font = '20px Arial';
    drawingCtx.textAlign = 'center';
    drawingCtx.fillText('TEST DRAWING', centerX, centerY + size + 30);
    
    console.log('Test drawing completed! You should see red square, blue border, green circle, and text.');
    alert('Test drawing completed! Check the canvas for red square, blue border, green circle, and text. If you can see these shapes, drawing is working correctly.');
  };

  return (
    <div className="fixed bg-black/80 inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen p-4 items-center justify-center">
        <div className="relative w-full h-[90vh] max-w-[95vw] p-4 my-4 bg-background rounded-lg">
          <div className="flex h-full items-start justify-between gap-4">
            {/* Left side - Image */}
            <div className="flex-1 h-full min-w-0">
              <div className="relative h-full bg-gray-100 rounded-lg dark:bg-gray-800 overflow-auto border">
                {/* Zoom Controls - Repositioned to be closer to image content */}
                <div className="absolute flex left-2 top-2 z-10 gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={zoomIn}
                    className="size-8 p-0 bg-white/90 hover:bg-white"
                  >
                    <ZoomIn className="size-3" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={zoomOut}
                    className="size-8 p-0 bg-white/90 hover:bg-white"
                  >
                    <ZoomOut className="size-3" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={resetZoom}
                    className="size-8 p-0 bg-white/90 hover:bg-white"
                  >
                    <RotateCcw className="size-3" />
                  </Button>
                </div>

                {/* Zoom Level Display - Repositioned */}
                <div className="absolute px-2 py-1 bg-white/90 text-xs rounded right-2 top-2 z-10 font-medium">
                  {Math.round(zoom * 100)}%
                </div>

                <div className="relative flex h-full p-2 items-center justify-center">
                  {/* Image canvas (background) */}
                  <canvas
                    ref={canvasRef}
                    className="absolute border-gray-300 dark:border-gray-600 left-0 top-0 border"
                    style={{ 
                      maxHeight: 'calc(100vh - 100px)', 
                      maxWidth: 'calc(100vw - 300px)',
                      objectFit: 'contain',
                      zIndex: 1
                    }}
                  />
                  
                  {/* Drawing canvas (foreground) */}
                  <canvas
                    ref={drawingCanvasRef}
                    onMouseDown={(e) => {
                      console.log('=== MOUSE DOWN ===');
                      console.log('Button:', e.button, 'Ctrl:', e.ctrlKey, 'Position:', e.clientX, e.clientY);
                      
                      // Handle panning (middle mouse or Ctrl+Left)
                      if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
                        console.log('Starting pan');
                        startPan(e);
                      } 
                      // Handle drawing (left click without Ctrl)
                      else if (e.button === 0 && !e.ctrlKey) {
                        console.log('Starting draw');
                        startDrawing(e);
                      }
                    }}
                    onMouseMove={(e) => {
                      // Handle drawing during mouse move
                      if (isDrawing) {
                        draw(e);
                      }
                      // Handle panning during mouse move
                      if (isPanning) {
                        panCanvas(e);
                      }
                    }}
                    onMouseUp={(e) => {
                      console.log('=== MOUSE UP ===');
                      console.log('Button:', e.button, 'Ctrl:', e.ctrlKey);
                      
                      // Stop both drawing and panning
                      stopDrawing();
                      stopPan();
                    }}
                    onMouseLeave={() => {
                      console.log('=== MOUSE LEAVE ===');
                      // Stop both drawing and panning when mouse leaves canvas
                      stopDrawing();
                      stopPan();
                    }}
                    onWheel={handleWheel}
                    className={`absolute left-0 top-0 border border-gray-300 dark:border-gray-600 ${
                      isDrawing ? 'cursor-crosshair' : isPanning ? 'cursor-grab' : 'cursor-default'
                    }`}
                    style={{ 
                      maxHeight: 'calc(100vh - 100px)', 
                      maxWidth: 'calc(100vw - 300px)',
                      objectFit: 'contain',
                      backgroundColor: isDrawing ? 'rgba(255, 0, 0, 0.1)' : 'transparent',
                      zIndex: 2,
                      pointerEvents: 'auto'
                    }}
                  />
                  
                  {/* Drawing indicator */}
                  {isDrawing && (
                    <div className="absolute px-2 py-1 bg-red-500 text-xs text-white rounded left-4 top-4 z-20 font-medium">
                      Drawing Mode Active
                    </div>
                  )}
                  
                  {/* Canvas status indicator */}
                  <div className="absolute px-2 py-1 bg-black/70 text-xs text-white rounded bottom-4 left-4 z-20 font-medium">
                    Canvas: {ctx ? 'Ready' : 'Loading...'} | Drawing: {drawingCtx ? 'Ready' : 'Loading...'} | Zoom: {Math.round(zoom * 100)}%
                  </div>
                </div>
                {/* Loading state */}
                {imageLoading && (
                  <div className="flex h-full p-8 items-center justify-center">
                    <div className="text-center">
                      <div className="size-12 mx-auto mb-4 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-500">Loading image...</p>
                    </div>
                  </div>
                )}
                
                {/* Fallback image display */}
                {!ctx && !imageLoading && (
                  <div className="flex h-full p-8 items-center justify-center">
                    <div className="text-center">
                      <img 
                        src={imageUrl} 
                        alt="Original image" 
                        className="max-w-full max-h-full rounded-lg shadow-lg object-contain"
                        onError={(e) => {
                          console.error("Fallback image also failed to load");
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <p className="mt-4 text-sm text-gray-500">
                        Canvas failed to load. You can see the image but cannot edit it.
                      </p>
                      <Button 
                        onClick={() => window.location.reload()} 
                        className="mt-4"
                        variant="outline"
                      >
                        Retry Loading
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Controls */}
            <div className="flex flex-col w-72 h-full">
              <div className="flex py-2 mb-4 bg-background items-center justify-between">
                <h2 className="text-xl font-semibold">Edit Image</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="size-4" />
                </Button>
              </div>

              <div className="flex-1 pr-2 space-y-4 overflow-y-auto">
                {/* Instructions */}
                <div className="p-3 bg-blue-50 rounded-lg dark:bg-blue-950">
                  <h4 className="mb-2 text-sm font-medium">How to Edit:</h4>
                  <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                    <li>• <strong>Left click + drag</strong> to draw on areas you want to edit</li>
                    <li>• <strong>Ctrl + left click + drag</strong> to pan the image</li>
                    <li>• <strong>Mouse wheel</strong> to zoom in/out</li>
                    <li>• <strong>Clear Drawing</strong> to start over</li>
                    <li>• <strong>Test Drawing</strong> to verify canvas works</li>
                  </ul>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    <strong>Tip:</strong> If drawing doesn't work, try the &ldquo;Test Drawing&rdquo; button first! Check the console for debugging info.
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-sm">Brush Size: {brushSize}px</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-32"
                  />
                </div>

                <Button 
                  variant="outline" 
                  onClick={clearCanvas}
                  className="w-full"
                >
                  Clear Drawing
                </Button>

                {/* Debug test button */}
                <Button 
                  variant="outline" 
                  onClick={testDrawing}
                  className="w-full text-xs"
                >
                  Test Drawing (Debug)
                </Button>

                {/* Clear drawing only button */}
                <Button 
                  variant="outline" 
                  onClick={clearDrawingOnly}
                  className="w-full text-xs"
                >
                  Clear Drawing Only (Debug)
                </Button>

                <div className="space-y-2">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full min-h-[100px] p-2 rounded-md border"
                    placeholder="Describe the changes you want to make..."
                  />
                </div>

                <div className="flex flex-col pb-4 gap-2">
                  <Button onClick={handleEdit}>
                    Apply Edit
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}