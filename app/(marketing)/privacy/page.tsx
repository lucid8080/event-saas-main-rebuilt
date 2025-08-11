import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - EventCraftAI",
  description: "Learn how EventCraftAI collects, uses, and protects your information.",
}

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl px-4 py-16 mx-auto">
      <div className="max-w-none dark:prose-invert prose prose-gray">
        <h1>Privacy Policy</h1>
        <p><strong>Last updated: December 2024</strong></p>
        
        <p>EventCraftAI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered event image generation platform.</p>

        <h2>Information We Collect</h2>

        <h3>Personal Information</h3>
        <p>We may collect personal information that you voluntarily provide to us when you:</p>
        <ul>
          <li>Create an account</li>
          <li>Use our services</li>
          <li>Contact our support team</li>
          <li>Subscribe to our newsletter</li>
          <li>Participate in surveys or promotions</li>
        </ul>

        <p>This information may include:</p>
        <ul>
          <li>Name and email address</li>
          <li>Company information</li>
          <li>Payment information (processed securely through Stripe)</li>
          <li>Event details and preferences</li>
          <li>Communication preferences</li>
        </ul>

        <h3>Usage Information</h3>
        <p>We automatically collect certain information about your use of our platform, including:</p>
        <ul>
          <li>IP address and device information</li>
          <li>Browser type and version</li>
          <li>Pages visited and time spent</li>
          <li>Features used and interactions</li>
          <li>Error logs and performance data</li>
        </ul>

        <h3>Generated Content</h3>
        <p>We may store and process:</p>
        <ul>
          <li>Event descriptions and details you provide</li>
          <li>Generated images and carousels</li>
          <li>Customization preferences and settings</li>
          <li>Usage patterns and preferences</li>
        </ul>

        <h2>How We Use Your Information</h2>

        <p>We use the collected information for the following purposes:</p>

        <h3>Service Provision</h3>
        <ul>
          <li>Provide and maintain our AI image generation services</li>
          <li>Process payments and manage subscriptions</li>
          <li>Generate and customize images based on your inputs</li>
          <li>Improve and optimize our platform performance</li>
        </ul>

        <h3>Communication</h3>
        <ul>
          <li>Send important service updates and notifications</li>
          <li>Respond to your inquiries and support requests</li>
          <li>Send marketing communications (with your consent)</li>
          <li>Provide customer service and technical support</li>
        </ul>

        <h3>Platform Improvement</h3>
        <ul>
          <li>Analyze usage patterns to improve our services</li>
          <li>Develop new features and functionality</li>
          <li>Conduct research and analytics</li>
          <li>Ensure platform security and prevent fraud</li>
        </ul>

        <h3>Legal Compliance</h3>
        <ul>
          <li>Comply with applicable laws and regulations</li>
          <li>Enforce our Terms of Service</li>
          <li>Protect our rights and the rights of our users</li>
        </ul>

        <h2>Information Sharing and Disclosure</h2>

        <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>

        <h3>Service Providers</h3>
        <p>We work with trusted third-party service providers who assist us in:</p>
        <ul>
          <li>Payment processing (Stripe)</li>
          <li>Email delivery and communication</li>
          <li>Analytics and performance monitoring</li>
          <li>Cloud hosting and infrastructure</li>
        </ul>

        <h3>Legal Requirements</h3>
        <p>We may disclose your information if required by law or in response to:</p>
        <ul>
          <li>Valid legal requests or court orders</li>
          <li>Government investigations</li>
          <li>Protection of our rights and safety</li>
          <li>Prevention of fraud or security threats</li>
        </ul>

        <h3>Business Transfers</h3>
        <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction.</p>

        <h2>Data Security</h2>

        <p>We implement appropriate technical and organizational measures to protect your information, including:</p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security assessments and updates</li>
          <li>Access controls and authentication</li>
          <li>Secure data centers and infrastructure</li>
          <li>Employee training on data protection</li>
        </ul>

        <h2>Your Rights and Choices</h2>

        <p>You have the right to:</p>
        <ul>
          <li>Access and review your personal information</li>
          <li>Update or correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Opt-out of marketing communications</li>
          <li>Request data portability</li>
        </ul>

        <h2>Contact Us</h2>

        <p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
        <p>Email: privacy@eventcraftai.com</p>
        <p>Address: EventCraftAI, 123 Innovation Drive, Tech City, TC 12345, United States</p>
      </div>
    </div>
  )
} 