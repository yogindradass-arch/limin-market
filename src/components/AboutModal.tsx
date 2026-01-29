interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-limin-primary to-orange-600 px-8 pt-8 pb-6 rounded-t-2xl text-white">
            <div className="text-5xl mb-3">🇬🇾</div>
            <h2 className="text-3xl font-bold mb-2">Limin Market</h2>
            <p className="text-lg opacity-90">Where Guyana Limes & Trades</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <section>
              <h3 className="text-lg font-bold text-limin-dark mb-3">What is Limin Market?</h3>
              <p className="text-gray-700 leading-relaxed">
                Limin Market is Guyana's homegrown online marketplace where you can buy, sell, and trade
                anything from electronics to furniture, vehicles to clothing. Built by Guyanese, for Guyanese.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-limin-dark mb-3">How it Works</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-limin-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-limin-primary font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-gray-700"><strong>Browse listings</strong> from across Guyana</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-limin-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-limin-primary font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-gray-700"><strong>Call sellers directly</strong> - no messaging hassle</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-limin-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-limin-primary font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-gray-700"><strong>Meet up & trade</strong> - simple and straightforward</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-limin-dark mb-3">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To connect Guyanese buyers and sellers in every corner of the country, from Georgetown
                to Lethem. We're making it easier than ever to find great deals, support local businesses,
                and build stronger communities through trade.
              </p>
            </section>

            <section className="bg-limin-primary/5 rounded-xl p-4 border-l-4 border-limin-primary">
              <p className="text-sm text-gray-700">
                <strong className="text-limin-dark">Why "Limin"?</strong><br />
                In Guyanese culture, "limin" means hanging out, relaxing, and connecting with others.
                That's exactly what our marketplace is about - bringing people together!
              </p>
            </section>

            <section className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Made with ❤️ for Guyana
              </p>
              <p className="text-xs text-gray-500 mt-1">Version 1.0.0</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
