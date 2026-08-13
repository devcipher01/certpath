import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({ meta: [{ title: "Terms and Conditions — CertifyPath" }, { name: "robots", content: "noindex" }] }),
});

function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-2xl font-semibold">Terms and Conditions</h1>

        <section className="mt-6 space-y-4 text-sm text-muted-foreground">
          <p>
            Welcome to CertifyPath. These Terms and Conditions ("Terms") govern your access to and use of
            our website, learning content, exams, and certification services. By purchasing a course or
            certification, enrolling in lessons, or using any feature on the site, you agree to these Terms.
          </p>

          <h2 className="mt-4 text-lg font-medium text-foreground">Purchases and Access</h2>
          <p>
            When you purchase a course, certification, or bundle, you gain access to the specified lessons,
            quizzes, and (where applicable) the certification exam. Access is granted electronically and is
            available immediately after payment confirmation from the selected payment provider.
          </p>

          <h2 className="mt-4 text-lg font-medium text-foreground">User Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and for all activities
            that occur under your account. You agree to use the course materials only for lawful, personal,
            non-commercial purposes unless otherwise agreed in writing.
          </p>

          <h2 className="mt-4 text-lg font-medium text-foreground">Exams and Certification</h2>
          <p>
            Certification is issued to the named recipient following successful completion of the applicable
            exam or the attestation route. Certificates are unique and can be verified using the
            certificate validation code provided after purchase.
          </p>

          <h2 className="mt-4 text-lg font-medium text-foreground">No Refunds After Delivery</h2>
          <p>
            <strong>Important:</strong> Once payment is completed and access to lessons, exams, or any
            digital materials has been granted, all sales are final. Because course content and exams are
            delivered immediately and can be accessed or downloaded, we do not offer refunds after payment.
            By completing your purchase you acknowledge that you have received immediate access to the
            purchased materials and that you waive any right to a refund for that purchase.
          </p>

          <h2 className="mt-4 text-lg font-medium text-foreground">Support and Disputes</h2>
          <p>
            If you encounter technical issues, billing problems, or questions about your access, contact our
            support team via the contact information in your receipt. We will make reasonable efforts to help
            resolve issues. In the event of a payment dispute, we will rely on the transaction records from
            the payment provider and our internal logs to investigate.
          </p>

          <h2 className="mt-4 text-lg font-medium text-foreground">Changes to Terms</h2>
          <p>
            We may update these Terms periodically. Material changes will be posted on this page with a
            revised effective date. Continued use of the site after changes constitutes acceptance of the
            updated Terms.
          </p>

          <p className="mt-6 text-xs text-muted-foreground">
            <Link to="/courses" className="text-primary underline">Back to courses</Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
