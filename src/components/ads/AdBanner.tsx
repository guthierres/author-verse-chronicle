import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Megaphone } from 'lucide-react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  className?: string;
  type?: 'adsense' | 'generic' | 'placeholder';
  adData?: {
    title: string;
    description: string;
    imageUrl: string;
    linkUrl: string;
    sponsor: string;
  };
}

const AdBanner = ({ 
  slot, 
  format = 'auto', 
  responsive = true, 
  className = '',
  type = 'adsense',
  adData
}: AdBannerProps) => {
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [adClient, setAdClient] = useState('');
  const [adSlot, setAdSlot] = useState('');
  const [containerReady, setContainerReady] = useState(false);

  useEffect(() => {
    if (type === 'adsense') {
      fetchAdSettings();
    } else {
      setContainerReady(true);
    }
  }, [type]);

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
        setContainerReady(true);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações de anúncios:', error);
      setContainerReady(true);
    }
  };

  useEffect(() => {
    if (type === 'adsense' && containerReady && adsEnabled && adClient && adSlot) {
      // Carregar script do Google AdSense se não estiver carregado
      if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      // Inicializar anúncio com verificação robusta de largura
      const initializeAd = () => {
        const adContainer = document.querySelector('.adsbygoogle:not([data-adsbygoogle-status])');
        if (adContainer) {
          const containerRect = adContainer.getBoundingClientRect();
          const containerWidth = containerRect.width;
          const parentWidth = adContainer.parentElement?.getBoundingClientRect().width || 0;
          
          // Verificar se o container tem largura válida (maior que 100px)
          if (containerWidth > 100 || parentWidth > 100) {
            try {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            } catch (error) {
              console.error('Erro ao inicializar anúncio:', error);
            }
          } else {
            // Tentar novamente após um delay se ainda não tem largura adequada
            setTimeout(initializeAd, 500);
          }
        }
      };

      // Aguardar mais tempo para garantir que o layout esteja completamente pronto
      const timer = setTimeout(initializeAd, 800);
      return () => clearTimeout(timer);
    }
  }, [type, containerReady, adsEnabled, adClient, adSlot]);

  // Render different ad types
  if (type === 'generic' && adData) {
    return (
      <div className={`ad-container flex justify-center my-6 ${className}`}>
        <Card className="w-full max-w-sm shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4">
            <div className="text-center mb-3">
              <Badge variant="secondary" className="text-xs">
                <Megaphone className="w-3 h-3 mr-1" />
                Publicidade
              </Badge>
            </div>
            <div className="space-y-3">
              {adData.imageUrl && (
                <img 
                  src={adData.imageUrl} 
                  alt={adData.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="font-semibold text-sm mb-1">{adData.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">{adData.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Por {adData.sponsor}</span>
                  <a 
                    href={adData.linkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-xs flex items-center"
                  >
                    Saiba mais <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (type === 'placeholder') {
    return (
      <div className={`ad-container flex justify-center my-6 ${className}`}>
        <Card className="w-full max-w-sm border-dashed border-2 border-muted">
          <CardContent className="p-6 text-center">
            <Megaphone className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">Espaço Publicitário</p>
            <p className="text-xs text-muted-foreground">Anúncio será exibido aqui</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // AdSense type
  if (!containerReady || !adsEnabled || !adClient || !adSlot) {
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
        return { display: 'block', width: '100%', height: 'auto', minHeight: '250px' };
    }
  };

  return (
    <div className={`ad-container flex justify-center my-6 ${className}`}>
      <div className="ad-wrapper max-w-full">
        <div className="text-center mb-2">
          <Badge variant="secondary" className="text-xs">
            <Megaphone className="w-3 h-3 mr-1" />
            Publicidade
          </Badge>
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