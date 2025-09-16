import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import QuoteCard from '@/components/quotes/QuoteCard';
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
        setAdsFrequency(parseInt(data.value) || 3);
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Timeline de Frases
          </h1>
          <p className="text-muted-foreground">
            Descubra frases inspiradoras de autores incríveis
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Pesquisar frases ou autores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base border-2 focus:border-primary/50 rounded-xl shadow-sm"
          />
        </div>

        {/* Add Quote Button */}
        {user && (
          <div className="mb-8 text-center">
            <Button asChild className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/new-quote">
                <PlusCircle className="w-4 h-4 mr-2" />
                Compartilhar nova frase
              </Link>
            </Button>
          </div>
        )}

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
              <Button asChild className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                <Link to="/new-quote">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Compartilhar primeira frase
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;