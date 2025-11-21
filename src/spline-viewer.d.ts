// TypeScript declarations for Spline Viewer custom element
declare namespace JSX {
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


