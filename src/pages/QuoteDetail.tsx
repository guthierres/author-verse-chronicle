import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import QuoteCard from '@/components/quotes/QuoteCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, Send, ArrowLeft, MessageCircle } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  authors: {
    id: string;
    name: string;
    avatar_url?: string;
    is_verified: boolean;
  };
}

const QuoteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [quote, setQuote] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [author, setAuthor] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchQuoteByNumber();
      fetchComments();
      registerView();
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchCurrentAuthor();
    }
  }, [user]);

  const fetchCurrentAuthor = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('authors')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);

    if (data && data.length > 0) {
      setAuthor(data[0]);
    }
  };

  const fetchQuoteByNumber = async () => {
    // First, get all quotes and find the one with matching number
    const { data: allQuotes } = await supabase
      .from('quotes')
      .select(`
        id,
        content,
        created_at,
        views_count,
        shares_count,
        likes_count,
        authors (
          id,
          name,
          avatar_url,
          is_verified
        )
      `)
      .eq('is_approved', true)
      .eq('is_active', true);

    if (allQuotes) {
      // Find quote by generated number
      const targetQuote = allQuotes.find(q => {
        const hash = q.id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const number = Math.abs(hash) % 100000;
        const quoteNumber = number.toString().padStart(5, '0');
        return quoteNumber === id;
      });

      if (targetQuote) {
        setQuote(targetQuote);
      }
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    if (!quote) return;

    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        authors (
          id,
          name,
          avatar_url,
          is_verified
        )
      `)
      .eq('quote_id', quote.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });

    if (data) {
      setComments(data);
    }
  };

  const registerView = async () => {
    if (!quote) return;

    // Register view
    const viewData: any = {
      quote_id: quote.id,
      viewer_ip: 'anonymous'
    };

    if (user && author) {
      viewData.author_id = author.id;
    }

    await supabase.from('quote_views').insert(viewData);

    // Update view count
    const { data: currentQuote } = await supabase
      .from('quotes')
      .select('views_count')
      .eq('id', quote.id)
      .limit(1);

    if (currentQuote && currentQuote.length > 0) {
      await supabase
        .from('quotes')
        .update({ views_count: (currentQuote[0].views_count || 0) + 1 })
        .eq('id', quote.id);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para comentar.",
        variant: "destructive"
      });
      return;
    }

    if (!author) {
      toast({
        title: "Erro",
        description: "Perfil de autor não encontrado.",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setSubmittingComment(true);

    const { error } = await supabase
      .from('comments')
      .insert({
        quote_id: quote.id,
        author_id: author.id,
        content: newComment.trim(),
        is_approved: false // Precisa de moderação
      });

    if (error) {
      toast({
        title: "Erro ao enviar comentário",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setNewComment('');
      toast({
        title: "Comentário enviado!",
        description: "Seu comentário está sendo analisado e aparecerá após aprovação."
      });
    }

    setSubmittingComment(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quote) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao timeline
          </Link>
        </Button>

        {/* Quote */}
        <div className="mb-8">
          <QuoteCard quote={quote} showFullContent={true} />
        </div>

        <Separator className="my-8" />

        {/* Comments Section */}
        <div id="comments">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <MessageCircle className="w-6 h-6 mr-2" />
            Comentários ({comments.length})
          </h2>

          {/* Add Comment Form */}
          {user ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Deixe seu comentário</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <Textarea
                    placeholder="O que você achou desta frase? Compartilhe seus pensamentos..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {newComment.length}/500
                    </span>
                    <Button type="submit" disabled={submittingComment || !newComment.trim()} className="earth-gradient">
                      {submittingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Send className="mr-2 h-4 w-4" />
                      Comentar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Seu comentário passará por moderação antes de aparecer.
                  </p>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Faça login para deixar um comentário
                </p>
                <Button asChild className="earth-gradient">
                  <Link to="/auth">Entrar</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Seja o primeiro a comentar esta frase!
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.authors.avatar_url} />
                        <AvatarFallback>
                          {comment.authors.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-sm">
                            {comment.authors.name}
                          </span>
                          {comment.authors.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              ✓ Verificado
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetail;