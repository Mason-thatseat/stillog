'use client';

import { useEffect, useRef, useState } from 'react';

interface KakaoMapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

declare global {
  interface Window {
    kakao: any;
  }
}

let kakaoScriptLoaded = false;
let kakaoScriptLoading = false;
const kakaoLoadCallbacks: (() => void)[] = [];

function loadKakaoScript(appKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (kakaoScriptLoaded && window.kakao?.maps) {
      resolve();
      return;
    }

    kakaoLoadCallbacks.push(resolve);

    if (kakaoScriptLoading) return;
    kakaoScriptLoading = true;

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        kakaoScriptLoaded = true;
        kakaoLoadCallbacks.forEach((cb) => cb());
        kakaoLoadCallbacks.length = 0;
      });
    };
    document.head.appendChild(script);
  });
}

export default function KakaoMapPicker({
  latitude,
  longitude,
  onLocationChange,
}: KakaoMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Keep callback ref up to date
  onLocationChangeRef.current = onLocationChange;

  const defaultLat = latitude || 37.5665;
  const defaultLng = longitude || 126.978;

  // Reverse geocode helper
  function reverseGeocode(lat: number, lng: number) {
    if (!geocoderRef.current) return;
    geocoderRef.current.coord2Address(
      new window.kakao.maps.LatLng(lat, lng),
      (result: any[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          const addr =
            result[0].road_address?.address_name ||
            result[0].address?.address_name ||
            '';
          onLocationChangeRef.current(lat, lng, addr);
        } else {
          onLocationChangeRef.current(lat, lng, '');
        }
      }
    );
  }

  // Place or move marker helper
  function placeMarker(lat: number, lng: number) {
    if (!mapInstance.current) return;
    const position = new window.kakao.maps.LatLng(lat, lng);

    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new window.kakao.maps.Marker({
        position,
        map: mapInstance.current,
        draggable: true,
      });

      window.kakao.maps.event.addListener(markerRef.current, 'dragend', () => {
        const pos = markerRef.current.getPosition();
        reverseGeocode(pos.getLat(), pos.getLng());
        mapInstance.current.setCenter(pos);
      });
    }

    mapInstance.current.setCenter(position);
  }

  // Load script & init map (once)
  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;
    if (!appKey || !mapRef.current) return;

    let cancelled = false;

    loadKakaoScript(appKey).then(() => {
      if (cancelled || !mapRef.current) return;

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(defaultLat, defaultLng),
        level: 3,
      });

      mapInstance.current = map;
      geocoderRef.current = new window.kakao.maps.services.Geocoder();

      // Zoom control
      map.addControl(
        new window.kakao.maps.ZoomControl(),
        window.kakao.maps.ControlPosition.RIGHT
      );

      // Click → place pin
      window.kakao.maps.event.addListener(map, 'click', (e: any) => {
        const lat = e.latLng.getLat();
        const lng = e.latLng.getLng();
        placeMarker(lat, lng);
        reverseGeocode(lat, lng);
      });

      // Place initial marker
      if (latitude && longitude) {
        placeMarker(latitude, longitude);
      }

      setMapReady(true);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto GPS on first load
  useEffect(() => {
    if (!mapReady) return;
    if (latitude || longitude || markerRef.current) return;

    handleGPS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  // GPS
  function handleGPS() {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보를 사용할 수 없습니다.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        placeMarker(lat, lng);
        reverseGeocode(lat, lng);
        mapInstance.current?.setLevel(3);
        setGpsLoading(false);
      },
      () => {
        alert('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Address search
  function handleSearch() {
    if (!searchQuery.trim() || !geocoderRef.current) return;

    setSearching(true);

    geocoderRef.current.addressSearch(
      searchQuery.trim(),
      (result: any[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          setSearching(false);
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          const addr =
            result[0].road_address?.address_name ||
            result[0].address_name ||
            searchQuery;

          placeMarker(lat, lng);
          onLocationChangeRef.current(lat, lng, addr);
          mapInstance.current?.setLevel(3);
        } else {
          // Fallback: keyword search
          const ps = new window.kakao.maps.services.Places();
          ps.keywordSearch(searchQuery.trim(), (data: any[], psStatus: string) => {
            setSearching(false);
            if (psStatus === window.kakao.maps.services.Status.OK && data[0]) {
              const lat = parseFloat(data[0].y);
              const lng = parseFloat(data[0].x);
              const addr =
                data[0].road_address_name ||
                data[0].address_name ||
                data[0].place_name;

              placeMarker(lat, lng);
              onLocationChangeRef.current(lat, lng, addr);
              mapInstance.current?.setLevel(3);
            } else {
              alert('주소를 찾을 수 없습니다. 다시 시도해주세요.');
            }
          });
        }
      }
    );
  }

  return (
    <div className="space-y-3">
      {/* Search bar (div instead of form to avoid nested form issues) */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
          placeholder="주소 또는 장소 검색 (예: 강남역, 스타벅스)"
          className="flex-1 text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/50"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors flex-shrink-0"
        >
          {searching ? '...' : '검색'}
        </button>
        <button
          type="button"
          onClick={handleGPS}
          disabled={gpsLoading}
          title="현재 위치"
          className="px-3 py-2 border border-border rounded-lg hover:bg-background-subtle disabled:opacity-50 transition-colors flex-shrink-0"
        >
          {gpsLoading ? (
            <svg className="w-5 h-5 animate-spin text-foreground-muted" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Map */}
      <div
        ref={mapRef}
        className="w-full aspect-[4/3] md:aspect-[16/9] rounded-xl border border-border overflow-hidden bg-background-subtle"
      />

      <p className="text-xs text-foreground-muted">
        지도를 클릭하거나 핀을 드래그하여 위치를 지정할 수 있습니다
      </p>
    </div>
  );
}
