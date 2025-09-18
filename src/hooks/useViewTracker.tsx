import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useViewTracker = (quoteId: string, authorId?: string) => {
  useEffect(() => {
    const trackView = async () => {
      try {
        // Register view
        await supabase.from('quote_views').insert({
          quote_id: quoteId,
          author_id: authorId || null,
          viewer_ip: null // Could be implemented with backend
        });

        // Update views count
        const { data: currentQuote } = await supabase
          .from('quotes')
          .select('views_count')
          .eq('id', quoteId)
          .maybeSingle();

        if (currentQuote) {
          await supabase
            .from('quotes')
            .update({ views_count: (currentQuote.views_count || 0) + 1 })
            .eq('id', quoteId);
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    // Track view after 2 seconds to avoid spam
    const timer = setTimeout(trackView, 2000);

    return () => clearTimeout(timer);
  }, [quoteId, authorId]);
};