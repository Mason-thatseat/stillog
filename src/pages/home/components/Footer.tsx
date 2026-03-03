
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <footer id="pricing" className="py-14 sm:py-20 bg-gradient-to-br from-accent-500 to-accent-600">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 sm:gap-12 mb-12 sm:mb-16">
          {/* Left: brand + subscribe */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
              Stillog와 함께<br />공간을 재발견하세요
            </h2>
            <p className="text-white/80 text-sm">
              매주 새로운 인사이트를 이메일로 받아보세요
            </p>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="footer-email" className="block text-sm text-white/80 mb-2">
                  이메일 주소
                </label>
                <input
                  type="email"
                  id="footer-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-transparent border-b-2 border-white/30 focus:border-white text-white placeholder-white/50 py-2.5 sm:py-3 outline-none transition-colors text-sm"
                />
              </div>
              {submitted ? (
                <p className="text-white font-medium text-sm">구독해 주셔서 감사합니다! 🎉</p>
              ) : (
                <button
                  type="submit"
                  className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-white text-white rounded-full font-medium hover:bg-white hover:text-accent-500 transition-all whitespace-nowrap cursor-pointer text-sm"
                >
                  구독하기
                </button>
              )}
            </form>
          </div>

          {/* Right: links */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
              <div>
                <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">서비스</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><a href="#" className="text-white/80 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer">리뷰 작성</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer">매장 찾기</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer">히트맵 보기</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer">앱 다운로드</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">B2B</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><a href="#" className="text-white/80 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer">사업자 대시보드</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer">요금제</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer">도입 문의</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer">파트너십</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">회사</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><a href="#" className="text-white/80 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer">회사 소개</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer">채용</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer">블로그</a></li>
                  <li><a href="#" className="text-white/80 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer">문의하기</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-white/60 text-xs sm:text-sm">
              © 2025 Stillog. All rights reserved.
            </div>
            <div className="flex items-center gap-5 sm:gap-6">
              <a href="#" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                <i className="ri-facebook-circle-line text-xl"></i>
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                <i className="ri-twitter-x-line text-xl"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
