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

interface OrganizationInvitationEmailProps {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
}

const OrganizationInvitationEmail = (
  props: OrganizationInvitationEmailProps
) => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>You&apos;ve been invited to join {props.teamName}</Preview>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
            {/* Header */}
            <Section className="text-center mb-[32px]">
              <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[8px]">
                You&apos;re invited!
              </Heading>
              <Text className="text-[16px] text-gray-600 m-0">
                Join {props.teamName} and start collaborating
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Text className="text-[16px] text-gray-700 mb-[16px] m-0">
                Hi there,
              </Text>
              <Text className="text-[16px] text-gray-700 mb-[16px] m-0">
                <strong>{props.invitedByUsername}</strong> (
                {props.invitedByEmail}) has invited you to join{" "}
                <strong>{props.teamName}</strong> on our platform.
              </Text>
              <Text className="text-[16px] text-gray-700 mb-[24px] m-0">
                Accept this invitation to start collaborating with your team
                members and access all the tools and resources available in your
                organization.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="text-center mb-[32px]">
              <Button
                href={props.inviteLink}
                className="bg-blue-600 text-white px-[24px] py-[12px] rounded-[6px] text-[16px] font-medium no-underline box-border inline-block"
              >
                Accept Invitation
              </Button>
            </Section>

            {/* Alternative Link */}
            <Section className="mb-[32px]">
              <Text className="text-[14px] text-gray-600 mb-[8px] m-0">
                If the button above doesn&apos;t work, you can also copy and
                paste this link into your browser:
              </Text>
              <Text className="text-[14px] break-all m-0">
                <Link
                  href={props.inviteLink}
                  className="text-blue-600 underline"
                >
                  {props.inviteLink}
                </Link>
              </Text>
            </Section>

            {/* Additional Info */}
            <Section className="border-t border-gray-200 pt-[24px] mb-[24px]">
              <Text className="text-[14px] text-gray-600 mb-[8px] m-0">
                <strong>Organization:</strong> {props.teamName}
              </Text>
              <Text className="text-[14px] text-gray-600 mb-[8px] m-0">
                <strong>Invited by:</strong> {props.invitedByUsername} (
                {props.invitedByEmail})
              </Text>
              <Text className="text-[14px] text-gray-600 m-0">
                <strong>Your email:</strong> {props.email}
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t border-gray-200 pt-[24px]">
              <Text className="text-[12px] text-gray-500 text-center m-0 mb-[8px]">
                This invitation was sent to {props.email}. If you weren&apos;t
                expecting this invitation, you can safely ignore this email.
              </Text>
              <Text className="text-[12px] text-gray-500 text-center m-0 mb-[8px]">
                © {new Date().getFullYear()} Your Company Name. All rights
                reserved.
              </Text>
              <Text className="text-[12px] text-gray-500 text-center m-0">
                123 Business Street, Suite 100, City, State 12345
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrganizationInvitationEmail;
