"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";
import { useToast } from "@/components/ui/use-toast";

interface SavedPrompt {
  id: string;
  text: string;
  createdAt: string;
}

export function MasterPromptBox() {
  const [prompt, setPrompt] = useState("");
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved prompts from localStorage on mount only
  useEffect(() => {
    if (mounted) {
      const stored = localStorage.getItem("masterPrompts");
      if (stored) {
        try {
          const parsedPrompts = JSON.parse(stored);
          setSavedPrompts(parsedPrompts);
        } catch (error) {
          console.error("Error parsing stored prompts:", error);
        }
      }
    }
  }, [mounted]);

  // Save to localStorage whenever savedPrompts changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("masterPrompts", JSON.stringify(savedPrompts));
    }
  }, [savedPrompts, mounted]);

  const handleSavePrompt = async () => {
    if (!prompt.trim()) return;

    const newPrompt: SavedPrompt = {
      id: crypto.randomUUID(),
      text: prompt.trim(),
      createdAt: new Date().toISOString(),
    };

    setSavedPrompts(prevPrompts => [newPrompt, ...prevPrompts]);
    setPrompt("");
    
    toast({
      title: "Prompt Saved",
      description: "Your master prompt has been saved successfully.",
    });
  };

  const handleDeletePrompt = (id: string) => {
    setSavedPrompts(prevPrompts => prevPrompts.filter(p => p.id !== id));
    
    toast({
      title: "Prompt Deleted",
      description: "The master prompt has been removed.",
      variant: "destructive",
    });
  };

  // Only render the component content when mounted
  if (!mounted) {
    return null;
  }

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold">Master Prompt Box</h2>
      <div className="mt-4">
        <Textarea
          placeholder="Enter master prompt template..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
        />
        <Button
          onClick={handleSavePrompt}
          className="w-full mt-4 bg-purple-600 text-black rounded-md transition-colors hover:bg-purple-700 dark:bg-purple-600 dark:text-black dark:hover:bg-purple-700 font-medium"
          variant="default"
        >
          Save Prompt Template
        </Button>
      </div>

      {savedPrompts.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-4 text-lg font-semibold">
            Saved Prompts ({savedPrompts.length})
          </h3>
          <div className="space-y-4">
            {savedPrompts.map((savedPrompt) => (
              <div
                key={savedPrompt.id}
                className="flex p-4 rounded-lg items-center justify-between border"
              >
                <div>
                  <p>{savedPrompt.text}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(savedPrompt.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePrompt(savedPrompt.id)}
                >
                  <Icons.trash className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
} 