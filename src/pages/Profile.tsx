import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import QuoteCard from '@/components/quotes/QuoteCard';
import { Loader2, Save, User, Quote, BarChart3 } from 'lucide-react';

const Profile = () => {
  const { user, loading } = useAuth();
  const [author, setAuthor] = useState<any>(null);
  const [quotes, setQuotes] = useState([]);
  const [stats, setStats] = useState({
    totalQuotes: 0,
    totalViews: 0,
    totalReactions: 0,
    totalShares: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    social_links: {
      twitter: '',
      instagram: '',
      website: ''
    }
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      fetchAuthorData();
      fetchUserQuotes();
      fetchStats();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchAuthorData = async () => {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      const socialLinks = data.social_links as { twitter: string; instagram: string; website: string; } | null;

      setAuthor(data);
      setFormData({
        name: data.name || '',
        bio: data.bio || '',
        social_links: socialLinks || {
          twitter: '',
          instagram: '',
          website: ''
        }
      });
    }
    setFetchingData(false);
  };

  const fetchUserQuotes = async () => {
    if (!user) return;

    const { data: authorData } = await supabase
      .from('authors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!authorData) return;

    const { data, error } = await supabase
      .from('quotes')
      .select(`
        id,
        content,
        created_at,
        views_count,
        shares_count,
        is_approved,
        is_active,
        authors (
          id,
          name,
          avatar_url,
          is_verified
        )
      `)
      .eq('author_id', authorData.id)
      .order('created_at', { ascending: false });

    if (data) {
      setQuotes(data);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    const { data: authorData } = await supabase
      .from('authors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!authorData) return;

    const { count: totalQuotes } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', authorData.id)
      .eq('is_approved', true);

    const { data: viewsData } = await supabase
      .from('quotes')
      .select('views_count')
      .eq('author_id', authorData.id)
      .eq('is_approved', true);

    const totalViews = viewsData?.reduce((sum, quote) => sum + (quote.views_count || 0), 0) || 0;

    const { data: sharesData } = await supabase
      .from('quotes')
      .select('shares_count')
      .eq('author_id', authorData.id)
      .eq('is_approved', true);

    const totalShares = sharesData?.reduce((sum, quote) => sum + (quote.shares_count || 0), 0) || 0;

    const { count: totalReactions } = await supabase
      .from('reactions')
      .select('*', { count: 'exact', head: true })
      .in('quote_id', quotes.filter(q => q.is_approved).map(q => q.id));

    setStats({
      totalQuotes: totalQuotes || 0,
      totalViews,
      totalShares,
      totalReactions: totalReactions || 0
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!author) return;

    setIsUpdating(true);

    const { error } = await supabase
      .from('authors')
      .update({
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        social_links: formData.social_links
      })
      .eq('id', author.id);

    if (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso."
      });
      fetchAuthorData();
    }

    setIsUpdating(false);
  };

  const getQuoteStatus = (quote: any) => {
    if (!quote.is_active) return { label: 'Inativo', color: 'destructive' };
    if (!quote.is_approved) return { label: 'Pendente', color: 'secondary' };
    return { label: 'Aprovado', color: 'default' };
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={author?.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {author?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="flex items-center justify-center gap-2">
                  {author?.name}
                  {author?.is_verified && (
                    <Badge variant="default" className="text-xs">
                      ✓ Verificado
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  {author?.bio || 'Sem biografia'}
                </p>
              </CardHeader>
            </Card>

            {/* Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{stats.totalQuotes}</p>
                    <p className="text-sm text-muted-foreground">Frases</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{stats.totalViews}</p>
                    <p className="text-sm text-muted-foreground">Visualizações</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{stats.totalReactions}</p>
                    <p className="text-sm text-muted-foreground">Reações</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{stats.totalShares}</p>
                    <p className="text-sm text-muted-foreground">Compartilhamentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="quotes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quotes">Minhas Frases</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>

              <TabsContent value="quotes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Quote className="w-5 h-5 mr-2" />
                      Suas Frases ({quotes.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {quotes.length === 0 ? (
                      <div className="text-center py-8">
                        <Quote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Você ainda não criou nenhuma frase.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Linha alterada */}
                        {quotes.map((quote: any) => {
                          const status = getQuoteStatus(quote);
                          return (
                            <Card key={quote.id}> {/* Linha alterada */}
                              <CardContent className="p-4"> {/* Linha alterada */}
                                <div className="flex items-start justify-between mb-2">
                                  <Badge variant={status.color as any} className="text-xs">
                                    {status.label}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                                <blockquote className="text-sm mb-2">
                                  "{quote.content.length > 150 
                                    ? quote.content.substring(0, 150) + '...' 
                                    : quote.content}"
                                </blockquote>
                                <div className="flex items-center text-xs text-muted-foreground space-x-4">
                                  <span>👁 {quote.views_count || 0}</span>
                                  <span>📤 {quote.shares_count || 0}</span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Editar Perfil
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Seu nome"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Biografia</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Conte um pouco sobre você..."
                          rows={3}
                          maxLength={200}
                        />
                        <span className="text-xs text-muted-foreground">
                          {formData.bio.length}/200
                        </span>
                      </div>

                      <div className="space-y-4">
                        <Label>Redes Sociais</Label>
                        <div className="space-y-3">
                          <Input
                            placeholder="Twitter/X"
                            value={formData.social_links.twitter}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              social_links: { ...prev.social_links, twitter: e.target.value }
                            }))}
                          />
                          <Input
                            placeholder="Instagram"
                            value={formData.social_links.instagram}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              social_links: { ...prev.social_links, instagram: e.target.value }
                            }))}
                          />
                          <Input
                            placeholder="Website"
                            value={formData.social_links.website}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              social_links: { ...prev.social_links, website: e.target.value }
                            }))}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;