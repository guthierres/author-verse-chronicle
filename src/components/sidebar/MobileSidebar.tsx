import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, Users } from 'lucide-react';
import AdBanner from '@/components/ads/AdBanner';

interface TopQuote {
  id: string;
  content: string;
  views_count: number;
  authors: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface TopAuthor {
  id: string;
  name: string;
  avatar_url?: string;
  is_verified: boolean;
  quote_count: number;
}

export const MobileSidebar = () => {
  const [topQuotes, setTopQuotes] = useState<TopQuote[]>([]);
  const [topAuthors, setTopAuthors] = useState<TopAuthor[]>([]);

  useEffect(() => {
    fetchTopContent();
  }, []);

  const fetchTopContent = async () => {
    // Fetch top 5 most viewed quotes
    const { data: quotes } = await supabase
      .from('quotes')
      .select(`
        id,
        content,
        views_count,
        authors (
          id,
          name,
          avatar_url
        )
      `)
      .eq('is_approved', true)
      .eq('is_active', true)
      .order('views_count', { ascending: false })
      .limit(5);

    if (quotes) {
      setTopQuotes(quotes);
    }

    // Fetch top 5 authors by quote count
    const { data: authors } = await supabase
      .from('authors')
      .select(`
        id,
        name,
        avatar_url,
        is_verified,
        quotes!inner(id)
      `)
      .eq('is_active', true)
      .eq('quotes.is_approved', true)
      .eq('quotes.is_active', true);

    if (authors) {
      const authorsWithCounts = authors.map(author => ({
        ...author,
        quote_count: author.quotes?.length || 0
      }))
      .sort((a, b) => b.quote_count - a.quote_count)
      .slice(0, 5);

      setTopAuthors(authorsWithCounts);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="w-full bg-background border-t border-border p-4 space-y-6">
      {/* Top Quotes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Frases Mais Vistas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topQuotes.map((quote, index) => (
            <Link 
              key={quote.id} 
              to={`/author/${quote.authors.id}`}
              className="block p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-justify leading-tight">
                    "{truncateText(quote.content, 80)}"
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground truncate">
                      — {quote.authors.name}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {quote.views_count || 0}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Top Authors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Autores Populares
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topAuthors.map((author, index) => (
            <Link 
              key={author.id} 
              to={`/author/${author.id}`}
              className="block p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={author.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {author.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {author.name}
                    </span>
                    {author.is_verified && (
                      <Badge variant="default" className="text-xs earth-gradient text-white">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {author.quote_count} frases
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Ad Banner */}
      <AdBanner format="rectangle" responsive className="w-full max-w-[300px] mx-auto" />
    </div>
  );
};