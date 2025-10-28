import '../styles/globals.css'
import { ReactNode } from 'react'
import Providers from '../components/layout/Providers'
import CashbackToast from '../components/CashbackToast'

export const metadata = {
  title: 'دليلك للأفضل',
  description: 'Connect with engineering and construction companies across the Gulf.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </head>
      <body style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
        {/* Animated SVG waves background */}
        <div className="animated-bg">
          {/* Animated stars background */}
          <div className="stars">
            {Array.from({ length: 50 }).map((_, i) => {
              // Generate random values for each star
              const tail = (Math.random() * 2.5 + 5).toFixed(2) + 'em';
              const top = (Math.random() * 100).toFixed(2) + 'vh';
              const duration = (Math.random() * 6 + 6).toFixed(2) + 's';
              const delay = (Math.random() * 10).toFixed(2) + 's';
              return (
                <div
                  key={i}
                  className="star"
                  style={{
                    '--star-tail-length': tail,
                    '--top-offset': top,
                    '--fall-duration': duration,
                    '--fall-delay': delay,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        </div>
        <Providers>
          <CashbackToast />
          <div style={{ position: 'relative', zIndex: 2 }}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
