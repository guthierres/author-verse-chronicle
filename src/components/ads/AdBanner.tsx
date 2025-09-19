import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

const AdBanner = ({ 
  slot, 
  format = 'auto', 
  responsive = true, 
  className = '' 
}: AdBannerProps) => {
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [adClient, setAdClient] = useState('');
  const [adSlot, setAdSlot] = useState('');

  useEffect(() => {
    fetchAdSettings();
  }, []);

  const fetchAdSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['ads_enabled', 'google_adsense_client', 'google_adsense_slot']);

      if (settings) {
        const settingsMap = settings.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, any>);

        setAdsEnabled(settingsMap.ads_enabled === 'true');
        setAdClient(settingsMap.google_adsense_client || '');
        setAdSlot(slot || settingsMap.google_adsense_slot || '');
      }
    } catch (error) {
      console.error('Erro ao buscar configurações de anúncios:', error);
    }
  };

  useEffect(() => {
    if (adsEnabled && adClient && adSlot) {
      // Carregar script do Google AdSense se não estiver carregado
      if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      // Inicializar anúncio com verificação mais robusta de largura
      const initializeAd = () => {
        const adContainer = document.querySelector('.adsbygoogle:not([data-adsbygoogle-status])');
        if (adContainer) {
          const containerWidth = adContainer.clientWidth || adContainer.offsetWidth;
          const parentWidth = adContainer.parentElement?.clientWidth || 0;
          
          // Verificar se o container tem largura válida
          if (containerWidth > 0 || parentWidth > 0) {
            try {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            } catch (error) {
              console.error('Erro ao inicializar anúncio:', error);
            }
          } else {
            // Tentar novamente após um delay se ainda não tem largura
            setTimeout(initializeAd, 200);
          }
        }
      };

      // Aguardar um pouco mais para garantir que o layout esteja pronto
      const timer = setTimeout(initializeAd, 300);
      return () => clearTimeout(timer);
    }
  }, [adsEnabled, adClient, adSlot]);

  if (!adsEnabled || !adClient || !adSlot) {
    return null;
  }

  const getAdStyle = () => {
    if (!responsive) return {};
    
    switch (format) {
      case 'rectangle':
        return { width: '300px', height: '250px' };
      case 'vertical':
        return { width: '160px', height: '600px' };
      case 'horizontal':
        return { width: '728px', height: '90px' };
      default:
        return { display: 'block', width: '100%', height: 'auto' };
    }
  };

  return (
    <div className={`ad-container flex justify-center my-6 ${className}`}>
      <div className="ad-wrapper max-w-full">
        <div className="text-xs text-muted-foreground text-center mb-2">
          Publicidade
        </div>
        <ins
          className="adsbygoogle"
          style={getAdStyle()}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={responsive ? 'auto' : undefined}
          data-full-width-responsive={responsive ? 'true' : undefined}
        />
      </div>
    </div>
  );
};

export default AdBanner;
