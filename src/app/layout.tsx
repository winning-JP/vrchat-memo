import Script from "next/script";
import Providers from "./providers";
import Header from "./components/Header";

export const metadata = {
  title: "VRChat World Memories",
  description: "VRChat World Memories",
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
            .me-1 {
              font-size: 16px;
            }
            @media (max-width: 768px) {
                .form-control {
                    font-size: 16px;
                    padding: 12px;
                }
                img.og-image {
                  max-width: -webkit-fill-available;
                  max-height: min-content;
                }
              }
          `}
        </style>
      </head>
      <body>
        <Header />
        <Providers>{children}</Providers>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap/dist/js/bootstrap.bundle.min.js" />
      </body>
    </html>
  );
}
