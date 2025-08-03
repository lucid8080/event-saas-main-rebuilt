"use client";

import { useState, useTransition, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { Icons } from "@/components/shared/icons";
import { UserAvatar } from "@/components/shared/user-avatar";
import { updateUserImage } from "@/actions/update-user-image";
import { Upload, X } from "lucide-react";

interface UserImageFormProps {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export function UserImageForm({ user }: UserImageFormProps) {
  const { update } = useSession();
  const [updated, setUpdated] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState(user.image || "");
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkUpdate = (value: string) => {
    setUpdated(user.image !== value);
    setImageUrl(value);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setUpdated(true);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUpdated(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFileToServer = async (file: File): Promise<string> => {
    // For now, we'll convert the file to a data URL
    // In a production app, you'd want to use a proper file upload service like AWS S3, Cloudinary, etc.
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        let finalImageUrl = imageUrl;

        if (uploadMode === 'file' && selectedFile) {
          // Upload file and get URL
          finalImageUrl = await uploadFileToServer(selectedFile);
        }

        // Update user's profile image
        const result = await updateUserImage({ imageUrl: finalImageUrl });
        
        if (result.status === "success") {
          await update(); // Update session
          setUpdated(false);
          setSelectedFile(null);
          setPreviewUrl(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          toast.success("Your profile image has been updated.");
        } else {
          throw new Error(result.message || "Failed to update profile image");
        }
      } catch (error) {
        console.error("Error updating profile image:", error);
        toast.error("Something went wrong.", {
          description: error instanceof Error ? error.message : "Your profile image was not updated. Please try again.",
        });
      }
    });
  };

  const currentImageUrl = uploadMode === 'file' && previewUrl ? previewUrl : imageUrl;

  return (
    <form onSubmit={handleSubmit}>
      <SectionColumns
        title="Profile Image"
        description="Update your profile image by uploading a file or entering an image URL."
      >
        <div className="flex w-full items-center gap-4">
          <div className="flex items-center gap-4">
            <UserAvatar user={{ name: user.name, image: currentImageUrl }} className="size-12" />
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={uploadMode === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadMode('url')}
                >
                  URL
                </Button>
                <Button
                  type="button"
                  variant={uploadMode === 'file' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadMode('file')}
                >
                  Upload
                </Button>
              </div>
              
              {uploadMode === 'url' ? (
                <div className="flex flex-col gap-2">
                  <Label className="sr-only" htmlFor="image">
                    Profile Image URL
                  </Label>
                  <Input
                    id="image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => checkUpdate(e.target.value)}
                    className="flex-1"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label className="sr-only" htmlFor="file">
                    Profile Image File
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    {selectedFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFile}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <Button
            type="submit"
            variant={updated ? "default" : "secondary"}
            disabled={isPending || !updated}
            className="w-[67px] px-0 sm:w-[130px] shrink-0"
          >
            {isPending ? (
              <Icons.spinner className="size-4 animate-spin" />
            ) : (
              <p>
                Save
                <span className="hidden sm:inline-flex">&nbsp;Changes</span>
              </p>
            )}
          </Button>
        </div>
        <div className="flex flex-col p-1 justify-between">
          <p className="text-[13px] text-muted-foreground">
            {uploadMode === 'url' 
              ? "Enter a valid image URL (JPG, PNG, GIF)" 
              : "Upload an image file (JPG, PNG, GIF, max 5MB). Images are stored as data URLs."
            }
          </p>
        </div>
      </SectionColumns>
    </form>
  );
} 