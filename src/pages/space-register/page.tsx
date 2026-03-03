
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SpaceRegisterForm from './components/SpaceRegisterForm';

interface RegisteredSpace {
  id: string;
  name: string;
  address: string;
  type: string;
}

export default function SpaceRegisterPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [registeredSpace, setRegisteredSpace] = useState<RegisteredSpace | null>(null);
  const [countdown, setCountdown] = useState(3);

  const goToLayoutEditor = (space: RegisteredSpace) => {
    const params = new URLSearchParams({
      spaceId: space.id,
      spaceName: space.name,
      spaceType: space.type,
      spaceAddress: space.address,
      isNew: 'true',
    });
    navigate(`/layout-editor?${params.toString()}`);
  };

  // 등록 완료 후 3초 카운트다운 → 좌석 에디터로 자동 이동
  useEffect(() => {
    if (!success || !registeredSpace) return;
    if (countdown <= 0) {
      goToLayoutEditor(registeredSpace);
      return;
    }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [success, countdown, registeredSpace]);

  const handleSuccess = (spaceId: string, spaceName: string, spaceAddress: string, spaceType: string) => {
    setRegisteredSpace({ id: spaceId, name: spaceName, address: spaceAddress, type: spaceType });
    setSuccess(true);
  };

  if (success && registeredSpace) {
    return (
      <div className="min-h-screen bg-white font-sans flex flex-col">
        {/* 헤더 */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-lg text-gray-700"></i>
            </button>
            <a href="/" className="flex items-center">
              <img
                src="https://static.readdy.ai/image/cc9e82def12023b7995899e43f92dbd6/e86db5a38ffdb2df4649ee0d6ea04809.svg"
                alt="Stillog"
                className="h-6 w-auto"
              />
            </a>
            <div className="w-9" />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 pt-14">
          <div className="max-w-sm w-full text-center py-12">
            {/* 성공 아이콘 */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center">
                <i className="ri-store-2-line text-4xl text-teal-500"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                <i className="ri-check-line text-white text-base"></i>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">매장 등록 완료!</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-1">
              <strong className="text-gray-800">{registeredSpace.name}</strong>이(가) DB에 저장됐어요.
            </p>
            <p className="text-gray-400 text-xs leading-relaxed mb-8">
              이제 좌석 배치를 직접 그려주세요 ✏️
            </p>

            {/* 좌석 지도 그리기 메인 CTA */}
            <div className="mb-5 p-5 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl text-left shadow-lg">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-xl flex-shrink-0">
                  <i className="ri-layout-grid-line text-white text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white mb-0.5">좌석 배치 에디터</p>
                  <p className="text-xs text-teal-100 leading-relaxed">
                    매장 평면도에 좌석, 구역, 창문, 출입구를 직접 배치해보세요. 리뷰어들이 정확한 자리를 찾을 수 있어요.
                  </p>
                </div>
              </div>
              <button
                onClick={() => goToLayoutEditor(registeredSpace)}
                className="w-full py-3 bg-white text-teal-700 text-sm font-bold rounded-xl hover:bg-teal-50 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-sm"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-pencil-ruler-2-line text-sm"></i>
                </div>
                지금 바로 좌석 배치 그리기
              </button>
            </div>

            {/* 자동 이동 카운트다운 */}
            <div className="flex items-center justify-center gap-2 mb-6 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-500 text-white text-sm font-bold flex-shrink-0">
                {countdown}
              </div>
              <p className="text-xs text-gray-500 text-left">
                <span className="font-semibold text-gray-700">{countdown}초 후</span> 좌석 배치 에디터로 자동 이동해요
              </p>
            </div>

            {/* 보조 버튼들 */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    spaceId: registeredSpace.id,
                    spaceName: registeredSpace.name,
                    spaceType: registeredSpace.type,
                    spaceAddress: registeredSpace.address,
                    isNew: 'true',
                  });
                  navigate(`/space/${registeredSpace.id}?${params.toString()}`);
                }}
                className="w-full py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-store-2-line text-sm"></i>
                </div>
                매장 페이지 먼저 보기
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer py-1"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line text-lg text-gray-700"></i>
          </button>
          <a href="/" className="flex items-center">
            <img
              src="https://static.readdy.ai/image/cc9e82def12023b7995899e43f92dbd6/e86db5a38ffdb2df4649ee0d6ea04809.svg"
              alt="Stillog"
              className="h-6 w-auto"
            />
          </a>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-12">
        {/* 페이지 타이틀 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1.5">매장 등록</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            카카오맵에서 매장을 검색하면<br />
            정보가 자동으로 입력돼요
          </p>
        </div>

        {/* 흐름 안내 배너 */}
        <div className="flex items-center gap-0 mb-6 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="flex-1 flex flex-col items-center py-3 px-2 border-r border-gray-100">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-100 mb-1">
              <i className="ri-search-line text-teal-600 text-sm"></i>
            </div>
            <span className="text-[11px] font-semibold text-gray-700">매장 검색</span>
            <span className="text-[10px] text-gray-400">카카오맵</span>
          </div>
          <div className="w-5 h-5 flex items-center justify-center text-gray-300 flex-shrink-0">
            <i className="ri-arrow-right-s-line text-base"></i>
          </div>
          <div className="flex-1 flex flex-col items-center py-3 px-2 border-r border-gray-100">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-100 mb-1">
              <i className="ri-database-2-line text-teal-600 text-sm"></i>
            </div>
            <span className="text-[11px] font-semibold text-gray-700">자동 저장</span>
            <span className="text-[10px] text-gray-400">DB 등록</span>
          </div>
          <div className="w-5 h-5 flex items-center justify-center text-gray-300 flex-shrink-0">
            <i className="ri-arrow-right-s-line text-base"></i>
          </div>
          <div className="flex-1 flex flex-col items-center py-3 px-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-500 mb-1">
              <i className="ri-layout-grid-line text-white text-sm"></i>
            </div>
            <span className="text-[11px] font-semibold text-teal-700">좌석 배치</span>
            <span className="text-[10px] text-teal-400">직접 그리기</span>
          </div>
        </div>

        {/* 폼 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <SpaceRegisterForm
            onSuccess={handleSuccess}
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
          <i className="ri-shield-check-line"></i>
          <span>개인정보는 안전하게 보호됩니다</span>
        </div>
      </main>
    </div>
  );
}
