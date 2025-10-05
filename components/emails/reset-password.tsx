import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface ForgotPasswordEmailProps {
  username: string;
  resetUrl: string;
  userEmail: string;
}

const ForgotPasswordEmail = (props: ForgotPasswordEmailProps) => {
  const { username, resetUrl, userEmail } = props;

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>Reset your password - Action required</Preview>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
            {/* Header */}
            <Section className="text-center mb-[32px]">
              <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[8px]">
                Reset Your Password
              </Heading>
              <Text className="text-[16px] text-gray-600 m-0">
                We received a request to reset your password
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[16px]">
                Hello, {username}
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[16px]">
                We received a password reset request for your account associated
                with <strong>{userEmail}</strong>.
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[24px]">
                Click the button below to create a new password. This link will
                expire in 24 hours for security reasons.
              </Text>
            </Section>

            {/* Reset Button */}
            <Section className="text-center mb-[32px]">
              <Button
                href={resetUrl}
                className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border inline-block"
              >
                Reset Password
              </Button>
            </Section>

            {/* Alternative Link */}
            <Section className="mb-[32px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0 mb-[8px]">
                If the button doesn&apos;t work, copy and paste this link into
                your browser:
              </Text>
              <Link
                href={resetUrl}
                className="text-blue-600 text-[14px] break-all"
              >
                {resetUrl}
              </Link>
            </Section>

            {/* Security Notice */}
            <Section className="bg-gray-50 p-[20px] rounded-[8px] mb-[32px]">
              <Text className="text-[14px] text-gray-700 leading-[20px] m-0 mb-[8px] font-semibold">
                Security Notice:
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0 mb-[8px]">
                • If you didn&apos;t request this password reset, please ignore
                this email
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0 mb-[8px]">
                • This link will expire in 24 hours
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0">
                • For security, never share this link with anyone
              </Text>
            </Section>

            {/* Help Section */}
            <Section className="mb-[32px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0">
                Need help? Contact our support team at{" "}
                <Link
                  href="mailto:support@company.com"
                  className="text-blue-600"
                >
                  support@company.com
                </Link>
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t border-gray-200 pt-[24px]">
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0 mb-[8px]">
                This email was sent to {userEmail}
              </Text>
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0 mb-[8px]">
                Company Name, 123 Business Street, City, State 12345
              </Text>
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                © 2025 Company Name. All rights reserved.{" "}
                <Link href="#" className="text-gray-500">
                  Unsubscribe
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ForgotPasswordEmail;
