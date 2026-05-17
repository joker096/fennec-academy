import { useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'; // test key

declare global {
  interface Window {
    turnstile: any;
    onloadTurnstileCallback?: () => void;
  }
}

interface CaptchaProps {
  onToken: (token: string | null) => void;
  action: 'login' | 'register' | 'reset';
}

export default function Captcha({ onToken, action }: CaptchaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    const id = `turnstile-${action}-${Math.random().toString(36).slice(2, 7)}`;
    if (ref.current) ref.current.id = id;

    const load = () => {
      if (!ref.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(null),
        'error-callback': () => onToken(null),
        theme: 'dark',
        size: 'flexible',
      });
    };

    if (window.turnstile) {
      load();
    } else {
      window.onloadTurnstileCallback = load;
      if (!document.querySelector('script[src*="turnstile"]')) {
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
    }

    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, []);

  return (
    <div ref={ref} className="flex justify-center my-4 min-h-[65px]" />
  );
}
