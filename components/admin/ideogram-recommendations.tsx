'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  BookOpen,
  Sparkles,
  Target,
  Palette,
  Type,
  Eye,
  Zap,
  Star
} from 'lucide-react';

interface RecommendationProps {
  currentPrompt?: string;
  onApplySuggestion?: (suggestion: string) => void;
}

export function IdeogramRecommendations({ currentPrompt, onApplySuggestion }: RecommendationProps) {
  const [activeTab, setActiveTab] = useState('structure');

  const recommendations = {
    structure: {
      title: 'Prompt Structure',
      icon: Target,
      tips: [
        {
          type: 'good',
          title: 'Clear Subject + Style + Context',
          description: 'Follow the formula: [Subject] + [Style/Technique] + [Context/Mood]',
          example: 'vibrant birthday party celebration with colorful balloons, warm and joyful atmosphere'
        },
        {
          type: 'good',
          title: 'Specific Visual Elements',
          description: 'Include concrete visual details and elements',
          example: 'with romantic floral arrangements, soft lighting, and sophisticated decor'
        },
        {
          type: 'good',
          title: 'Atmospheric Context',
          description: 'Describe the mood, lighting, and emotional tone',
          example: 'timeless and romantic atmosphere with warm golden tones'
        },
        {
          type: 'bad',
          title: 'Avoid Vague Terms',
          description: 'Don\'t use unclear or subjective terms',
          example: 'beautiful, nice, good looking, amazing'
        }
      ]
    },
    text: {
      title: 'Text & Typography',
      icon: Type,
      tips: [
        {
          type: 'good',
          title: 'Text Positioning',
          description: 'Specify where text should appear and how it should look',
          example: 'perfect for white text overlay, excellent text contrast'
        },
        {
          type: 'good',
          title: 'Typography Considerations',
          description: 'Consider font readability and visual hierarchy',
          example: 'text-friendly with clear readability zones'
        },
        {
          type: 'bad',
          title: 'Avoid Complex Text',
          description: 'Don\'t request very long or complex text',
          example: 'avoid requesting entire paragraphs of text'
        }
      ]
    },
    negatives: {
      title: 'Negative Prompts',
      icon: AlertTriangle,
      tips: [
        {
          type: 'good',
          title: 'Quality Control',
          description: 'Specify what you don\'t want for better results',
          example: 'no text unless otherwise specified, no blur, no distortion'
        },
        {
          type: 'good',
          title: 'Professional Standards',
          description: 'Ensure high quality and professional appearance',
          example: 'high quality, professional design'
        },
        {
          type: 'bad',
          title: 'Over-Negating',
          description: 'Don\'t overuse negative prompts',
          example: 'avoid listing too many negative terms'
        }
      ]
    },
    pitfalls: {
      title: 'Common Pitfalls',
      icon: AlertTriangle,
      tips: [
        {
          type: 'bad',
          title: 'Ambiguous Language',
          description: 'Avoid unclear or subjective terms',
          example: 'beautiful, amazing, perfect, nice'
        },
        {
          type: 'bad',
          title: 'Conflicting Instructions',
          description: 'Don\'t give contradictory directions',
          example: 'both dark and bright lighting, both simple and complex'
        },
        {
          type: 'bad',
          title: 'Over-Specification',
          description: 'Don\'t include too many details at once',
          example: 'avoid listing 10+ specific elements in one prompt'
        }
      ]
    },
    iteration: {
      title: 'Prompt Iteration',
      icon: Sparkles,
      tips: [
        {
          type: 'good',
          title: 'Start Simple',
          description: 'Begin with basic elements and add complexity',
          example: 'Start with: "birthday party" then add: "with colorful balloons"'
        },
        {
          type: 'good',
          title: 'Test Variations',
          description: 'Try different wordings and approaches',
          example: 'Test: "vibrant celebration" vs "joyful party atmosphere"'
        },
        {
          type: 'good',
          title: 'Refine Gradually',
          description: 'Make small changes and observe results',
          example: 'Add one detail at a time and test the impact'
        }
      ]
    },
    creative: {
      title: 'Creative Tools',
      icon: Palette,
      tips: [
        {
          type: 'good',
          title: 'Style References',
          description: 'Reference specific artists or art movements',
          example: 'reminiscent of Roy Lichtenstein, impressionist painting style'
        },
        {
          type: 'good',
          title: 'Color Palettes',
          description: 'Specify color schemes and moods',
          example: 'warm golden tones, vibrant coral colors, muted sage green'
        },
        {
          type: 'good',
          title: 'Composition',
          description: 'Describe layout and visual flow',
          example: 'seamless pattern that flows continuously, unified visual experience'
        }
      ]
    }
  };

  const analyzePrompt = (prompt: string) => {
    const analysis = {
      score: 0,
      suggestions: [] as string[],
      issues: [] as string[],
      strengths: [] as string[]
    };

    // Check for clear subject
    if (prompt.length > 20) analysis.score += 15;
    else analysis.issues.push('Prompt is too short - add more specific details');

    // Check for style specification
    if (prompt.includes('style') || prompt.includes('aesthetic') || prompt.includes('atmosphere')) {
      analysis.score += 20;
      analysis.strengths.push('Good style specification');
    } else {
      analysis.suggestions.push('Add style or aesthetic description');
    }

    // Check for context/mood
    if (prompt.includes('with') || prompt.includes('during') || prompt.includes('atmosphere')) {
      analysis.score += 20;
      analysis.strengths.push('Good context and mood description');
    } else {
      analysis.suggestions.push('Add context or mood description');
    }

    // Check for specific visual elements
    if (prompt.includes('balloons') || prompt.includes('lighting') || prompt.includes('decorations') || 
        prompt.includes('floral') || prompt.includes('neon') || prompt.includes('colors')) {
      analysis.score += 20;
      analysis.strengths.push('Specific visual elements included');
    } else {
      analysis.suggestions.push('Add specific visual elements');
    }

    // Check for negative prompts
    if (prompt.includes('no text') || prompt.includes('no blur') || prompt.includes('no distortion')) {
      analysis.score += 15;
      analysis.strengths.push('Good negative prompts for quality control');
    } else {
      analysis.suggestions.push('Add negative prompts for quality control');
    }

    // Check for quality indicators
    if (prompt.includes('high quality') || prompt.includes('professional')) {
      analysis.score += 10;
      analysis.strengths.push('Quality indicators included');
    } else {
      analysis.suggestions.push('Add quality indicators');
    }

    // Check for vague terms
    const vagueTerms = ['beautiful', 'nice', 'good', 'amazing', 'perfect', 'great'];
    const hasVagueTerms = vagueTerms.some(term => 
      prompt.toLowerCase().includes(term)
    );
    
    if (hasVagueTerms) {
      analysis.score -= 15;
      analysis.issues.push('Contains vague terms - be more specific');
    }

    // Check length
    if (prompt.length > 300) {
      analysis.score -= 10;
      analysis.issues.push('Prompt might be too long - consider simplifying');
    }

    // Check for text considerations
    if (prompt.includes('text') || prompt.includes('readability') || prompt.includes('overlay')) {
      analysis.score += 10;
      analysis.strengths.push('Text considerations included');
    } else {
      analysis.suggestions.push('Consider text overlay and readability');
    }

    return analysis;
  };

  const currentAnalysis = currentPrompt ? analyzePrompt(currentPrompt) : null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Work</Badge>;
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Star className="size-4 text-green-600" />;
    if (score >= 60) return <Zap className="size-4 text-yellow-600" />;
    return <AlertTriangle className="size-4 text-red-600" />;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="size-5" />
          Ideogram Best Practices
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentAnalysis && (
          <Alert>
            {getScoreIcon(currentAnalysis.score)}
            <AlertDescription>
              <div className="flex mb-2 items-center justify-between">
                <span>Prompt Quality Score:</span>
                <span className={`font-bold ${getScoreColor(currentAnalysis.score)}`}>
                  {currentAnalysis.score}/100
                </span>
                {getScoreBadge(currentAnalysis.score)}
              </div>
              
              {currentAnalysis.strengths.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-600 font-medium">Strengths:</p>
                  <ul className="text-sm text-green-600 list-disc list-inside">
                    {currentAnalysis.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {currentAnalysis.issues.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-red-600 font-medium">Issues:</p>
                  <ul className="text-sm text-red-600 list-disc list-inside">
                    {currentAnalysis.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {currentAnalysis.suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-blue-600 font-medium">Suggestions:</p>
                  <ul className="text-sm text-blue-600 list-disc list-inside">
                    {currentAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="negatives">Negatives</TabsTrigger>
            <TabsTrigger value="pitfalls">Pitfalls</TabsTrigger>
            <TabsTrigger value="iteration">Iteration</TabsTrigger>
            <TabsTrigger value="creative">Creative</TabsTrigger>
          </TabsList>

          {Object.entries(recommendations).map(([key, section]) => (
            <TabsContent key={key} value={key} className="space-y-3">
              <div className="flex mb-3 items-center gap-2">
                <section.icon className="size-4" />
                <h4 className="font-medium">{section.title}</h4>
              </div>
              
              {section.tips.map((tip, index) => (
                <div key={index} className="p-3 rounded-lg border">
                  <div className="flex mb-2 items-start gap-2">
                    {tip.type === 'good' ? (
                      <CheckCircle className="size-4 mt-0.5 text-green-600" />
                    ) : (
                      <AlertTriangle className="size-4 mt-0.5 text-red-600" />
                    )}
                    <div className="flex-1">
                      <h5 className="text-sm font-medium">{tip.title}</h5>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {tip.description}
                      </p>
                      {tip.example && (
                        <div className="p-2 bg-muted text-xs rounded font-mono">
                          "{tip.example}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        <div className="pt-4 border-t">
          <h4 className="flex mb-2 font-medium items-center gap-2">
            <Lightbulb className="size-4" />
            Enhanced Quick Tips
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Use the formula: [Subject] + [Style] + [Context/Mood]</li>
            <li>• Include specific visual elements and atmospheric details</li>
            <li>• Add negative prompts for quality control</li>
            <li>• Consider text readability and overlay positioning</li>
            <li>• Reference specific artists or art movements for style</li>
            <li>• Test variations and iterate gradually</li>
            <li>• Avoid vague terms like "beautiful" or "amazing"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 