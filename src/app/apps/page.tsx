import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'App Partnerships - iPartner', description: 'Collaborate on application development and distribution.' };

const features = [
  { title: 'App Development', desc: 'Access resources, APIs, and expertise to build world-class applications from concept to launch.' },
  { title: 'Distribution Network', desc: 'Leverage our global network to distribute your apps to millions of potential users.' },
  { title: 'Revenue Sharing', desc: 'Earn revenue through our equity-based model with transparent compensation structures.' },
];

export default function AppsPage() {
  return (
    <>
      <section className="relative hero-gradient-green py-20 sm:py-28 lg:py-32 px-4 text-white overflow-hidden">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-emerald-200 text-sm font-medium mb-8">Build & Ship Apps</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">App Partnerships</h1>
          <p className="mt-6 text-lg sm:text-xl text-emerald-100/70 max-w-2xl mx-auto leading-relaxed">Collaborate on application development, distribution, and monetization with our partnership network.</p>
          <div className="mt-10"><Link href="/apps/apply" className="inline-flex items-center justify-center bg-emerald-400 text-black px-8 py-4 rounded-xl text-lg font-bold hover:bg-emerald-300 transition-all shadow-lg">Apply Now <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></Link></div>
        </div>
      </section>
      <section className="py-20 sm:py-24 px-4 bg-[#0D1210]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14"><h2 className="text-3xl sm:text-4xl font-bold text-white">App Partnership Benefits</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-[#111916] border border-[#1E2D25] rounded-2xl p-6 sm:p-7 hover:border-green-500/30 transition-all card-hover glow-border">
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-[#5A6E62] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center"><Link href="/apps/apply" className="inline-flex items-center justify-center bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20">Start Your App Partnership</Link></div>
        </div>
      </section>
    </>
  );
}
