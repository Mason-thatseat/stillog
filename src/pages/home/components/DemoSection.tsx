
export default function DemoSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative bg-gradient-to-br from-primary-100 to-primary-200 flex items-end min-h-[300px] sm:min-h-[500px] lg:min-h-[600px]">
            <img
              src="https://readdy.ai/api/search-image?query=modern%20mobile%20app%20interface%20showing%20restaurant%20seating%20heatmap%20with%20color%20gradient%20visualization%20clean%20ui%20design%20professional%20mockup%20soft%20beige%20background%20realistic%20phone%20screen&width=600&height=800&seq=stillog-demo-screen&orientation=portrait"
              alt="실제 사용 화면"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            <div className="relative z-10 text-white p-6 sm:p-10">
              <div className="text-sm font-medium mb-2 sm:mb-3 opacity-90">실제 사용 화면</div>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
                한눈에 보는<br />좌석 히트맵
              </h2>
            </div>
          </div>

          <div className="bg-white p-8 sm:p-12 flex flex-col justify-center items-center text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              지금 바로<br />시작하세요
            </h2>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8 max-w-md">
              별도의 가입 절차 없이 소셜 로그인으로<br className="hidden sm:block" />
              바로 리뷰를 작성할 수 있습니다
            </p>

            <button className="px-8 sm:px-10 py-3 sm:py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all flex items-center gap-3 whitespace-nowrap cursor-pointer text-sm sm:text-base">
              무료로 시작하기
              <i className="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
