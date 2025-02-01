import Providers from "./providers";

export const metadata = {
  title: "VRChat ワールド備忘録",
  description: "VRChat のワールド備忘録アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootswatch@5.3.0/dist/darkly/bootstrap.min.css"
        />
        <style>
          {`
            .form-control {
                color: #ffffff;
                background-color: #454545;
            }

            .form-control:focus {
                color: #ffffff;
                background-color: #666;
            }
        `}
        </style>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
