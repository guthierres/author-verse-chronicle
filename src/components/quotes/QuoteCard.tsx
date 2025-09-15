import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  Copy,
  Twitter,
  Facebook,
  MessageSquare,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Quote {
  id: string;
  content: string;
  created_at: string;
  views_count: number;
  shares_count: number;
  authors: {
    id: string;
    name: string;
    avatar_url?: string;
    is_verified: boolean;
  };
}

interface QuoteCardProps {
  quote: Quote;
  showFullContent?: boolean;
}

const QuoteCard = ({ quote, showFullContent = false }: QuoteCardProps) => {
  const { user } = useAuth();
  const [reactionCount, setReactionCount] = useState(0);
  const [hasReacted, setHasReacted] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isReacting, setIsReacting] = useState(false);

  const shouldTruncate = !showFullContent && quote.content.length > 300;
  const displayContent = shouldTruncate 
    ? quote.content.substring(0, 300) + '...' 
    : quote.content;

  useEffect(() => {
    fetchReactionData();
    fetchCommentCount();
    if (user) {
      checkUserReaction();
    }
  }, [quote.id, user]);

  const fetchReactionData = async () => {
    const { count } = await supabase
      .from('reactions')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quote.id);
    
    setReactionCount(count || 0);
  };

  const fetchCommentCount = async () => {
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quote.id)
      .eq('is_approved', true);
    
    setCommentCount(count || 0);
  };

  const checkUserReaction = async () => {
    if (!user) return;

    const { data: author } = await supabase
      .from('authors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!author) return;

    const { data } = await supabase
      .from('reactions')
      .select('id')
      .eq('quote_id', quote.id)
      .eq('author_id', author.id)
      .single();

    setHasReacted(!!data);
  };

  const handleReaction = async () => {
    if (!user || isReacting) return;

    setIsReacting(true);

    const { data: author } = await supabase
      .from('authors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!author) {
      toast({
        title: "Erro",
        description: "Perfil de autor não encontrado",
        variant: "destructive"
      });
      setIsReacting(false);
      return;
    }

    if (hasReacted) {
      // Remove reaction
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('quote_id', quote.id)
        .eq('author_id', author.id);

      if (!error) {
        setHasReacted(false);
        setReactionCount(prev => prev - 1);
      }
    } else {
      // Add reaction
      const { error } = await supabase
        .from('reactions')
        .insert({
          quote_id: quote.id,
          author_id: author.id
        });

      if (!error) {
        setHasReacted(true);
        setReactionCount(prev => prev + 1);
      }
    }

    setIsReacting(false);
  };

  const handleShare = async (platform: string) => {
    const quoteUrl = `${window.location.origin}/quote/${quote.id}`;
    const text = `"${quote.content}" - ${quote.authors.name}`;

    // Register share
    if (user) {
      const { data: author } = await supabase
        .from('authors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (author) {
        await supabase.from('quote_shares').insert({
          quote_id: quote.id,
          platform,
          author_id: author.id
        });
      }
    } else {
      await supabase.from('quote_shares').insert({
        quote_id: quote.id,
        platform
      });
    }

    // Update share count
    await supabase
      .from('quotes')
      .update({ shares_count: (quote.shares_count || 0) + 1 })
      .eq('id', quote.id);

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(quoteUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(quoteUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + quoteUrl)}`;
        break;
      case 'copy':
        await navigator.clipboard.writeText(quoteUrl);
        toast({
          title: "Link copiado!",
          description: "O link da frase foi copiado para a área de transferência."
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const timeAgo = formatDistanceToNow(new Date(quote.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Author info */}
        <div className="flex items-center space-x-3 mb-4">
          <Link to={`/author/${quote.authors.id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={quote.authors.avatar_url} />
              <AvatarFallback>
                {quote.authors.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Link 
                to={`/author/${quote.authors.id}`} 
                className="font-semibold hover:text-primary transition-colors"
              >
                {quote.authors.name}
              </Link>
              {quote.authors.is_verified && (
                <Badge variant="secondary" className="text-xs">
                  ✓ Verificado
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{timeAgo}</p>
          </div>
        </div>

        {/* Quote content */}
        <div className="mb-4">
          <blockquote className="text-lg leading-relaxed text-foreground">
            "{displayContent}"
          </blockquote>
          {shouldTruncate && (
            <Link 
              to={`/quote/${quote.id}`}
              className="inline-block mt-2 text-primary hover:underline font-medium"
            >
              Ler completo
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReaction}
              disabled={!user || isReacting}
              className={`${hasReacted ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${hasReacted ? 'fill-current' : ''}`} />
              {reactionCount}
            </Button>

            <Button variant="ghost" size="sm" asChild>
              <Link to={`/quote/${quote.id}#comments`}>
                <MessageCircle className="w-4 h-4 mr-1" />
                {commentCount}
              </Link>
            </Button>

            <div className="flex items-center text-sm text-muted-foreground">
              <Eye className="w-4 h-4 mr-1" />
              {quote.views_count || 0}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Compartilhar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleShare('copy')}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('twitter')}>
                <Twitter className="mr-2 h-4 w-4" />
                Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('facebook')}>
                <Facebook className="mr-2 h-4 w-4" />
                Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                WhatsApp
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;