import type { Metadata } from 'next';
import ContribForm from '@/components/ContribForm';

export const metadata: Metadata = {
  title: 'Contact - iPartner',
  description: 'Get in touch with the iPartner team.',
};

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'ipartner.com';

const infoCards = [
  { title: 'Partnership Inquiries', desc: 'Interested in partnering with us? Apply through our pages or reach out directly.', icon: '🤝' },
  { title: 'General Questions', desc: 'Have questions about how iPartner works? We\'re here to help.', icon: '❓' },
  { title: 'Technical Support', desc: 'Experiencing issues? Our team will assist you promptly.', icon: '🔧' },
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-[#0A0F0D] py-16 sm:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #15803D 0%, transparent 50%)' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">Get in Touch</h1>
          <p className="mt-4 text-lg text-[#8B9E93] max-w-lg mx-auto">Have a question or interested in a partnership? We&apos;d love to hear from you.</p>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 bg-[#0D1210]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
            <div className="lg:col-span-2 space-y-5">
              {infoCards.map((item) => (
                <div key={item.title} className="bg-[#111916] border border-[#1E2D25] rounded-2xl p-5">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-[#5A6E62] mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="lg:col-span-3">
              <div className="bg-[#111916] rounded-2xl border border-[#1E2D25] p-6 sm:p-8">
                <h2 className="text-xl font-bold text-white mb-6">Send us a message</h2>
                <ContribForm domain={DOMAIN} type="contact" height={500} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
