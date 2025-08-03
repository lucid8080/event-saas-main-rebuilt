"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, CheckCircle, AlertCircle } from "lucide-react";
import { EventTypeConfig, EventQuestion, getEventTypeConfig } from "@/lib/event-questions";
import { EventDetails, validateEventDetails } from "@/lib/prompt-generator";
import { HolidaySelector } from "./holiday-selector";

interface EventQuestionsFormProps {
  eventType: string;
  eventDetails: EventDetails;
  onEventDetailsChange: (details: EventDetails) => void;
  onValidationChange: (isValid: boolean) => void;
  className?: string;
}

export function EventQuestionsForm({
  eventType,
  eventDetails,
  onEventDetailsChange,
  onValidationChange,
  className = ""
}: EventQuestionsFormProps) {
  const [eventConfig, setEventConfig] = useState<EventTypeConfig | null>(null);
  const [validation, setValidation] = useState<{ isValid: boolean; missingFields: string[] }>({
    isValid: false,
    missingFields: []
  });

  useEffect(() => {
    const config = getEventTypeConfig(eventType);
    setEventConfig(config || null);
  }, [eventType]);

  useEffect(() => {
    if (eventConfig) {
      const validationResult = validateEventDetails(eventType, eventDetails);
      setValidation(validationResult);
      onValidationChange(validationResult.isValid);
    }
  }, [eventDetails, eventType, eventConfig, onValidationChange]);

  const handleInputChange = (questionId: string, value: string | number) => {
    const newDetails = {
      ...eventDetails,
      [questionId]: value
    };
    onEventDetailsChange(newDetails);
  };

  const renderQuestion = (question: EventQuestion) => {
    const value = eventDetails[question.id] || "";
    const isRequired = question.required;
    const hasError = isRequired && !value;

    switch (question.type) {
      case 'text':
        return (
          <Input
            id={question.id}
            value={value as string}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder}
          />
        );

      case 'number':
        return (
          <Input
            id={question.id}
            type="number"
            value={value as string}
            onChange={(e) => handleInputChange(question.id, parseInt(e.target.value) || 0)}
            placeholder={question.placeholder}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={question.id}
            value={value as string}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="min-h-[80px] resize-none"
          />
        );

      case 'select':
        // Special handling for holiday selection
        if (question.id === 'holiday' && eventType === 'HOLIDAY_CELEBRATION') {
          return (
            <HolidaySelector
              value={value as string}
              onValueChange={(newValue) => handleInputChange(question.id, newValue)}
            />
          );
        }
        
        return (
          <Select
            value={value as string}
            onValueChange={(newValue) => handleInputChange(question.id, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  if (!eventConfig) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          Please select an event type to see questions.
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex mb-6 items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-full dark:bg-purple-900/50">
          <span className="text-lg">{eventConfig.icon}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Event Details</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Help us create a more personalized image
          </p>
        </div>
        <div className="ml-auto">
          {validation.isValid ? (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="size-3 mr-1" />
              Complete
            </Badge>
          ) : (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              <AlertCircle className="size-3 mr-1" />
              {validation.missingFields.length} required
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {eventConfig.questions.map((question) => {
          const value = eventDetails[question.id] || "";
          const isRequired = question.required;
          const hasError = isRequired && !value;

          return (
            <div key={question.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={question.id} className="text-sm font-medium">
                  {question.label}
                </Label>
                {question.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{question.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {renderQuestion(question)}



              {value && question.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {question.description}
                </p>
              )}
            </div>
          );
        })}
      </div>


    </Card>
  );
} 