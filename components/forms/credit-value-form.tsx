"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export function CreditValueForm() {
  const [creditValue, setCreditValue] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadCreditValue() {
      try {
        const response = await fetch('/api/settings/credit-value');
        if (response.ok) {
          const data = await response.json();
          setCreditValue(data.creditValue);
        }
      } catch (error) {
        console.error('Error loading credit value:', error);
        toast.error('Failed to load credit value');
      }
    }

    loadCreditValue();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings/credit-value', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creditValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to save credit value');
      }

      toast.success('Credit value saved successfully');
    } catch (error) {
      toast.error('Failed to save credit value');
      console.error('Error saving credit value:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Credit Value Settings</h3>
          <p className="text-sm text-muted-foreground">
            Set the denomination for a single credit in your system
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <label 
              htmlFor="credit-value" 
              className="text-sm font-medium"
            >
              Credit Value ($)
            </label>
            <Input
              id="credit-value"
              name="credit-value"
              type="number"
              step="0.01"
              value={creditValue}
              onChange={(e) => setCreditValue(parseFloat(e.target.value))}
              placeholder="Enter value for one credit"
              className="max-w-[400px]"
            />
          </div>
          <Button
            onClick={handleSave}
            className="w-fit"
            disabled={creditValue === '' || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Card>
  );
} 