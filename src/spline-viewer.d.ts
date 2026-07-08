import * as React from 'react';

// Declarations for custom HTML element <spline-viewer>
// Supports both global JSX and React JSX namespaces for compatibility with all compiler configurations

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          url?: string;
          background?: string;
          loading?: 'eager' | 'lazy';
        },
        HTMLElement
      >;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          url?: string;
          background?: string;
          loading?: 'eager' | 'lazy';
        },
        HTMLElement
      >;
    }
  }
}
