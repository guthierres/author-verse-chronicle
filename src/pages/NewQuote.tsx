import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, Send, AlertCircle } from 'lucide-react';

const NewQuote = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [author, setAuthor] = useState<any>(null);

  useEffect(() => {
    if (user && !loading) {
      fetchAuthorProfile();
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

  const fetchAuthorProfile = async () => {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setAuthor(data);
    } else if (error) {
      console.error('Error fetching author profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, escreva sua frase antes de enviar.",
        variant: "destructive"
      });
      return;
    }

    if (content.length < 10) {
      toast({
        title: "Frase muito curta",
        description: "Sua frase deve ter pelo menos 10 caracteres.",
        variant: "destructive"
      });
      return;
    }

    if (!author) {
      toast({
        title: "Erro",
        description: "Perfil de autor não encontrado. Tente novamente.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('quotes')
      .insert({
        content: content.trim(),
        author_id: author.id,
        is_approved: false // Pendente de moderação
      });

    if (error) {
      toast({
        title: "Erro ao enviar frase",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Frase enviada com sucesso!",
        description: "Sua frase está sendo analisada e aparecerá na timeline após aprovação."
      });
      navigate('/');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Nova Frase</CardTitle>
            <div className="flex items-center justify-center gap-2 pt-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">
                Sua frase passará por moderação antes de aparecer na timeline
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Author info */}
              {author && (
                <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {author.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{author.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={author.is_verified ? "default" : "secondary"} className="text-xs">
                        {author.is_verified ? "✓ Verificado" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Quote content */}
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Sua frase inspiradora
                </label>
                <Textarea
                  id="content"
                  placeholder="Escreva aqui sua frase... Uma boa frase pode inspirar, motivar e transformar a vida de alguém."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="resize-none"
                  maxLength={2000}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Mínimo: 10 caracteres</span>
                  <span>{content.length}/2000</span>
                </div>
              </div>

              {/* Preview */}
              {content.trim() && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pré-visualização</label>
                  <div className="p-4 bg-card border rounded-lg">
                    <blockquote className="text-lg italic">
                      "{content.trim()}"
                    </blockquote>
                    <cite className="block mt-2 text-sm text-muted-foreground">
                      — {author?.name || 'Você'}
                    </cite>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="space-y-4">
                <Button type="submit" className="w-full" disabled={isSubmitting || !content.trim()}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Send className="mr-2 h-4 w-4" />
                  Enviar frase para moderação
                </Button>

                <div className="text-center">
                  <Button variant="ghost" onClick={() => navigate('/')}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewQuote;