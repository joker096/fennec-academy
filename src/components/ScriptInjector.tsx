import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export default function ScriptInjector() {
  const { globalSettings } = useStore();
  const injectedScripts = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!globalSettings) return;

    // Helper to inject script safely
    const injectScript = (id: string, content: string, isUrl: boolean = false) => {
      if (injectedScripts.current.has(id)) return;
      
      const script = document.createElement('script');
      if (isUrl) {
        script.src = content;
        script.async = true;
      } else {
        script.innerHTML = content;
      }
      script.setAttribute('data-injected-id', id);
      document.head.appendChild(script);
      injectedScripts.current.add(id);
    };

    // Google Analytics
    if (globalSettings.googleAnalyticsId) {
      injectScript('ga-base', `https://www.googletagmanager.com/gtag/js?id=${globalSettings.googleAnalyticsId}`, true);
      injectScript('ga-config', `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${globalSettings.googleAnalyticsId}');
      `);
    }

    // Yandex Metrica
    if (globalSettings.yandexMetricaId) {
      injectScript('ym-base', `
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        ym(${globalSettings.yandexMetricaId}, "init", {
             clickmap:true,
             trackLinks:true,
             accurateTrackBounce:true,
             webvisor:true
        });
      `);
    }

    // Custom Scripts
    if (globalSettings.customScripts) {
      const container = document.createElement('div');
      container.innerHTML = globalSettings.customScripts;
      const scripts = container.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const s = scripts[i];
        const id = s.src || `custom-script-${i}`;
        injectScript(id, s.src || s.innerHTML, !!s.src);
      }
    }

    // Header Ad Code
    if (globalSettings.adCodeHeader && !globalSettings.hideAds) {
      const existing = document.getElementById('header-ad-container');
      if (!existing) {
        const headerAd = document.createElement('div');
        headerAd.id = 'header-ad-container';
        headerAd.className = 'w-full flex justify-center py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800';
        headerAd.innerHTML = globalSettings.adCodeHeader;
        document.body.prepend(headerAd);
      }
    }

    // Footer Ad Code
    if (globalSettings.adCodeFooter && !globalSettings.hideAds) {
      const existing = document.getElementById('footer-ad-container');
      if (!existing) {
        const footerAd = document.createElement('div');
        footerAd.id = 'footer-ad-container';
        footerAd.className = 'w-full flex justify-center py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 mt-auto';
        footerAd.innerHTML = globalSettings.adCodeFooter;
        document.body.appendChild(footerAd);
      }
    }

    return () => {
      // We don't necessarily want to remove analytics on every re-render
      // but we could clean up the ad containers if needed
    };
  }, [globalSettings]);

  return null;
}
