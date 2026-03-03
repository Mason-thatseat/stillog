import { Space } from '../../../hooks/useSpaces';

interface SpaceHeaderProps {
  space: Space;
}

export default function SpaceHeader({ space }: SpaceHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{space.name}</h1>
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <i className="ri-map-pin-line text-teal-600"></i>
                <span>{space.address}</span>
              </div>
            </div>
          </div>

          <a
            href={`/review?space=${space.id}`}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-edit-line"></i>
            리뷰 작성
          </a>
        </div>
      </div>
    </div>
  );
}
