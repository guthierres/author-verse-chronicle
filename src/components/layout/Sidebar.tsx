import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AdBanner from '@/components/ads/AdBanner';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Quote, Eye } from 'lucide-react';

interface PopularQuote {
  id: string;
  content: string;
  views_count: number;
  authors: {
    id: string;
    name: string;
    is_verified: boolean;
  };
}

interface PopularAuthor {
  id: string;
  name: string;
  avatar_url?: string;
  is_verified: boolean;
  quotes_count: number;
  total_views: number;
}

// Sample ads for sidebar
const sidebarAds = [
  {
    title: "Diário de Gratidão",
    description: "Transforme sua vida com práticas diárias de gratidão",
    imageUrl: "https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg?auto=compress&cs=tinysrgb&w=300&h=200",
    linkUrl: "#",
    sponsor: "Vida Plena"
  },
  {
    title: "Podcast Inspiração",
    description: "Ouça histórias que transformam vidas",
    imageUrl: "https://images.pexels.com/photos/7045933/pexels-photo-7045933.jpeg?auto=compress&cs=tinysrgb&w=300&h=200",
    linkUrl: "#",
    sponsor: "Audio Inspiração"
  }
];
const Sidebar = () => {
  const [popularQuotes, setPopularQuotes] = useState<PopularQuote[]>([]);
  const [popularAuthors, setPopularAuthors] = useState<PopularAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularContent();
  }, []);

  const fetchPopularContent = async () => {
    try {
      // Fetch popular quotes
      const { data: quotesData } = await supabase
        .from('quotes')
        .select(`
          id,
          content,
          views_count,
          authors (
            id,
            name,
            is_verified
          )
        `)
        .eq('is_approved', true)
        .eq('is_active', true)
        .order('views_count', { ascending: false })
        .limit(5);

      if (quotesData) {
        setPopularQuotes(quotesData);
      }

      // Fetch popular authors
      const { data: authorsData } = await supabase
        .from('authors')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (authorsData) {
        // Get quotes count and total views for each author
        const authorsWithStats = await Promise.all(
          authorsData.map(async (author) => {
            const { count: quotesCount } = await supabase
              .from('quotes')
              .select('*', { count: 'exact', head: true })
              .eq('author_id', author.id)
              .eq('is_approved', true);

            const { data: viewsData } = await supabase
              .from('quotes')
              .select('views_count')
              .eq('author_id', author.id)
              .eq('is_approved', true);

            const totalViews = viewsData?.reduce((sum, quote) => sum + (quote.views_count || 0), 0) || 0;

            return {
              ...author,
              quotes_count: quotesCount || 0,
              total_views: totalViews
            };
          })
        );

        // Sort by total views
        authorsWithStats.sort((a, b) => b.total_views - a.total_views);
        setPopularAuthors(authorsWithStats);
      }
    } catch (error) {
      console.error('Erro ao buscar conteúdo popular:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateContent = (content: string, maxLength: number = 80) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  if (loading) {
    return (
      <aside className="w-80 p-4 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-48 bg-muted rounded-lg"></div>
          <div className="h-48 bg-muted rounded-lg"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full space-y-6">
      {/* Ad Banner */}
      <div className="sticky top-6">
        <AdBanner 
          format="rectangle" 
          responsive={true}
          className="w-full"
        />
      </div>

      {/* Popular Quotes */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-bold">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Frases Populares
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {popularQuotes.map((quote, index) => (
            <div key={quote.id}>
              <Link 
                to={`/quote/${quote.id}`}
                className="block hover:bg-accent/10 p-2 rounded-lg transition-colors"
              >
                <p className="text-sm font-medium mb-1 leading-relaxed">
                  "{truncateContent(quote.content.replace(/\.+$/, ''))}".
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>— {quote.authors.name}</span>
                  <div className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {quote.views_count || 0}
                  </div>
                </div>
              </Link>
              {index < popularQuotes.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Generic Ad */}
      <AdBanner 
        type="generic"
        adData={sidebarAds[0]}
        className="w-full"
      />
      {/* Popular Authors */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-bold">
            <Users className="w-5 h-5 mr-2 text-primary" />
            Autores em Destaque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {popularAuthors.map((author, index) => (
            <div key={author.id}>
              <Link 
                to={`/author/${author.id}`}
                className="flex items-center space-x-3 hover:bg-accent/10 p-2 rounded-lg transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={author.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {author.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <p className="text-sm font-medium truncate">{author.name}</p>
                    {author.is_verified && (
                      <Badge variant="default" className="text-xs bg-gradient-to-r from-primary to-secondary text-white">✓</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Quote className="w-3 h-3 mr-1" />
                      {author.quotes_count}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {author.total_views}
                    </span>
                  </div>
                </div>
              </Link>
              {index < popularAuthors.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Another Generic Ad */}
      <AdBanner 
        type="generic"
        adData={sidebarAds[1]}
        className="w-full"
      />
    </aside>
  );
};

export default Sidebar;