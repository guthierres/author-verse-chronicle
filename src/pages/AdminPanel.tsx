import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, Check, X, Users, Quote, MessageCircle, BarChart3 } from 'lucide-react';

const AdminPanel = () => {
  const [pendingQuotes, setPendingQuotes] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [stats, setStats] = useState({
    totalAuthors: 0,
    totalQuotes: 0,
    totalComments: 0,
    pendingQuotes: 0,
    pendingComments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchPendingQuotes(),
      fetchPendingComments(),
      fetchAuthors(),
      fetchStats()
    ]);
    setLoading(false);
  };

  const fetchPendingQuotes = async () => {
    const { data } = await supabase
      .from('quotes')
      .select(`
        id,
        content,
        created_at,
        authors (name)
      `)
      .eq('is_approved', false)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    setPendingQuotes(data || []);
  };

  const fetchPendingComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        authors (name),
        quotes (content)
      `)
      .eq('is_approved', false)
      .order('created_at', { ascending: true });

    setPendingComments(data || []);
  };

  const fetchAuthors = async () => {
    const { data } = await supabase
      .from('authors')
      .select('*')
      .order('created_at', { ascending: false });

    setAuthors(data || []);
  };

  const fetchStats = async () => {
    const [authorsCount, quotesCount, commentsCount, pendingQuotesCount, pendingCommentsCount] = await Promise.all([
      supabase.from('authors').select('*', { count: 'exact', head: true }),
      supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('is_approved', true),
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_approved', true),
      supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_approved', false)
    ]);

    setStats({
      totalAuthors: authorsCount.count || 0,
      totalQuotes: quotesCount.count || 0,
      totalComments: commentsCount.count || 0,
      pendingQuotes: pendingQuotesCount.count || 0,
      pendingComments: pendingCommentsCount.count || 0
    });
  };

  const approveQuote = async (id: string) => {
    const { error } = await supabase
      .from('quotes')
      .update({ is_approved: true })
      .eq('id', id);

    if (!error) {
      toast({ title: "Frase aprovada!" });
      fetchAllData();
    }
  };

  const rejectQuote = async (id: string) => {
    const { error } = await supabase
      .from('quotes')
      .update({ is_active: false })
      .eq('id', id);

    if (!error) {
      toast({ title: "Frase rejeitada!" });
      fetchAllData();
    }
  };

  const approveComment = async (id: string) => {
    const { error } = await supabase
      .from('comments')
      .update({ is_approved: true })
      .eq('id', id);

    if (!error) {
      toast({ title: "Comentário aprovado!" });
      fetchAllData();
    }
  };

  const toggleAuthorStatus = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('authors')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (!error) {
      toast({ title: `Autor ${!isActive ? 'ativado' : 'desativado'}!` });
      fetchAllData();
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
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie conteúdo e usuários da plataforma</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalAuthors}</p>
              <p className="text-sm text-muted-foreground">Autores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Quote className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalQuotes}</p>
              <p className="text-sm text-muted-foreground">Frases</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalComments}</p>
              <p className="text-sm text-muted-foreground">Comentários</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-amber-100 rounded-full flex items-center justify-center">
                <Quote className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingQuotes}</p>
              <p className="text-sm text-muted-foreground">Frases Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-amber-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingComments}</p>
              <p className="text-sm text-muted-foreground">Comentários Pendentes</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="quotes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quotes">Frases Pendentes ({stats.pendingQuotes})</TabsTrigger>
            <TabsTrigger value="comments">Comentários ({stats.pendingComments})</TabsTrigger>
            <TabsTrigger value="authors">Autores ({stats.totalAuthors})</TabsTrigger>
          </TabsList>

          <TabsContent value="quotes" className="space-y-4">
            {pendingQuotes.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Nenhuma frase pendente de aprovação</p>
                </CardContent>
              </Card>
            ) : (
              pendingQuotes.map((quote: any) => (
                <Card key={quote.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <blockquote className="text-lg mb-2">"{quote.content}"</blockquote>
                        <p className="text-sm text-muted-foreground">
                          Por {quote.authors.name} • {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" onClick={() => approveQuote(quote.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => rejectQuote(quote.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {pendingComments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Nenhum comentário pendente</p>
                </CardContent>
              </Card>
            ) : (
              pendingComments.map((comment: any) => (
                <Card key={comment.id}>
                  <CardContent className="pt-4">
                    <p className="mb-2">{comment.content}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Por {comment.authors.name} em "{comment.quotes.content.substring(0, 50)}..."
                    </p>
                    <Button size="sm" onClick={() => approveComment(comment.id)}>
                      <Check className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="authors" className="space-y-4">
            <div className="grid gap-4">
              {authors.map((author: any) => (
                <Card key={author.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {author.name}
                          {author.is_verified && <Badge variant="default" className="text-xs">✓</Badge>}
                          <Badge variant={author.is_active ? "default" : "secondary"}>
                            {author.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground">{author.bio}</p>
                        <p className="text-xs text-muted-foreground">
                          Criado em {new Date(author.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        variant={author.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleAuthorStatus(author.id, author.is_active)}
                      >
                        {author.is_active ? "Desativar" : "Ativar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;