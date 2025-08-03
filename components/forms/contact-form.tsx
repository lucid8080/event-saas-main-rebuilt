"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Send, CheckCircle } from "lucide-react";

// Contact form validation schema
const ContactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name is too long"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

const subjectOptions = [
  { value: "general", label: "General Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "billing", label: "Billing Question" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "feedback", label: "Feedback" },
];

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Message sent successfully!",
          description: result.message,
        });
        setIsSubmitted(true);
        form.reset();
      } else {
        toast({
          title: "Error sending message",
          description: result.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      toast({
        title: "Error sending message",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-8 bg-muted/30 rounded-lg text-center">
        <CheckCircle className="mx-auto mb-4 size-12 text-green-500" />
        <h2 className="mb-2 text-2xl font-semibold text-green-700">Thank you!</h2>
        <p className="mb-6 text-muted-foreground">
          Your message has been sent successfully. We'll get back to you within 24 hours.
        </p>
        <Button
          onClick={() => setIsSubmitted(false)}
          variant="outline"
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-muted/30 rounded-lg">
      <h2 className="mb-6 text-2xl font-semibold">Send us a Message</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block mb-2 text-sm font-medium">
              First Name
            </label>
            <Input
              id="firstName"
              {...form.register("firstName")}
              className={form.formState.errors.firstName ? "border-red-500" : ""}
              placeholder="Enter your first name"
            />
            {form.formState.errors.firstName && (
              <p className="mt-1 text-sm text-red-500">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block mb-2 text-sm font-medium">
              Last Name
            </label>
            <Input
              id="lastName"
              {...form.register("lastName")}
              className={form.formState.errors.lastName ? "border-red-500" : ""}
              placeholder="Enter your last name"
            />
            {form.formState.errors.lastName && (
              <p className="mt-1 text-sm text-red-500">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            className={form.formState.errors.email ? "border-red-500" : ""}
            placeholder="Enter your email address"
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-sm text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="subject" className="block mb-2 text-sm font-medium">
            Subject
          </label>
          <Select
            value={form.watch("subject")}
            onValueChange={(value) => form.setValue("subject", value)}
          >
            <SelectTrigger className={form.formState.errors.subject ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.subject && (
            <p className="mt-1 text-sm text-red-500">
              {form.formState.errors.subject.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block mb-2 text-sm font-medium">
            Message
          </label>
          <Textarea
            id="message"
            {...form.register("message")}
            rows={6}
            className={`resize-none ${form.formState.errors.message ? "border-red-500" : ""}`}
            placeholder="Tell us how we can help you..."
          />
          {form.formState.errors.message && (
            <p className="mt-1 text-sm text-red-500">
              {form.formState.errors.message.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 size-4" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </div>
  );
} 