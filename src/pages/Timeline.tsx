import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import QuoteCard from '@/components/quotes/QuoteCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MobileSidebar } from '@/components/sidebar/MobileSidebar';
import Sidebar from '@/components/layout/Sidebar';

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

  useEffect(() => {
    fetchQuotes();
  }, [searchTerm]);

  const fetchQuotes = async () => {
    setLoading(true);

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

    if (searchTerm) {
      query = query.or(
        `content.ilike.%${searchTerm}%,authors.name.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await query;

    if (!error && data) {
      setQuotes(data);
    }

    setLoading(false);
  };

  const filteredQuotes = quotes;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
            Timeline de Frases
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Descubra frases inspiradoras de autores incríveis
          </p>
          
          {/* Search and Action Bar - Responsive Layout */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar frases ou autores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur border-none shadow-sm"
              />
            </div>

            {/* New Quote Button - Mobile: below search, Desktop: aligned with sidebar */}
            {user && (
              <div className="w-full lg:w-auto flex justify-center lg:justify-end lg:min-w-[280px]">
                <Button asChild className="earth-gradient hover:opacity-90 text-white shadow-lg flex-shrink-0">
                  <Link to="/new-quote">
                    <Plus className="w-4 h-4 mr-2" />
                    Compartilhar Nova Frase
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredQuotes.length > 0 ? (
              filteredQuotes.map((quote) => (
                <QuoteCard key={quote.id} quote={quote} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {searchTerm ? 'Nenhuma frase encontrada para sua busca.' : 'Nenhuma frase disponível no momento.'}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - shows at bottom on mobile */}
      <div className="lg:hidden">
        <MobileSidebar />
      </div>
    </div>
  );
};

export default Timeline;