import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-zinc-900">WIZIDEE Demo</h1>
          <p className="mt-2 text-zinc-500">
            Document capture and recognition powered by the WIZIDEE API.
          </p>
        </div>

        {/* Video Call card */}
        <div className="mb-8">
          <Link
            href="/video-call"
            className="group block bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6 hover:border-purple-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                VC
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900 group-hover:text-purple-600 transition-colors">
                  Video Call
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  One-to-one video calls powered by LiveKit with document capture
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Use case cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/uc1"
            className="group block bg-white rounded-xl border border-zinc-200 p-6 hover:border-blue-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                UC1
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                  Identity Verification
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  CNI / Passport — Extract name, date of birth, expiry, MRZ
                </p>
              </div>
            </div>
          </Link>

          {/* Placeholder cards for upcoming use cases */}
          {[
            { id: 'UC2', label: 'Proof of Address', desc: 'EDF / Telecom / Tax notice' },
            { id: 'UC3', label: 'Proof of Income', desc: 'Pay slips / Tax notice' },
            { id: 'UC4', label: 'Bank Account (RIB)', desc: 'IBAN / BIC extraction' },
          ].map(({ id, label, desc }) => (
            <div
              key={id}
              className="block bg-white rounded-xl border border-zinc-100 p-6 opacity-50 cursor-not-allowed"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 font-bold text-sm">
                  {id}
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-500">{label}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{desc}</p>
                  <span className="mt-2 inline-block text-xs text-zinc-400">Coming soon</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
