import { useState, useRef } from 'react';
import { useAuthStore } from '../../../store/authStore';

interface SignupModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 80 }, (_, i) => CURRENT_YEAR - 14 - i);

const OWNER_SUBMIT_ADDR = 'https://readdy.ai/api/form/d6j5qkqpaf6ievb719ng';

type AccountType = 'user' | 'owner' | null;

export default function SignupModal({ onClose, onSwitchToLogin }: SignupModalProps) {
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuthStore();

  // 오너 전용
  const [bizName, setBizName] = useState('');
  const [bizNumber, setBizNumber] = useState('');
  const [bizFile, setBizFile] = useState<File | null>(null);
  const [bizFilePreview, setBizFilePreview] = useState<string | null>(null);
  const [ownerSubmitting, setOwnerSubmitting] = useState(false);
  const bizFileRef = useRef<HTMLInputElement>(null);

  const totalSteps = accountType === 'owner' ? 3 : 2;

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = '올바른 이메일을 입력해주세요.';
    if (!password || password.length < 8) errs.password = '비밀번호는 8자 이상이어야 해요.';
    if (password !== passwordConfirm) errs.passwordConfirm = '비밀번호가 일치하지 않아요.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!birthYear) errs.birthYear = '출생연도를 선택해주세요.';
    if (!agreeTerms) errs.agreeTerms = '이용약관에 동의해주세요.';
    if (!agreePrivacy) errs.agreePrivacy = '개인정보 처리방침에 동의해주세요.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!bizName.trim()) errs.bizName = '상호명을 입력해주세요.';
    if (!bizNumber.trim()) errs.bizNumber = '사업자등록번호를 입력해주세요.';
    else if (!/^\d{3}-\d{2}-\d{5}$/.test(bizNumber.trim())) errs.bizNumber = '000-00-00000 형식으로 입력해주세요.';
    if (!bizFile) errs.bizFile = '사업자등록증을 첨부해주세요.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSelectType = (type: AccountType) => {
    setAccountType(type);
    setStep(1);
  };

  const handleNext = async () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2) {
      if (!validateStep2()) return;
      if (accountType === 'owner') {
        setStep(3);
      } else {
        // 일반 회원 가입 처리
        setLoading(true);
        try {
          await signup(email.trim(), password, nickname.trim() || undefined);
          setDone(true);
        } catch (err: any) {
          setErrors({ general: err.message || '회원가입에 실패했어요.' });
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleOwnerSubmit = async () => {
    if (!validateStep3()) return;
    setOwnerSubmitting(true);
    try {
      // 먼저 Supabase 회원가입
      await signup(email.trim(), password, nickname.trim() || undefined);

      // 오너 신청 폼 제출
      const params = new URLSearchParams();
      params.append('email', email);
      params.append('nickname', nickname || '미입력');
      params.append('birthYear', birthYear);
      params.append('bizName', bizName);
      params.append('bizNumber', bizNumber);
      params.append('bizFile', bizFile ? '첨부됨 (수집 불가)' : '없음');
      await fetch(OWNER_SUBMIT_ADDR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      setDone(true);
    } catch (err: any) {
      setErrors({ general: err.message || '가입 신청에 실패했어요.' });
    } finally {
      setOwnerSubmitting(false);
    }
  };

  const handleBizFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBizFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => setBizFilePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setBizFilePreview(null);
    }
    if (errors.bizFile) setErrors(prev => ({ ...prev, bizFile: '' }));
  };

  const formatBizNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  };

  // 스텝 인디케이터 (step 0 제외)
  const renderStepIndicator = () => {
    if (step === 0 || done) return null;
    return (
      <div className="flex items-center gap-2 mt-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              step >= i + 1 ? 'bg-gray-900 w-6' : 'bg-gray-200 w-4'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-1">
          <img
            src="https://static.readdy.ai/image/cc9e82def12023b7995899e43f92dbd6/e86db5a38ffdb2df4649ee0d6ea04809.svg"
            alt="Stillog"
            className="h-7 w-auto mb-1"
          />
          {!done && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">
                {step === 0 ? '회원가입' : step === 3 ? '사업자 인증' : '회원가입'}
              </h2>
              {renderStepIndicator()}
            </>
          )}
        </div>

        {/* 전역 에러 메시지 */}
        {errors.general && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <i className="ri-error-warning-line text-red-500 text-sm"></i>
            </div>
            <p className="text-xs text-red-600">{errors.general}</p>
          </div>
        )}

        {/* ── DONE ── */}
        {done ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-900">
              <i className="ri-check-line text-2xl text-white"></i>
            </div>
            {accountType === 'owner' ? (
              <>
                <p className="text-base font-semibold text-gray-900 text-center">신청이 완료됐어요!</p>
                <div className="w-full px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong className="block mb-1">매장 오너 심사 중</strong>
                    사업자등록증 검토 후 1~2 영업일 내에<br />
                    이메일로 승인 결과를 안내해 드려요.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-gray-900">가입이 완료됐어요!</p>
                <p className="text-sm text-gray-500 text-center">
                  {nickname ? `${nickname}님, ` : ''}Stillog에 오신 걸 환영해요.
                </p>
              </>
            )}
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-black transition-all cursor-pointer whitespace-nowrap"
            >
              시작하기
            </button>
          </div>

        /* ── STEP 0: 회원 유형 선택 ── */
        ) : step === 0 ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500 text-center -mt-2">어떤 목적으로 가입하시나요?</p>

            {/* 일반 회원 */}
            <button
              onClick={() => handleSelectType('user')}
              className="group flex items-start gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-gray-900 hover:bg-gray-50 transition-all cursor-pointer text-left"
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 group-hover:bg-gray-900 transition-colors flex-shrink-0">
                <i className="ri-user-line text-xl text-gray-600 group-hover:text-white transition-colors"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 mb-0.5">일반 회원</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  카페·식당 좌석 리뷰를 작성하고<br />
                  다른 사람의 후기를 확인해요.
                </p>
              </div>
              <div className="w-5 h-5 flex items-center justify-center text-gray-300 group-hover:text-gray-900 transition-colors mt-0.5">
                <i className="ri-arrow-right-s-line text-lg"></i>
              </div>
            </button>

            {/* 매장 오너 */}
            <button
              onClick={() => handleSelectType('owner')}
              className="group flex items-start gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-gray-900 hover:bg-gray-50 transition-all cursor-pointer text-left"
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-amber-50 group-hover:bg-gray-900 transition-colors flex-shrink-0">
                <i className="ri-store-2-line text-xl text-amber-500 group-hover:text-white transition-colors"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 mb-0.5">
                  매장 오너
                  <span className="ml-2 text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">사업자 인증 필요</span>
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  내 매장을 직접 등록·관리하고<br />
                  좌석 지도를 편집할 수 있어요.
                </p>
              </div>
              <div className="w-5 h-5 flex items-center justify-center text-gray-300 group-hover:text-gray-900 transition-colors mt-0.5">
                <i className="ri-arrow-right-s-line text-lg"></i>
              </div>
            </button>

            <p className="text-xs text-gray-400 text-center">
              이미 계정이 있으신가요?{' '}
              <button onClick={onSwitchToLogin} className="underline cursor-pointer text-gray-600 hover:text-gray-900">
                로그인
              </button>
            </p>
          </div>

        /* ── STEP 1: 이메일 + 비밀번호 ── */
        ) : step === 1 ? (
          <div className="flex flex-col gap-4">
            {accountType === 'owner' && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-store-2-line text-amber-500 text-sm"></i>
                </div>
                <p className="text-xs text-amber-700 font-medium">매장 오너로 가입 중이에요</p>
              </div>
            )}

            <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
              <i className="ri-shield-check-line text-gray-500 mt-0.5 text-sm"></i>
              <p className="text-xs text-gray-500 leading-relaxed">
                이름·전화번호·주소는 수집하지 않아요. 최소한의 정보만으로 가입할 수 있어요.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition-colors ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'}`}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="8자 이상 입력"
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition-colors pr-10 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'}`}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer w-5 h-5 flex items-center justify-center">
                  <i className={showPw ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">비밀번호 확인</label>
              <div className="relative">
                <input
                  type={showPwConfirm ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition-colors pr-10 ${errors.passwordConfirm ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'}`}
                />
                <button type="button" onClick={() => setShowPwConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer w-5 h-5 flex items-center justify-center">
                  <i className={showPwConfirm ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
              {errors.passwordConfirm && <p className="text-xs text-red-500">{errors.passwordConfirm}</p>}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-black transition-all cursor-pointer whitespace-nowrap mt-1"
            >
              다음
            </button>

            <button onClick={() => { setStep(0); setErrors({}); }} className="text-xs text-gray-400 hover:text-gray-600 text-center cursor-pointer transition-colors">
              ← 회원 유형 다시 선택
            </button>
          </div>

        /* ── STEP 2: 출생연도 + 닉네임 + 약관 ── */
        ) : step === 2 ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                출생연도 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={birthYear}
                  onChange={e => setBirthYear(e.target.value)}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none appearance-none bg-white transition-colors cursor-pointer ${errors.birthYear ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'}`}
                >
                  <option value="">출생연도 선택</option>
                  {BIRTH_YEARS.map(y => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
              {errors.birthYear && <p className="text-xs text-red-500">{errors.birthYear}</p>}
              <p className="text-xs text-gray-400">만 14세 미만은 가입이 제한돼요.</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                닉네임 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="사용할 닉네임 입력"
                maxLength={20}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-colors"
              />
              <p className="text-xs text-gray-400">미입력 시 자동 닉네임이 부여돼요.</p>
            </div>

            <div className="flex flex-col gap-2 border border-gray-100 rounded-xl p-3 bg-gray-50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms && agreePrivacy}
                  onChange={e => { setAgreeTerms(e.target.checked); setAgreePrivacy(e.target.checked); }}
                  className="w-4 h-4 accent-gray-900 cursor-pointer"
                />
                <span className="text-xs font-medium text-gray-700">전체 동의</span>
              </label>
              <div className="h-px bg-gray-200" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="w-4 h-4 accent-gray-900 cursor-pointer" />
                <span className="text-xs text-gray-600"><span className="text-red-400">[필수]</span> 이용약관 동의</span>
                <span className="ml-auto text-xs text-gray-400 underline cursor-pointer">보기</span>
              </label>
              {errors.agreeTerms && <p className="text-xs text-red-500 pl-6">{errors.agreeTerms}</p>}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={agreePrivacy} onChange={e => setAgreePrivacy(e.target.checked)} className="w-4 h-4 accent-gray-900 cursor-pointer" />
                <span className="text-xs text-gray-600"><span className="text-red-400">[필수]</span> 개인정보 처리방침 동의</span>
                <span className="ml-auto text-xs text-gray-400 underline cursor-pointer">보기</span>
              </label>
              {errors.agreePrivacy && <p className="text-xs text-red-500 pl-6">{errors.agreePrivacy}</p>}
            </div>

            {accountType === 'owner' && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-file-text-line text-amber-500 text-sm"></i>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  다음 단계에서 <strong>사업자등록증</strong>을 첨부해야 해요.<br />
                  심사 후 매장 오너 권한이 부여돼요.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => { setStep(1); setErrors({}); }} className="flex-1 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap">
                이전
              </button>
              <button 
                onClick={handleNext}
                disabled={loading}
                className="flex-1 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-black transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <><i className="ri-loader-4-line animate-spin text-sm"></i> 처리 중...</>
                ) : (accountType === 'owner' ? '다음' : '가입 완료')}
              </button>
            </div>
          </div>

        /* ── STEP 3: 사업자등록증 (오너 전용) ── */
        ) : (
          <form
            data-readdy-form
            id="owner-signup-form"
            onSubmit={e => { e.preventDefault(); handleOwnerSubmit(); }}
            className="flex flex-col gap-4"
          >
            {/* 안내 배너 */}
            <div className="flex items-start gap-3 px-3 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="w-8 h-8 flex items-center justify-center bg-amber-100 rounded-lg flex-shrink-0">
                <i className="ri-file-text-line text-amber-600 text-base"></i>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-800 mb-0.5">사업자 인증이 필요해요</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  매장 오너는 사업자등록증 확인 후<br />
                  권한이 부여돼요. (1~2 영업일 소요)
                </p>
              </div>
            </div>

            {/* 상호명 */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                상호명 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="bizName"
                value={bizName}
                onChange={e => { setBizName(e.target.value); if (errors.bizName) setErrors(p => ({ ...p, bizName: '' })); }}
                placeholder="사업자등록증상 상호명"
                className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition-colors ${errors.bizName ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'}`}
              />
              {errors.bizName && <p className="text-xs text-red-500">{errors.bizName}</p>}
            </div>

            {/* 사업자등록번호 */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                사업자등록번호 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="bizNumber"
                value={bizNumber}
                onChange={e => { setBizNumber(formatBizNumber(e.target.value)); if (errors.bizNumber) setErrors(p => ({ ...p, bizNumber: '' })); }}
                placeholder="000-00-00000"
                maxLength={12}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition-colors ${errors.bizNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'}`}
              />
              {errors.bizNumber && <p className="text-xs text-red-500">{errors.bizNumber}</p>}
            </div>

            {/* 사업자등록증 첨부 */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                사업자등록증 첨부 <span className="text-red-400">*</span>
              </label>
              <input
                ref={bizFileRef}
                type="file"
                name="bizFile"
                accept="image/*,.pdf"
                onChange={handleBizFileChange}
                className="hidden"
              />
              {bizFile ? (
                <div className={`relative border rounded-xl overflow-hidden ${errors.bizFile ? 'border-red-400' : 'border-gray-200'}`}>
                  {bizFilePreview ? (
                    <img src={bizFilePreview} alt="사업자등록증 미리보기" className="w-full h-32 object-cover object-top" />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg flex-shrink-0">
                        <i className="ri-file-pdf-line text-gray-600 text-base"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{bizFile.name}</p>
                        <p className="text-xs text-gray-400">{(bizFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setBizFile(null); setBizFilePreview(null); }}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/60 text-white rounded-full cursor-pointer hover:bg-black/80 transition-all"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bizFileRef.current?.click()}
                  className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-all ${errors.bizFile ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-400'}`}
                >
                  <div className="w-8 h-8 flex items-center justify-center text-gray-400 mb-1.5">
                    <i className="ri-upload-cloud-line text-2xl"></i>
                  </div>
                  <span className="text-xs font-medium text-gray-600">파일 선택하기</span>
                  <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, PDF (최대 10MB)</span>
                </button>
              )}
              {errors.bizFile && <p className="text-xs text-red-500">{errors.bizFile}</p>}
              <p className="text-xs text-gray-400 leading-relaxed">
                사업자등록증 원본 또는 사본을 첨부해주세요.<br />
                개인정보는 인증 목적으로만 사용돼요.
              </p>
            </div>

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => { setStep(2); setErrors({}); }}
                className="flex-1 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={ownerSubmitting}
                className="flex-1 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-black transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {ownerSubmitting ? (
                  <><i className="ri-loader-4-line animate-spin text-sm"></i> 제출 중...</>
                ) : '가입 신청'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
