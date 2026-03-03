
import { b2bFeatures } from '../../../mocks/features';

export default function B2BSection() {
  return (
    <section id="b2b" className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:gap-8 mb-10 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">
            사업자를 위한 인사이트
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-md">
            좌석 데이터 기반 경영 의사결정을 지원합니다
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
          {b2bFeatures.map((feature, index) => (
            <div
              key={feature.id}
              className={`rounded-3xl overflow-hidden ${
                index === 0 ? 'lg:col-span-2' : ''
              } ${
                feature.theme === 'dark' ? 'bg-gray-900' : 'bg-primary-50'
              }`}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    feature.theme === 'dark'
                      ? 'bg-white/10 text-white'
                      : 'bg-accent-500 text-white'
                  }`}>
                    {feature.badge}
                  </span>
                </div>

                <h3 className={`text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 ${
                  feature.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>

                <p className={`text-sm sm:text-base mb-4 sm:mb-6 ${
                  feature.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>

              <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                <div className="rounded-2xl overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                <button className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer text-sm sm:text-base ${
                  feature.theme === 'dark'
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}>
                  {index === 0 ? '자세히 보기' : '도입 문의'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
