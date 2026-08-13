import type { Metadata } from "next";
import ContactTicketForm from "@/components/contact/ContactTicketForm";
import { getCurrentPartner } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Contact - iPartner",
  description: "Get in touch with the iPartner team.",
};

const infoCards = [
  {
    title: "Partnership Inquiries",
    desc: "Interested in partnering with us? Apply through our pages or open a ticket here.",
    icon: "🤝",
  },
  {
    title: "General Questions",
    desc: "Have questions about how iPartner works? We are here to help.",
    icon: "❓",
  },
  {
    title: "Technical Support",
    desc: "Experiencing issues? Open a ticket — AI may reply first, and our team can take over.",
    icon: "🔧",
  },
];

export default async function ContactPage() {
  const partner = await getCurrentPartner();
  const defaultName = partner
    ? [partner.firstName, partner.lastName].filter(Boolean).join(" ").trim()
    : "";
  const defaultEmail = partner?.email || "";

  return (
    <>
      <section className="relative overflow-hidden bg-[#0A0F0D] px-4 py-16 sm:py-20">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, #15803D 0%, transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-[#8B9E93]">
            Have a question or interested in a partnership? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="bg-[#0D1210] px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
            <div className="space-y-5 lg:col-span-2">
              {infoCards.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#1E2D25] bg-[#111916] p-5"
                >
                  <div className="mb-3 text-2xl">{item.icon}</div>
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#5A6E62]">{item.desc}</p>
                </div>
              ))}
              <p className="text-sm text-[#5A6E62]">
                Prefer email?{" "}
                <a href="mailto:hello@ipartner.com" className="font-semibold text-[#86efac]">
                  hello@ipartner.com
                </a>
              </p>
            </div>
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-[#1E2D25] bg-[#111916] p-6 sm:p-8">
                <h2 className="mb-6 text-xl font-bold text-white">Send us a message</h2>
                <ContactTicketForm defaultName={defaultName} defaultEmail={defaultEmail} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
