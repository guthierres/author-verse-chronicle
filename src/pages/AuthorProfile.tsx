import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import QuoteCard from '@/components/quotes/QuoteCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, ExternalLink } from 'lucide-react';

const AuthorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<any>(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAuthor();
      fetchAuthorQuotes();
    }
  }, [id]);

  const fetchAuthor = async () => {
    const { data } = await supabase
      .from('authors')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    setAuthor(data);
  };

  const fetchAuthorQuotes = async () => {
    const { data } = await supabase
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
      .eq('author_id', id)
      .eq('is_approved', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    setQuotes(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Autor não encontrado</h1>
          <Button asChild>
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
  }

  const socialLinks = author.social_links as any || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao timeline
          </Link>
        </Button>

        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={author.avatar_url} />
                <AvatarFallback className="text-xl">
                  {author.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{author.name}</h1>
                {author.is_verified && (
                  <Badge variant="default">✓ Verificado</Badge>
                )}
              </div>
              
              {author.bio && (
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  {author.bio}
                </p>
              )}

              {(socialLinks.twitter || socialLinks.instagram || socialLinks.website) && (
                <div className="flex justify-center gap-2">
                  {socialLinks.twitter && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Twitter
                      </a>
                    </Button>
                  )}
                  {socialLinks.instagram && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  {socialLinks.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={socialLinks.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Frases de {author.name} ({quotes.length})</h2>
          
          {quotes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  Este autor ainda não publicou nenhuma frase.
                </p>
              </CardContent>
            </Card>
          ) : (
            quotes.map((quote: any) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;