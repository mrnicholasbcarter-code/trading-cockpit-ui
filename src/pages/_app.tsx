/**
 * Custom Next.js App component - Global layout and providers
 * @packageDocumentation
 */

import '@/styles/globals.css';
import type { AppProps } from 'next/app';

/**
 * Root App component
 * Provides global styles and wraps all pages
 * @param Component - The active page component
 * @param pageProps - Page props from getStaticProps/getServerSideProps
 * @returns JSX.Element
 */
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
