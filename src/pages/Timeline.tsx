import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import QuoteCard from '@/components/quotes/QuoteCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Plus, Filter, X } from 'lucide-react';
import { Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MobileSidebar } from '@/components/sidebar/MobileSidebar';
import Sidebar from '@/components/layout/Sidebar';
import { Badge } from '@/components/ui/badge';

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

const PAGE_SIZE = 10;

const Timeline = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setQuotes([]);
    setPage(0);
    setHasMore(true);
    fetchQuotes(0);
  }, [searchTerm]);

  const fetchQuotes = async (currentPage = 0) => {
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    if (currentPage === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
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
        .order('created_at', { ascending: false });

      if (searchTerm.trim()) {
        const searchTerms = searchTerm.toLowerCase().trim().split(' ').filter(word => word.length > 0);
        
        // Build OR conditions for content and author name
        const contentConditions = searchTerms.map(term => `content.ilike.%${term}%`).join(',');
        const authorConditions = searchTerms.map(term => `authors.name.ilike.%${term}%`).join(',');
        
        query = query.or(`${contentConditions},${authorConditions}`);
      }

      // Apply pagination
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar frases:', error);
        return;
      }

      if (currentPage === 0) {
        setQuotes(data);
        setSearchResults(data.length);
      } else {
        setQuotes(prevQuotes => [...prevQuotes, ...data]);
      }
      setPage(currentPage + 1);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error('Erro ao buscar frases:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  const loadMoreQuotes = () => {
    if (!loadingMore && hasMore) {
      fetchQuotes(page);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="text-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full mb-4 shadow-lg">
                <Quote className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-4">
              ParaFrase
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Descubra e compartilhe frases inspiradoras de autores incríveis
            </p>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm">
                <div className="flex items-center p-2">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl mr-3 flex-shrink-0">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <Input
                    placeholder="Busque por frases, autores, palavras-chave..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 border-none bg-transparent text-lg placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="mr-2 hover:bg-muted/50 rounded-xl"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  {isSearching && (
                    <div className="mr-3">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Search Results Info */}
            {searchTerm && (
              <div className="mt-4 text-center">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  {searchResults} {searchResults === 1 ? 'resultado encontrado' : 'resultados encontrados'} para "{searchTerm}"
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Content Layout */}
        <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="flex-1 max-w-4xl mx-auto xl:mx-0 space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : quotes.length > 0 ? (
              quotes.map((quote) => (
                <QuoteCard key={quote.id} quote={quote} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {searchTerm ? 'Nenhuma frase encontrada para sua busca.' : 'Nenhuma frase disponível no momento.'}
                </p>
              </div>
            )}
            
            {/* Load More Button */}
            {!loading && hasMore && (
              <div className="flex justify-center py-8">
                <Button
                  onClick={loadMoreQuotes}
                  disabled={loadingMore}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-base font-semibold hover:bg-primary hover:text-white transition-colors"
                >
                  {loadingMore && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Carregar Mais
                </Button>
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden xl:block xl:w-80 flex-shrink-0">
            {/* Add Quote Button for Desktop */}
            {user && (
              <div className="mb-6">
                <Button asChild className="w-full earth-gradient hover:opacity-90 text-white shadow-lg h-12 text-base font-semibold">
                  <Link to="/new-quote">
                    <Plus className="w-5 h-5 mr-2" />
                    Compartilhar Nova Frase
                  </Link>
                </Button>
              </div>
            )}
            <Sidebar />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="xl:hidden">
        <MobileSidebar />
      </div>
      
      {/* Mobile Add Quote Button */}
      {user && (
        <div className="xl:hidden fixed bottom-6 right-6 z-50">
          <Button asChild className="earth-gradient hover:opacity-90 text-white shadow-2xl w-14 h-14 rounded-full">
            <Link to="/new-quote">
              <Plus className="w-6 h-6" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Timeline;