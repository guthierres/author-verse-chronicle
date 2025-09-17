import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import QuoteCard from '@/components/quotes/QuoteCard';
import Sidebar from '@/components/layout/Sidebar';
import AdBanner from '@/components/ads/AdBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Quote {
  id: string;
  content: string;
  created_at: string;
  views_count: number;
  shares_count: number;
  notes?: string;
  authors: {
    id: string;
    name: string;
    avatar_url?: string;
    is_verified: boolean;
  };
}

const Timeline = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [adsFrequency, setAdsFrequency] = useState(3);

  useEffect(() => {
    fetchQuotes(true);
    fetchAdSettings();
  }, [searchTerm]);

  const fetchAdSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'ads_frequency')
        .single();
      
      if (data) {
        setAdsFrequency(parseInt(String(data.value)) || 3);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações de anúncios:', error);
    }
  };

  const fetchQuotes = async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 0 : page;

    let query = supabase
      .from('quotes')
      .select(`
        id,
        content,
        created_at,
        views_count,
        shares_count,
        authors (
          id,
          name,
          avatar_url,
          is_verified
        )
      `)
      .eq('is_approved', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(currentPage * 10, (currentPage + 1) * 10 - 1);

    if (searchTerm) {
      query = query.or(
        `content.ilike.%${searchTerm}%,authors.name.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await query;

    if (!error && data) {
      if (reset) {
        setQuotes(data);
        setPage(0);
      } else {
        setQuotes(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 10);
      if (!reset) {
        setPage(prev => prev + 1);
      }
    }

    setLoading(false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchQuotes(false);
    }
  };

  const shouldShowAd = (index: number) => {
    return (index + 1) % adsFrequency === 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="flex max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex-1 px-4 py-8 max-w-2xl">
          {/* Header Section - Unified */}
          <div className="relative mb-8 p-8 rounded-2xl earth-gradient text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold mb-2">
                  Timeline de Frases
                </h1>
                <p className="text-white/90 text-lg mb-4">
                  Descubra frases inspiradoras de autores incríveis
                </p>
              </div>
              
              {/* Search integrated */}
              <div className="mb-6 relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar frases ou autores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base bg-white/90 border-0 focus:bg-white rounded-xl shadow-sm placeholder:text-gray-500"
                />
              </div>

              {/* Add Quote Button integrated */}
              {user && (
                <div className="text-center">
                  <Button asChild className="w-full sm:w-auto h-12 px-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-white">
                    <Link to="/new-quote">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Compartilhar nova frase
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quotes Feed */}
          <div className="space-y-6">
            {quotes.map((quote, index) => (
              <div key={quote.id}>
                <QuoteCard quote={quote} />
                {shouldShowAd(index) && <AdBanner format="auto" responsive />}
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center mt-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {/* Load More */}
          {!loading && hasMore && quotes.length > 0 && (
            <div className="text-center mt-8">
              <Button onClick={loadMore} variant="outline" className="h-12 px-8 rounded-xl">
                Carregar mais frases
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && quotes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Nenhuma frase encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Tente pesquisar com outros termos'
                  : 'Seja o primeiro a compartilhar uma frase!'
                }
              </p>
              {user && !searchTerm && (
                <Button asChild className="earth-gradient hover:opacity-90">
                  <Link to="/new-quote">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Compartilhar primeira frase
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default Timeline;