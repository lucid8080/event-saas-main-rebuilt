import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - EventCraftAI",
  description: "Read our terms and conditions for using EventCraftAI services.",
}

export default function TermsPage() {
  return (
    <div className="container max-w-4xl px-4 py-16 mx-auto">
      <div className="max-w-none dark:prose-invert prose prose-gray">
        <h1>Terms of Service</h1>
        <p><strong>Last updated: December 2024</strong></p>
        
        <p>Welcome to EventCraftAI. These Terms of Service ("Terms") govern your use of our AI-powered event image generation platform and services. By accessing or using our services, you agree to be bound by these Terms.</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using EventCraftAI, you agree to be bound by these Terms and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.</p>

        <h2>2. Description of Service</h2>
        <p>EventCraftAI provides an AI-powered platform that generates custom event images and carousels based on user inputs. Our services include:</p>
        <ul>
          <li>AI-powered image generation for various event types</li>
          <li>Customizable carousel creation for social media</li>
          <li>Image editing and customization tools</li>
          <li>Cloud storage and management of generated content</li>
          <li>User account management and billing</li>
        </ul>

        <h2>3. User Accounts</h2>
        <h3>3.1 Account Creation</h3>
        <p>To access certain features of our service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.</p>

        <h3>3.2 Account Security</h3>
        <p>You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>

        <h3>3.3 Account Termination</h3>
        <p>We reserve the right to terminate or suspend your account at any time for violations of these Terms or for any other reason at our sole discretion.</p>

        <h2>4. Payment and Billing</h2>
        <h3>4.1 Pricing</h3>
        <p>Our services are offered on a subscription basis with different pricing tiers. All prices are subject to change with notice.</p>

        <h3>4.2 Payment Processing</h3>
        <p>Payments are processed securely through Stripe. By providing payment information, you authorize us to charge your payment method for all fees incurred.</p>

        <h3>4.3 Credits System</h3>
        <p>Our service uses a credits system where each image generation consumes credits. Credits are allocated based on your subscription plan and billing cycle.</p>

        <h3>4.4 Refunds</h3>
        <p>Refunds are handled on a case-by-case basis. Unused credits are generally non-refundable unless required by law.</p>

        <h2>5. Acceptable Use</h2>
        <h3>5.1 Prohibited Activities</h3>
        <p>You agree not to use our service to:</p>
        <ul>
          <li>Generate content that is illegal, harmful, threatening, abusive, or defamatory</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on intellectual property rights</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with or disrupt the service</li>
          <li>Use the service for commercial purposes without proper authorization</li>
        </ul>

        <h3>5.2 Content Guidelines</h3>
        <p>You are responsible for ensuring that all content you generate complies with our content guidelines and applicable laws. We reserve the right to remove or restrict access to content that violates these guidelines.</p>

        <h2>6. Intellectual Property</h2>
        <h3>6.1 Your Content</h3>
        <p>You retain ownership of the content you create using our service, subject to our right to use such content as described in our Privacy Policy.</p>

        <h3>6.2 Our Rights</h3>
        <p>EventCraftAI and its content, features, and functionality are owned by us and are protected by copyright, trademark, and other intellectual property laws.</p>

        <h3>6.3 License to Use</h3>
        <p>We grant you a limited, non-exclusive, non-transferable license to use our service in accordance with these Terms.</p>

        <h2>7. Privacy and Data Protection</h2>
        <p>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>

        <h2>8. Disclaimers and Limitations</h2>
        <h3>8.1 Service Availability</h3>
        <p>We strive to maintain high service availability but do not guarantee uninterrupted access. We may temporarily suspend the service for maintenance or updates.</p>

        <h3>8.2 AI-Generated Content</h3>
        <p>Our AI-generated content is provided "as is" without warranties of accuracy, completeness, or suitability for any particular purpose.</p>

        <h3>8.3 Limitation of Liability</h3>
        <p>To the maximum extent permitted by law, EventCraftAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.</p>

        <h2>9. Indemnification</h2>
        <p>You agree to indemnify and hold harmless EventCraftAI from any claims, damages, or expenses arising from your use of the service or violation of these Terms.</p>

        <h2>10. Modifications to Terms</h2>
        <p>We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through our service. Continued use of the service after changes constitutes acceptance of the new Terms.</p>

        <h2>11. Governing Law</h2>
        <p>These Terms are governed by and construed in accordance with the laws of the jurisdiction in which EventCraftAI operates, without regard to conflict of law principles.</p>

        <h2>12. Contact Information</h2>
        <p>If you have any questions about these Terms of Service, please contact us at:</p>
        <p>Email: legal@eventcraftai.com</p>
        <p>Address: EventCraftAI, 123 Innovation Drive, Tech City, TC 12345, United States</p>
      </div>
    </div>
  )
} 