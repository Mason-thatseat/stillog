
export default function TestimonialSection() {
  return (
    <section className="py-16 sm:py-24 bg-primary-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 items-center">
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 bg-accent-500 rounded-full"></span>
              고객 후기
            </div>

            <div className="relative">
              <i className="ri-double-quotes-l text-5xl sm:text-6xl text-accent-500/20 absolute -top-4 -left-2"></i>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight relative z-10">
                창가 자리를 찾는 데<br />
                더 이상 시간을<br />
                낭비하지 않아요
              </h2>
            </div>

            <div className="flex items-center gap-4 pt-2 sm:pt-4">
              <div>
                <div className="font-bold text-gray-900 text-base sm:text-lg">김지수</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">Google</span>
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    <i className="ri-star-fill text-sm"></i>
                    <i className="ri-star-fill text-sm"></i>
                    <i className="ri-star-fill text-sm"></i>
                    <i className="ri-star-fill text-sm"></i>
                    <i className="ri-star-fill text-sm"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-3xl overflow-hidden shadow-2xl max-w-xs mx-auto lg:max-w-none">
              <img
                src="https://readdy.ai/api/search-image?query=professional%20portrait%20of%20young%20korean%20woman%20in%20modern%20cafe%20looking%20slightly%20upward%20natural%20lighting%20soft%20beige%20tones%20warm%20atmosphere%20shoulder%20up%20frame%20contemporary%20style&width=500&height=700&seq=stillog-testimonial&orientation=portrait"
                alt="김지수"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
