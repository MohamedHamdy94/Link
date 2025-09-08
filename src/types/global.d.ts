// Define a more specific type for the global grecaptcha object
interface GReCaptcha {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
  render: (
    container: string | HTMLElement,
    parameters?: {
      sitekey?: string;
      theme?: 'dark' | 'light';
      size?: 'compact' | 'normal' | 'invisible';
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    }
  ) => number;
  reset: (widgetId?: number) => void;
  getResponse: (widgetId?: number) => string;
}

declare global {
  interface Window {
    // Now use the specific interface instead of 'any'
    grecaptcha: GReCaptcha;
  }
}

export {}; // This is needed to make it a module
