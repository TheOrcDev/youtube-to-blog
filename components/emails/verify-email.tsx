import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Tailwind,
} from "@react-email/components";

interface VerifyEmailProps {
  username: string;
  verifyUrl: string;
}

const VerifyEmail = (props: VerifyEmailProps) => {
  const { username, verifyUrl } = props;
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] p-[32px] max-w-[600px] mx-auto">
            <Section>
              <Text className="text-[24px] font-bold text-gray-900 mb-[16px] mt-0">
                Verify your email address
              </Text>

              <Text className="text-[16px] text-gray-700 mb-[24px] mt-0 leading-[24px]">
                Thanks {username} for signing up! To complete your registration
                and secure your account, please verify your email address by
                clicking the button below.
              </Text>

              <Section className="text-center mb-[32px]">
                <Button
                  href={verifyUrl}
                  className="bg-blue-600 text-white px-[32px] py-[12px] rounded-[6px] text-[16px] font-medium no-underline box-border"
                >
                  Verify Email Address
                </Button>
              </Section>

              <Text className="text-[14px] text-gray-600 mb-[24px] mt-0 leading-[20px]">
                If the button doesn&apos;t work, you can copy and paste this
                link into your browser:
                <br />
                {verifyUrl}
              </Text>

              <Text className="text-[14px] text-gray-600 mb-[32px] mt-0 leading-[20px]">
                This verification link will expire in 24 hours. If you
                didn&apos;t create an account, you can safely ignore this email.
              </Text>

              <Hr className="border-gray-200 my-[24px]" />

              <Text className="text-[12px] text-gray-500 m-0 leading-[16px]">
                Best regards,
                <br />
                The Team
              </Text>
            </Section>

            <Section className="mt-[32px] pt-[24px] border-t border-gray-200">
              <Text className="text-[12px] text-gray-400 m-0 text-center leading-[16px]">
                Company Name
                <br />
                123 Business Street, Suite 100
                <br />
                City, State 12345
              </Text>

              <Text className="text-[12px] text-gray-400 m-0 text-center mt-[8px] leading-[16px]">
                <a href="#" className="text-gray-400 underline">
                  Unsubscribe
                </a>{" "}
                | © 2024 Company Name. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerifyEmail;
