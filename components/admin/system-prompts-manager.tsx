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
  MessageSquare,
  Download,
  Upload,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { IdeogramRecommendations } from './ideogram-recommendations';
import { PromptPreviewTool } from './prompt-preview-tool';
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
  const [showImportExport, setShowImportExport] = useState(false);
  const [importData, setImportData] = useState('');
  const [isImporting, setIsImporting] = useState(false);

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

  const handleExportPrompts = async () => {
    try {
      setIsLoading(true);
      // Fetch all prompts for export
      const response = await fetch('/api/admin/system-prompts?isActive=true');
      if (response.ok) {
        const data = await response.json();
        const prompts = data.prompts || [];
        
        // Create export data
        const exportData = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          totalPrompts: prompts.length,
          prompts: prompts.map(prompt => ({
            category: prompt.category,
            subcategory: prompt.subcategory,
            name: prompt.name,
            description: prompt.description,
            content: prompt.content,
            version: prompt.version,
            isActive: prompt.isActive,
            metadata: prompt.metadata
          }))
        };

        // Create and download file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-prompts-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success(`Exported ${prompts.length} prompts successfully`);
      } else {
        toast.error('Failed to export prompts');
      }
    } catch (error) {
      console.error('Error exporting prompts:', error);
      toast.error('Failed to export prompts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportPrompts = async () => {
    if (!importData.trim()) {
      toast.error('Please paste JSON data to import');
      return;
    }

    try {
      setIsImporting(true);
      let importJson;
      
      try {
        importJson = JSON.parse(importData);
      } catch (error) {
        toast.error('Invalid JSON format');
        return;
      }

      if (!importJson.prompts || !Array.isArray(importJson.prompts)) {
        toast.error('Invalid import format: missing prompts array');
        return;
      }

      const response = await fetch('/api/admin/system-prompts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompts: importJson.prompts })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Imported ${result.imported} prompts successfully`);
        setImportData('');
        setShowImportExport(false);
        fetchPrompts(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to import prompts');
      }
    } catch (error) {
      console.error('Error importing prompts:', error);
      toast.error('Failed to import prompts');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowImportExport(!showImportExport)}
            disabled={isLoading}
          >
            <Database className="size-4 mr-2" />
            Import/Export
          </Button>
          <Button onClick={handleCreatePrompt} disabled={isLoading}>
            <Plus className="size-4 mr-2" />
            Create Prompt
          </Button>
        </div>
      </div>

      {/* Import/Export Panel */}
      {showImportExport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-4" />
              Import/Export System Prompts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Download className="size-4" />
                  Export Prompts
                </h3>
                <p className="text-sm text-muted-foreground">
                  Export all system prompts to a JSON file for backup or transfer to another environment.
                </p>
                <Button 
                  onClick={handleExportPrompts} 
                  disabled={isLoading}
                  className="w-full"
                >
                  <Download className="size-4 mr-2" />
                  Export All Prompts
                </Button>
              </div>

              {/* Import Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="size-4" />
                  Import Prompts
                </h3>
                <p className="text-sm text-muted-foreground">
                  Import prompts from a JSON file or paste JSON data directly.
                </p>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                  <div className="text-xs text-muted-foreground">
                    Or paste JSON data below:
                  </div>
                  <Textarea
                    placeholder="Paste JSON data here..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={4}
                    className="font-mono text-xs"
                  />
                  <Button 
                    onClick={handleImportPrompts} 
                    disabled={isImporting || !importData.trim()}
                    className="w-full"
                  >
                    <Upload className="size-4 mr-2" />
                    {isImporting ? 'Importing...' : 'Import Prompts'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Import Format Info */}
            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription>
                <strong>Import Format:</strong> The JSON should contain a <code>prompts</code> array with objects having: <code>category</code>, <code>subcategory</code>, <code>name</code>, <code>description</code>, <code>content</code>, <code>version</code>, <code>isActive</code>, and <code>metadata</code> fields.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Prompt Preview Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="size-4" />
            Prompt Preview Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PromptPreviewTool />
        </CardContent>
      </Card>

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
                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                              {prompt.content}
                            </p>
                            <div className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                              prompt.content.length <= 100 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                                : prompt.content.length <= 150 
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {prompt.content.length}
                            </div>
                          </div>
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
                  <div className="relative">
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Enter the prompt content..."
                      rows={6}
                      className="text-sm font-mono pr-20"
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs">
                      <div className={`px-2 py-1 rounded ${
                        formData.content.length <= 100 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : formData.content.length <= 150 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {formData.content.length} chars
                      </div>
                      <div className="text-muted-foreground">
                        Ideal: 50-100
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>50-100 chars: Optimal for AI processing</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>100-150 chars: Acceptable but may be truncated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>150+ chars: Likely to be truncated in generation</span>
                    </div>
                  </div>
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
                  <div className="p-4 mt-1 bg-muted rounded-lg relative">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {selectedPrompt.content}
                    </pre>
                    <div className="absolute top-2 right-2 flex items-center gap-2 text-xs">
                      <div className={`px-2 py-1 rounded ${
                        selectedPrompt.content.length <= 100 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : selectedPrompt.content.length <= 150 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {selectedPrompt.content.length} chars
                      </div>
                      <div className="text-muted-foreground">
                        Ideal: 50-100
                      </div>
                    </div>
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