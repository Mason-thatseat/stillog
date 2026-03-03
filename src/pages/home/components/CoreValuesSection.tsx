
import { coreFeatures } from '../../../mocks/features';

export default function CoreValuesSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-primary-50 px-4 py-1.5 rounded-full mb-4 sm:mb-5">
            <span className="w-1.5 h-1.5 bg-accent-500 rounded-full"></span>
            왜 Stillog인가?
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">
            좌석 데이터가 만드는<br />새로운 공간 인사이트
          </h2>
          <p className="mt-3 sm:mt-4 text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
            사용자는 10초 리뷰만, 나머지는 자동으로 — 쌓인 데이터가 공간의 가치를 바꿉니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
          {coreFeatures.map((feature) => (
            <div
              key={feature.id}
              className={`rounded-3xl p-7 sm:p-10 transition-transform hover:scale-105 ${
                feature.theme === 'dark'
                  ? 'bg-gray-900 text-white'
                  : 'bg-primary-50 text-gray-900'
              }`}
            >
              <div className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl mb-5 sm:mb-6 ${
                feature.theme === 'dark' ? 'bg-white/10' : 'bg-white'
              }`}>
                <i className={`${feature.icon} text-2xl sm:text-3xl ${
                  feature.theme === 'dark' ? 'text-white' : 'text-accent-500'
                }`}></i>
              </div>

              <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${
                feature.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {feature.title}
              </h3>

              <p className={`text-sm sm:text-base leading-relaxed mb-5 sm:mb-6 ${
                feature.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {feature.description}
              </p>

              <a
                href="#"
                className={`inline-flex items-center gap-2 text-sm font-medium ${
                  feature.theme === 'dark' ? 'text-white' : 'text-gray-900'
                } hover:gap-3 transition-all cursor-pointer`}
              >
                자세히 보기
                <i className="ri-arrow-right-line"></i>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
