/**
 * Custom Next.js Document - HTML document structure
 * @packageDocumentation
 */

import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document component
 * Overrides the default HTML document structure
 * Used for adding custom fonts, meta tags, or analytics scripts
 * @returns JSX.Element
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
