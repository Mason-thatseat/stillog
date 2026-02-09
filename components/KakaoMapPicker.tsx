'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

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

export default function KakaoMapPicker({
  latitude,
  longitude,
  onLocationChange,
}: KakaoMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const defaultLat = latitude || 37.5665;
  const defaultLng = longitude || 126.978;

  // Reverse geocode: coordinates → address
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoderRef.current) return;

    geocoderRef.current.coord2Address(
      new window.kakao.maps.LatLng(lat, lng),
      (result: any[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          const addr =
            result[0].road_address?.address_name ||
            result[0].address?.address_name ||
            '';
          onLocationChange(lat, lng, addr);
        } else {
          onLocationChange(lat, lng, '');
        }
      }
    );
  }, [onLocationChange]);

  // Place or move marker
  const placeMarker = useCallback((lat: number, lng: number) => {
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

      // Drag end → update address
      window.kakao.maps.event.addListener(markerRef.current, 'dragend', () => {
        const pos = markerRef.current.getPosition();
        reverseGeocode(pos.getLat(), pos.getLng());
        mapInstance.current.setCenter(pos);
      });
    }

    mapInstance.current.setCenter(position);
  }, [reverseGeocode]);

  // Initialize map
  const initMap = useCallback(() => {
    if (!mapRef.current || !window.kakao?.maps) return;

    const options = {
      center: new window.kakao.maps.LatLng(defaultLat, defaultLng),
      level: 3,
    };

    mapInstance.current = new window.kakao.maps.Map(mapRef.current, options);
    geocoderRef.current = new window.kakao.maps.services.Geocoder();

    // Zoom control
    const zoomControl = new window.kakao.maps.ZoomControl();
    mapInstance.current.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

    // Click on map → place pin
    window.kakao.maps.event.addListener(mapInstance.current, 'click', (e: any) => {
      const lat = e.latLng.getLat();
      const lng = e.latLng.getLng();
      placeMarker(lat, lng);
      reverseGeocode(lat, lng);
    });

    // Place initial marker if coords provided
    if (latitude && longitude) {
      placeMarker(latitude, longitude);
    }

    setLoaded(true);
  }, [defaultLat, defaultLng, latitude, longitude, placeMarker, reverseGeocode]);

  // Load Kakao Maps script
  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;
    if (!appKey) {
      console.error('NEXT_PUBLIC_KAKAO_MAP_APP_KEY is not set');
      return;
    }

    if (window.kakao?.maps?.services) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        initMap();
      });
    };
    document.head.appendChild(script);
  }, [initMap]);

  // GPS: get current location
  const handleGPS = useCallback(() => {
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
        if (mapInstance.current) {
          mapInstance.current.setLevel(3);
        }
        setGpsLoading(false);
      },
      () => {
        alert('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [placeMarker, reverseGeocode]);

  // Address search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !geocoderRef.current) return;

    setSearching(true);

    geocoderRef.current.addressSearch(
      searchQuery.trim(),
      (result: any[], status: string) => {
        setSearching(false);
        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          const addr = result[0].road_address?.address_name || result[0].address_name || searchQuery;

          placeMarker(lat, lng);
          onLocationChange(lat, lng, addr);
          if (mapInstance.current) {
            mapInstance.current.setLevel(3);
          }
        } else {
          // Try keyword search via Places
          const ps = new window.kakao.maps.services.Places();
          ps.keywordSearch(searchQuery.trim(), (data: any[], psStatus: string) => {
            setSearching(false);
            if (psStatus === window.kakao.maps.services.Status.OK && data[0]) {
              const lat = parseFloat(data[0].y);
              const lng = parseFloat(data[0].x);
              const addr = data[0].road_address_name || data[0].address_name || data[0].place_name;

              placeMarker(lat, lng);
              onLocationChange(lat, lng, addr);
              if (mapInstance.current) {
                mapInstance.current.setLevel(3);
              }
            } else {
              alert('주소를 찾을 수 없습니다. 다시 시도해주세요.');
            }
          });
        }
      }
    );
  };

  // Auto-detect GPS on first load
  useEffect(() => {
    if (loaded && !latitude && !longitude && !markerRef.current) {
      handleGPS();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="주소 또는 장소 검색 (예: 강남역, 스타벅스)"
          className="flex-1 text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/50"
        />
        <button
          type="submit"
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
      </form>

      {/* Map container */}
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
