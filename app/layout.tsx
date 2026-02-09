import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "STILLOG - 공간의 시선을 기록하다",
  description: "카페, 도서관, 공유 오피스의 좌석에서 본 풍경을 기록하고 공유하세요. 좌석별 리뷰와 배치도를 확인할 수 있습니다.",
  keywords: ["카페 좌석 리뷰", "좌석 뷰 기록", "카페 배치도", "공간 기록", "STILLOG", "스틸로그"],
  openGraph: {
    title: "STILLOG - 공간의 시선을 기록하다",
    description: "카페, 도서관, 공유 오피스의 좌석에서 본 풍경을 기록하고 공유하세요.",
    type: "website",
    locale: "ko_KR",
    siteName: "STILLOG",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    other: {
      "naver-site-verification": "dbac5213f81b4b46846eb8c839bcb52a473a86d0",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background">
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
