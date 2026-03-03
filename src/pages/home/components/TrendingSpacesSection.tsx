import { useSpaces } from '../../../hooks/useSpaces';

export default function TrendingSpacesSection() {
  const { spaces, loading } = useSpaces();

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">인기 매장</h2>
            <p className="text-gray-600 text-lg">많은 사람들이 찾는 매장을 확인해보세요</p>
          </div>
          <div className="text-center text-gray-500">로딩 중...</div>
        </div>
      </section>
    );
  }

  const displaySpaces = spaces.slice(0, 6);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">인기 매장</h2>
          <p className="text-gray-600 text-lg">많은 사람들이 찾는 매장을 확인해보세요</p>
        </div>

        {displaySpaces.length === 0 ? (
          <div className="text-center text-gray-500">등록된 매장이 없습니다</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displaySpaces.map((space) => (
              <a
                key={space.id}
                href={`/space/${space.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-56 bg-gradient-to-br from-teal-50 to-teal-100 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="ri-store-2-line text-6xl text-teal-400"></i>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <div className="flex items-center gap-1.5">
                      <i className="ri-star-fill text-yellow-400 text-sm"></i>
                      <span className="text-sm font-semibold text-gray-800">
                        {space.avg_rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-teal-600 transition-colors">
                    {space.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 flex items-start gap-2">
                    <i className="ri-map-pin-line text-teal-500 mt-0.5 flex-shrink-0"></i>
                    <span className="line-clamp-2">{space.address}</span>
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      리뷰 {space.review_count || 0}개
                    </span>
                    <span className="text-teal-600 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      자세히 보기
                      <i className="ri-arrow-right-line"></i>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
