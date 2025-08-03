import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { Icons } from "../components/shared/icons";

type MagicLinkEmailProps = {
  actionUrl: string;
  firstName: string;
  mailType: "login" | "register";
  siteName: string;
};

export const MagicLinkEmail = ({
  firstName = "",
  actionUrl,
  mailType,
  siteName,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>
      The AI-powered event image generation platform that helps you create stunning visuals.
    </Preview>
    <Tailwind>
      <Body className="bg-white font-sans">
        <Container className="py-5 pb-12 mx-auto">
          <Icons.logo className="block size-10 m-auto" />
          <Text className="text-base">Hi {firstName},</Text>
          <Text className="text-base">
            Welcome to {siteName} ! Click the link below to{" "}
            {mailType === "login" ? "sign in to" : "activate"} your account.
          </Text>
          <Section className="my-5 text-center">
            <Button
              className="inline-block px-4 py-2 bg-zinc-900 text-base text-white rounded-md no-underline"
              href={actionUrl}
            >
              {mailType === "login" ? "Sign in" : "Activate Account"}
            </Button>
          </Section>
          <Text className="text-base">
            This link expires in 24 hours and can only be used once.
          </Text>
          {mailType === "login" ? (
            <Text className="text-base">
              If you did not try to log into your account, you can safely ignore
              it.
            </Text>
          ) : null}
          <Hr className="my-4 border-t-2 border-gray-300" />
          <Text className="text-sm text-gray-600">
            123 Code Street, Suite 404, Devtown, CA 98765
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
