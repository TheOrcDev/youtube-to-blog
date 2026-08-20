import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold text-3xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="mb-4 font-semibold text-2xl">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy describes how YouTube to Blog ("we," "our," or
              "us") collects, uses, and protects your personal information when
              you use our service. We are committed to protecting your privacy
              and ensuring the security of your personal data.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="mb-4 font-semibold text-2xl">
              2. Information We Collect
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="mb-2 font-medium text-lg">
                  Personal Information
                </h3>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li>
                    Email address (for account creation and communication)
                  </li>
                  <li>Username (for account identification)</li>
                  <li>Password (encrypted and stored securely)</li>
                  <li>Profile information you choose to provide</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-lg">Usage Information</h3>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li>YouTube URLs you submit for processing</li>
                  <li>Generated blog content and metadata</li>
                  <li>Service usage patterns and preferences</li>
                  <li>Device information and browser type</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-lg">
                  Technical Information
                </h3>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li>IP address and location data</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Log files and error reports</li>
                  <li>Performance and analytics data</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="mb-4 font-semibold text-2xl">
              3. How We Use Your Information
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We use your information to:</p>
              <ul className="ml-4 list-inside list-disc space-y-2">
                <li>Provide and maintain our service</li>
                <li>Process YouTube videos and generate blog content</li>
                <li>Authenticate users and manage accounts</li>
                <li>Send important service notifications</li>
                <li>Improve our service and develop new features</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="mb-4 font-semibold text-2xl">
              4. Legal Basis for Processing (GDPR)
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                We process your personal data based on the following legal
                grounds:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-2">
                <li>
                  <strong>Consent:</strong> When you explicitly agree to data
                  processing
                </li>
                <li>
                  <strong>Contract:</strong> To fulfill our service agreement
                  with you
                </li>
                <li>
                  <strong>Legitimate Interest:</strong> To improve our service
                  and ensure security
                </li>
                <li>
                  <strong>Legal Obligation:</strong> To comply with applicable
                  laws
                </li>
              </ul>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="mb-4 font-semibold text-2xl">
              5. Data Sharing and Disclosure
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                We do not sell your personal information. We may share your data
                only in the following circumstances:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-2">
                <li>With your explicit consent</li>
                <li>
                  With service providers who assist in our operations (under
                  strict confidentiality agreements)
                </li>
                <li>To comply with legal requirements or court orders</li>
                <li>
                  To protect our rights, property, or safety, or that of our
                  users
                </li>
                <li>In connection with a business transfer or acquisition</li>
              </ul>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="mb-4 font-semibold text-2xl">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to
              protect your personal data against unauthorized access,
              alteration, disclosure, or destruction. This includes encryption,
              secure servers, and regular security assessments.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="mb-4 font-semibold text-2xl">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal data only as long as necessary to provide
              our service and fulfill the purposes outlined in this policy. When
              you delete your account, we will remove your personal data within
              30 days, except where we are required to retain it for legal or
              regulatory purposes.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="mb-4 font-semibold text-2xl">
              8. Your Rights (GDPR)
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Under applicable data protection laws, you have the following
                rights:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-2">
                <li>
                  <strong>Access:</strong> Request a copy of your personal data
                </li>
                <li>
                  <strong>Rectification:</strong> Correct inaccurate or
                  incomplete data
                </li>
                <li>
                  <strong>Erasure:</strong> Request deletion of your personal
                  data
                </li>
                <li>
                  <strong>Portability:</strong> Receive your data in a
                  structured format
                </li>
                <li>
                  <strong>Restriction:</strong> Limit how we process your data
                </li>
                <li>
                  <strong>Objection:</strong> Object to certain types of
                  processing
                </li>
                <li>
                  <strong>Withdraw Consent:</strong> Withdraw consent at any
                  time
                </li>
              </ul>
              <p>
                To exercise these rights, please contact us using the
                information provided below.
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="mb-4 font-semibold text-2xl">
              9. Cookies and Tracking
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to enhance your
              experience, analyze usage patterns, and provide personalized
              content. You can control cookie settings through your browser
              preferences. Note that disabling cookies may affect service
              functionality.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="mb-4 font-semibold text-2xl">
              10. Third-Party Services
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service may integrate with third-party services (such as
              YouTube API, authentication providers, and analytics tools). These
              services have their own privacy policies, and we encourage you to
              review them.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="mb-4 font-semibold text-2xl">
              11. International Data Transfers
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data may be transferred to and processed in countries other
              than your own. We ensure appropriate safeguards are in place to
              protect your data during such transfers, including standard
              contractual clauses and adequacy decisions.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="mb-4 font-semibold text-2xl">
              12. Children's Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If we become aware that we have collected such information, we
              will take steps to delete it promptly.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="mb-4 font-semibold text-2xl">
              13. Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by email or through our
              service. Your continued use of the service after such changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="mb-4 font-semibold text-2xl">14. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or wish to
              exercise your rights, please contact us through our support
              channels. We will respond to your inquiry within 30 days.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
