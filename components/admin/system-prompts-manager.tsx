'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  History, 
  Copy,
  CheckCircle,
  AlertCircle,
  Settings,
  FileText,
  Palette,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { IdeogramRecommendations } from './ideogram-recommendations';
import { PROMPT_CATEGORIES, SystemPromptData } from '@/lib/system-prompts';

interface SystemPromptsManagerProps {
  className?: string;
}

export function SystemPromptsManager({ className }: SystemPromptsManagerProps) {
  const [prompts, setPrompts] = useState<SystemPromptData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('event_type');
  const [selectedPrompt, setSelectedPrompt] = useState<SystemPromptData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Form state for creating/editing prompts
  const [formData, setFormData] = useState({
    category: 'event_type',
    subcategory: '',
    name: '',
    description: '',
    content: '',
    isActive: true
  });

  useEffect(() => {
    fetchPrompts();
  }, [selectedCategory]);

  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/system-prompts?category=${selectedCategory}&isActive=true`);
      if (response.ok) {
        const data = await response.json();
        setPrompts(data.prompts || []);
      } else {
        toast.error('Failed to fetch prompts');
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error('Failed to fetch prompts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePrompt = () => {
    setSelectedPrompt(null);
    setFormData({
      category: selectedCategory,
      subcategory: '',
      name: '',
      description: '',
      content: '',
      isActive: true
    });
    setIsEditing(true);
  };

  const handleEditPrompt = (prompt: SystemPromptData) => {
    setSelectedPrompt(prompt);
    setFormData({
      category: prompt.category,
      subcategory: prompt.subcategory || '',
      name: prompt.name,
      description: prompt.description || '',
      content: prompt.content,
      isActive: prompt.isActive !== false
    });
    setIsEditing(true);
  };

  const handleSavePrompt = async () => {
    if (!formData.name || !formData.content) {
      toast.error('Name and content are required');
      return;
    }

    setIsLoading(true);
    try {
      const url = selectedPrompt 
        ? `/api/admin/system-prompts/${selectedPrompt.id}`
        : '/api/admin/system-prompts';
      
      const method = selectedPrompt ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(selectedPrompt ? 'Prompt updated successfully' : 'Prompt created successfully');
        setIsEditing(false);
        fetchPrompts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save prompt');
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error('Failed to save prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to deactivate this prompt?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/system-prompts/${promptId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Prompt deactivated successfully');
        fetchPrompts();
      } else {
        toast.error('Failed to deactivate prompt');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Failed to deactivate prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Prompt copied to clipboard');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'event_type': return <FileText className="size-4" />;
      case 'style_preset': return <Palette className="size-4" />;
      case 'carousel_background': return <Settings className="size-4" />;
      case 'text_generation': return <MessageSquare className="size-4" />;
      case 'system_default': return <Settings className="size-4" />;
      default: return <FileText className="size-4" />;
    }
  };

  const currentCategory = PROMPT_CATEGORIES.find(cat => cat.id === selectedCategory);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Prompts Management</h2>
          <p className="text-muted-foreground">
            Manage and edit system prompts for different features
          </p>
        </div>
        <Button onClick={handleCreatePrompt} disabled={isLoading}>
          <Plus className="size-4 mr-2" />
          Create Prompt
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Category Selection and Prompt List */}
        <div className="space-y-4 lg:col-span-1">
          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROMPT_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category.id)}
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {currentCategory && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {currentCategory.description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Prompt List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Prompts
                <Badge variant="secondary">{prompts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-4 text-center">Loading...</div>
              ) : prompts.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground">
                  No prompts found for this category
                </div>
              ) : (
                <div className="space-y-2">
                  {prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="p-3 rounded-lg transition-colors hover:bg-muted/50 border cursor-pointer"
                      onClick={() => setSelectedPrompt(prompt)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{prompt.name}</h4>
                          {prompt.subcategory && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {prompt.subcategory}
                            </Badge>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {prompt.content}
                          </p>
                        </div>
                        <div className="flex ml-2 items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPrompt(prompt);
                            }}
                          >
                            <Edit className="size-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyPrompt(prompt.content);
                            }}
                          >
                            <Copy className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Prompt Editor and Recommendations */}
        <div className="space-y-4 lg:col-span-2">
          {isEditing ? (
            /* Prompt Editor */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {selectedPrompt ? 'Edit Prompt' : 'Create New Prompt'}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSavePrompt}
                      disabled={isLoading}
                    >
                      <Save className="size-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROMPT_CATEGORIES.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      placeholder="e.g., BIRTHDAY_PARTY"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter prompt name"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Prompt Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter the prompt content..."
                    rows={6}
                    className="text-sm font-mono"
                  />
                </div>

                <div className="flex space-x-2 items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </CardContent>
            </Card>
          ) : selectedPrompt ? (
            /* Prompt Viewer */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {selectedPrompt.name}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPrompt(selectedPrompt)}
                    >
                      <Edit className="size-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyPrompt(selectedPrompt.content)}
                    >
                      <Copy className="size-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => selectedPrompt.id && handleDeletePrompt(selectedPrompt.id)}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 text-sm gap-4">
                  <div>
                    <span className="font-medium">Category:</span> {selectedPrompt.category}
                  </div>
                  {selectedPrompt.subcategory && (
                    <div>
                      <span className="font-medium">Subcategory:</span> {selectedPrompt.subcategory}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Version:</span> {selectedPrompt.version}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge variant={selectedPrompt.isActive ? "default" : "secondary"} className="ml-2">
                      {selectedPrompt.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {selectedPrompt.description && (
                  <div>
                    <Label className="font-medium">Description</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedPrompt.description}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="font-medium">Content</Label>
                  <div className="p-4 mt-1 bg-muted rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {selectedPrompt.content}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Welcome Message */
            <Card>
              <CardContent className="flex py-12 items-center justify-center">
                <div className="text-center">
                  <FileText className="size-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">Select a Prompt</h3>
                  <p className="text-muted-foreground">
                    Choose a prompt from the list to view and edit its content
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ideogram Recommendations */}
          <IdeogramRecommendations 
            currentPrompt={isEditing ? formData.content : selectedPrompt?.content}
          />
        </div>
      </div>
    </div>
  );
} 