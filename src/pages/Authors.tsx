import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Author {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
  quotes_count?: number;
}

const Authors = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const { data: authorsData, error } = await supabase
        .from('authors')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar contagem de frases para cada autor
      const authorsWithCounts = await Promise.all(
        (authorsData || []).map(async (author) => {
          const { count } = await supabase
            .from('quotes')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', author.id)
            .eq('is_approved', true)
            .eq('is_active', true);

          return {
            ...author,
            quotes_count: count || 0
          };
        })
      );

      setAuthors(authorsWithCounts);
    } catch (error) {
      console.error('Erro ao buscar autores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Autores</h1>
          <p className="text-muted-foreground">Conheça os pensadores que compartilham sua sabedoria</p>
        </div>

        {authors.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum autor encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author) => (
              <Link key={author.id} to={`/author/${author.id}`}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="w-16 h-16 mb-4">
                        <AvatarImage src={author.avatar_url || undefined} />
                        <AvatarFallback className="text-lg font-semibold">
                          {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{author.name}</h3>
                        {author.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Verificado
                          </Badge>
                        )}
                      </div>
                      
                      {author.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {author.bio}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Quote className="w-4 h-4" />
                        <span>{author.quotes_count} frases</span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Desde {new Date(author.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Authors;