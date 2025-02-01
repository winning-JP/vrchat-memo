import Providers from "./providers";

export const metadata = {
  title: "VRChat World Memo",
  description: "VRChat のワールド備忘録アプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* Bootswatch Darkly テーマ */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootswatch@5.3.0/dist/darkly/bootstrap.min.css"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
