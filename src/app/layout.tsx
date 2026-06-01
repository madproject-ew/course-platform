import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/shared/Header";
import { SessionProvider } from "@/components/shared/SessionProvider";

const inter = localFont({
  src: "./fonts/InterVariable.woff2",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Курсы | EW Production",
  description: "Авторские курсы по AI и разработке",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <SessionProvider>
            <div className="flex min-h-screen flex-col overflow-x-hidden">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </SessionProvider>
        </ThemeProvider>

        {/* Яндекс.Метрика */}
        <Script id="yandex-metrika" strategy="afterInteractive">{`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=109570272', 'ym');
          ym(109570272, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
        `}</Script>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/109570272" style={{ position: "absolute", left: "-9999px" }} alt="" />
          </div>
        </noscript>
      </body>
    </html>
  );
}
