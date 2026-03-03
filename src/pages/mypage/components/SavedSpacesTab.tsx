import { useFavorites } from '../../../hooks/useFavorites';

export default function SavedSpacesTab() {
  const { favorites, loading, removeFavorite } = useFavorites();

  const handleRemove = async (favoriteId: string) => {
    await removeFavorite(favoriteId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">총 <strong className="text-gray-900">{favorites.length}개</strong>의 저장된 매장</p>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
            <i className="ri-bookmark-line text-2xl text-gray-400"></i>
          </div>
          <p className="text-gray-500 text-sm">저장된 매장이 없어요</p>
          <p className="text-gray-400 text-xs mt-1">마음에 드는 매장을 저장해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map(favorite => {
            const space = favorite.space as any;
            const savedDate = new Date(favorite.created_at).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric'
            });

            return (
              <div key={favorite.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative h-40 overflow-hidden">
                  {space.floor_plan_url ? (
                    <img
                      src={space.floor_plan_url}
                      alt={space.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <i className="ri-store-2-line text-4xl text-gray-400"></i>
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(favorite.id)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm cursor-pointer hover:bg-red-50 transition-colors"
                  >
                    <i className="ri-bookmark-fill text-amber-500 text-sm"></i>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{space.name}</h3>
                  <p className="text-xs text-gray-400 mb-2">
                    <i className="ri-map-pin-line mr-1"></i>{space.address}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{savedDate} 저장</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
