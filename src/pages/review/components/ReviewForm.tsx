
import { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

export interface ReviewData {
  rating: number;
  comment: string;
  photoPreview: string | null;
  photoFile: File | null;
}

interface Seat {
  id: string;
  type: string;
  tags: string[];
  rating: number;
  reviewCount: number;
}

interface ReviewFormProps {
  spaceName: string;
  spaceAddress: string;
  seat: Seat;
  onSubmit: (data: ReviewData) => void;
}

const RATING_LABELS = ['', '별로예요', '그저 그래요', '보통이에요', '좋아요', '최고예요!'];

const QUICK_COMMENTS = [
  '콘센트가 있어서 좋았어요',
  '조용해서 집중하기 좋았어요',
  '뷰가 정말 예뻤어요',
  '채광이 좋아서 기분 좋았어요',
  '의자가 편안했어요',
  '소음이 좀 있었어요',
  '자리가 좁은 편이에요',
  '다음에도 이 자리 앉고 싶어요',
];

const typeLabel: Record<string, string> = {
  window: '창가석',
  bar: '바 자리',
  group: '단체석',
  sofa: '소파석',
  normal: '일반석',
};

const typeIcon: Record<string, string> = {
  window: 'ri-sun-line',
  bar: 'ri-goblet-line',
  group: 'ri-group-line',
  sofa: 'ri-sofa-line',
  normal: 'ri-armchair-line',
};

export default function ReviewForm({ spaceName, spaceAddress, seat, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleQuickComment = (text: string) => {
    setComment(prev => {
      if (prev.includes(text)) return prev.replace(text, '').replace(/\n\n+/g, '\n').trim();
      return prev ? `${prev}\n${text}` : text;
    });
  };

  const handleSubmit = async () => {
    if (rating === 0) return;

    setUploading(true);
    try {
      let imageUrl = photoPreview;

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      onSubmit({
        rating,
        comment,
        photoPreview: imageUrl,
        photoFile: null,
      });
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
    } finally {
      setUploading(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mb-1">리뷰 작성</h2>
        <p className="text-xs sm:text-sm text-gray-500">{spaceName}</p>
      </div>

      {/* 선택된 좌석 정보 */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-900 text-white flex-shrink-0">
          <i className={`${typeIcon[seat.type] || 'ri-armchair-line'} text-base`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-sm">{seat.id}</span>
            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
              {typeLabel[seat.type] || '일반석'}
            </span>
          </div>
          {seat.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {seat.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white border border-gray-200 text-gray-500 rounded-full">
                  {tag}
                </span>
              ))}
              {seat.tags.length > 3 && (
                <span className="text-[10px] text-gray-400">+{seat.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <i className="ri-map-pin-line text-gray-400 text-xs"></i>
          <span className="text-[10px] text-gray-400 truncate max-w-[80px]">{spaceAddress.split(' ').slice(0, 2).join(' ')}</span>
        </div>
      </div>

      {/* 별점 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-800">
          이 자리는 어떠셨나요? <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="w-10 h-10 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
            >
              <i className={`text-3xl transition-colors ${
                star <= displayRating ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'
              }`}></i>
            </button>
          ))}
          {displayRating > 0 && (
            <span className="text-sm font-semibold text-gray-700 ml-1">
              {RATING_LABELS[displayRating]}
            </span>
          )}
        </div>
        {rating === 0 && (
          <p className="text-xs text-red-400">별점을 선택해 주세요</p>
        )}
      </div>

      {/* 빠른 코멘트 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-800">빠른 태그 선택</label>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_COMMENTS.map(text => {
            const isSelected = comment.includes(text);
            return (
              <button
                key={text}
                onClick={() => handleQuickComment(text)}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {isSelected && <i className="ri-check-line mr-1 text-[10px]"></i>}
                {text}
              </button>
            );
          })}
        </div>
      </div>

      {/* 코멘트 입력 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-800">
          상세 후기 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="이 자리에 대한 솔직한 후기를 남겨주세요..."
          rows={4}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-900 transition-colors resize-none"
        />
        <div className="flex justify-end">
          <span className="text-xs text-gray-400">{comment.length}자</span>
        </div>
      </div>

      {/* 사진 첨부 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-800">
          사진 첨부 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        {photoPreview ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-gray-200">
            <img src={photoPreview} alt="첨부 사진" className="w-full h-full object-cover" />
            <button
              onClick={handleRemovePhoto}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-400 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
              <i className="ri-camera-line text-xl text-gray-400"></i>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">사진 추가하기</p>
              <p className="text-xs text-gray-400 mt-0.5">자리 사진을 올려주시면 다른 분들께 도움이 돼요</p>
            </div>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>

      {/* 제출 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || uploading}
        className={`w-full py-4 rounded-xl font-bold text-base transition-all cursor-pointer whitespace-nowrap ${
          rating === 0 || uploading
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
        }`}
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <i className="ri-loader-4-line animate-spin"></i>
            등록 중...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <i className="ri-send-plane-fill"></i>
            리뷰 등록하기
          </span>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        등록된 리뷰는 다른 방문자에게 소중한 정보가 됩니다 🙏
      </p>
    </div>
  );
}
