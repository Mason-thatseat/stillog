import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSpace } from '../../hooks/useSpaces';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import SpaceHeader from './components/SpaceHeader';
import SpaceStats from './components/SpaceStats';
import SpaceSeatMap from './components/SpaceSeatMap';
import SpaceReviewList from './components/SpaceReviewList';

export default function SpacePage() {
  const { id } = useParams<{ id: string }>();
  const { space, loading, error } = useSpace(id || '');
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <i className="ri-error-warning-line text-6xl text-gray-400 mb-4"></i>
            <p className="text-gray-600 text-lg">매장을 찾을 수 없습니다</p>
            <a
              href="/"
              className="mt-4 inline-block text-teal-600 hover:underline"
            >
              홈으로 돌아가기
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="pt-20">
        <SpaceHeader space={space!} />
        <SpaceStats spaceId={space!.id} />
        <SpaceSeatMap
          spaceId={space!.id}
          reviews={[]}
          onSeatSelect={(seatId: string) => setSelectedSeatId(seatId)}
          selectedSeatId={selectedSeatId}
        />
        <SpaceReviewList spaceId={space!.id} />
      </main>

      <Footer />
    </div>
  );
}
