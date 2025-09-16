import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Check, X, Users, Quote, MessageCircle, BarChart3, Shield, UserPlus, Settings, Megaphone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [pendingQuotes, setPendingQuotes] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adSettings, setAdSettings] = useState({
    ads_enabled: false,
    google_adsense_client: '',
    google_adsense_slot: '',
    ads_frequency: 3,
    ads_responsive: true,
    ads_mobile_enabled: true
  });
  const [stats, setStats] = useState({
    totalAuthors: 0,
    totalQuotes: 0,
    totalComments: 0,
    pendingQuotes: 0,
    pendingComments: 0
  });
  const [loading, setLoading] = useState(true);

  // Redirect non-admin users
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar o painel administrativo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchPendingQuotes(),
      fetchPendingComments(),
      fetchAuthors(),
      fetchStats(),
      fetchAdSettings()
    ]);
    setLoading(false);
  };

  const fetchAdSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['ads_enabled', 'google_adsense_client', 'google_adsense_slot', 'ads_frequency', 'ads_responsive', 'ads_mobile_enabled']);

      if (data) {
        const settingsMap = data.reduce((acc, setting) => {
          let value = setting.value;
          if (setting.key === 'ads_enabled' || setting.key === 'ads_responsive' || setting.key === 'ads_mobile_enabled') {
            value = value === 'true';
          } else if (setting.key === 'ads_frequency') {
            value = parseInt(value) || 3;
          }
          acc[setting.key] = value;
          return acc;
        }, {} as any);

        setAdSettings(prev => ({ ...prev, ...settingsMap }));
      }
    } catch (error) {
      console.error('Erro ao buscar configurações de anúncios:', error);
    }
  };

  const updateAdSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key,
          value: typeof value === 'boolean' ? value.toString() : value.toString()
        });

      if (error) throw error;

      setAdSettings(prev => ({ ...prev, [key]: value }));
      toast({
        title: "Configuração atualizada",
        description: "As configurações de anúncios foram salvas com sucesso."
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive"
      });
    }
  };

  const fetchPendingQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          content,
          created_at,
          authors (
            name,
            user_id
          )
        `)
        .eq('is_approved', false)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar frases pendentes:', error);
        toast({
          title: "Erro ao carregar frases pendentes",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setPendingQuotes(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar frases pendentes:', error);
    }
  };

  const fetchPendingComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          authors (
            name,
            user_id
          )
        `)
        .eq('is_approved', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar comentários pendentes:', error);
        toast({
          title: "Erro ao carregar comentários pendentes",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setPendingComments(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar comentários pendentes:', error);
    }
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

  const promoteToAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Digite o email do usuário para promover a admin",
        variant: "destructive"
      });
      return;
    }

    try {
      // First check if user exists by email in authors table
      const { data: authorData, error: authorError } = await supabase
        .from('authors')
        .select('user_id, name')
        .eq('name', newAdminEmail)
        .single();

      if (authorError || !authorData) {
        toast({
          title: "Usuário não encontrado",
          description: "Email não encontrado no sistema",
          variant: "destructive"
        });
        return;
      }

      // Insert or update user role to admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: authorData.user_id,
          role: 'admin'
        });

      if (roleError) {
        toast({
          title: "Erro ao promover usuário",
          description: roleError.message,
          variant: "destructive"
        });
      } else {
        toast({ title: "Usuário promovido a administrador com sucesso!" });
        setNewAdminEmail('');
        fetchAllData();
      }
    } catch (error) {
      console.error('Erro ao promover usuário:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em instantes",
        variant: "destructive"
      });
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
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Gerencie conteúdo e usuários da plataforma</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="pt-4 sm:pt-6 text-center">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-primary" />
              <p className="text-xl sm:text-2xl font-bold">{stats.totalAuthors}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Autores</p>
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
          <TabsList className="grid w-full grid-cols-5 text-xs sm:text-sm">
            <TabsTrigger value="quotes" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Frases Pendentes ({stats.pendingQuotes})</span>
              <span className="sm:hidden">Frases ({stats.pendingQuotes})</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Comentários ({stats.pendingComments})</span>
              <span className="sm:hidden">Coment. ({stats.pendingComments})</span>
            </TabsTrigger>
            <TabsTrigger value="authors" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Autores ({stats.totalAuthors})</span>
              <span className="sm:hidden">Autores ({stats.totalAuthors})</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Anúncios</span>
              <span className="sm:hidden">Ads</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Admins</span>
              <span className="sm:hidden">Admin</span>
            </TabsTrigger>
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

          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Configurações de Anúncios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ads-enabled" className="text-base font-medium">
                      Habilitar Anúncios
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar ou desativar a exibição de anúncios na plataforma
                    </p>
                  </div>
                  <Switch
                    id="ads-enabled"
                    checked={adSettings.ads_enabled}
                    onCheckedChange={(checked) => updateAdSetting('ads_enabled', checked)}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adsense-client">Google AdSense Client ID</Label>
                    <Input
                      id="adsense-client"
                      placeholder="ca-pub-xxxxxxxxxxxxxxxxx"
                      value={adSettings.google_adsense_client}
                      onChange={(e) => setAdSettings(prev => ({ ...prev, google_adsense_client: e.target.value }))}
                      onBlur={(e) => updateAdSetting('google_adsense_client', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Seu ID de cliente do Google AdSense
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="adsense-slot">Google AdSense Slot ID</Label>
                    <Input
                      id="adsense-slot"
                      placeholder="1234567890"
                      value={adSettings.google_adsense_slot}
                      onChange={(e) => setAdSettings(prev => ({ ...prev, google_adsense_slot: e.target.value }))}
                      onBlur={(e) => updateAdSetting('google_adsense_slot', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      ID do slot de anúncio padrão
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="ads-frequency">Frequência de Anúncios</Label>
                    <Input
                      id="ads-frequency"
                      type="number"
                      min="1"
                      max="10"
                      value={adSettings.ads_frequency}
                      onChange={(e) => setAdSettings(prev => ({ ...prev, ads_frequency: parseInt(e.target.value) || 3 }))}
                      onBlur={(e) => updateAdSetting('ads_frequency', parseInt(e.target.value) || 3)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Exibir um anúncio a cada X frases (padrão: 3)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ads-responsive">Anúncios Responsivos</Label>
                      <p className="text-sm text-muted-foreground">
                        Adaptar anúncios automaticamente ao tamanho da tela
                      </p>
                    </div>
                    <Switch
                      id="ads-responsive"
                      checked={adSettings.ads_responsive}
                      onCheckedChange={(checked) => updateAdSetting('ads_responsive', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ads-mobile">Anúncios em Dispositivos Móveis</Label>
                      <p className="text-sm text-muted-foreground">
                        Exibir anúncios em smartphones e tablets
                      </p>
                    </div>
                    <Switch
                      id="ads-mobile"
                      checked={adSettings.ads_mobile_enabled}
                      onCheckedChange={(checked) => updateAdSetting('ads_mobile_enabled', checked)}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">💡 Dicas para Anúncios</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Configure sua conta no Google AdSense antes de ativar</li>
                    <li>• Teste diferentes frequências para otimizar receita</li>
                    <li>• Anúncios responsivos se adaptam melhor a diferentes telas</li>
                    <li>• Monitore o desempenho regularmente no painel do AdSense</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Promover Usuário a Admin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Digite o email do usuário (nome usado no cadastro) para promovê-lo a administrador.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Email do usuário..."
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={promoteToAdmin}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Promover
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Proteção de Senha Vazada</p>
                      <p className="text-sm text-muted-foreground">
                        Ative a proteção contra senhas vazadas no painel do Supabase
                      </p>
                    </div>
                    <Badge variant="outline" className="text-amber-600">
                      Recomendado
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;