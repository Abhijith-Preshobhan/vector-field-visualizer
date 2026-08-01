import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * Reusable KaTeX Math Rendering Component
 * @param {Object} props
 * @param {string} props.math - TeX string to render
 * @param {boolean} [props.display=false] - If true, renders as display block formula. Otherwise inline.
 * @param {string} [props.className] - Optional custom CSS class
 */
export default function MathFormula({ math, display = false, className = '' }) {
  const html = useMemo(() => {
    if (!math) return '';
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch (err) {
      console.error('KaTeX rendering error:', err);
      return math;
    }
  }, [math, display]);

  if (display) {
    return (
      <div
        className={`math-formula display-math ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`math-formula inline-math ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
