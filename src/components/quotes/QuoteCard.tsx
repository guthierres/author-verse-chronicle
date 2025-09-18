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
import { useViewTracker } from '@/hooks/useViewTracker';
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
  StickyNote
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { QuoteImageGenerator } from './QuoteImageGenerator';

interface Quote {
  id: string;
  content: string;
  created_at: string;
  views_count: number;
  shares_count: number;
  likes_count?: number;
  notes?: string;
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
  const [likesCount, setLikesCount] = useState(quote.likes_count || 0);
  const [hasReacted, setHasReacted] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isReacting, setIsReacting] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState<string>('');
  
  // Track view when component mounts
  useViewTracker(quote.id, quote.authors.id);

  const shouldTruncate = !showFullContent && quote.content.length > 300;
  const displayContent = shouldTruncate 
    ? quote.content.substring(0, 300) + '...' 
    : quote.content;

  useEffect(() => {
    checkUserReaction();
    fetchCommentCount();
    generateQuoteNumber();
  }, [quote.id, user]);

  const generateQuoteNumber = () => {
    // Generate a 5-digit number based on quote ID
    const hash = quote.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const number = Math.abs(hash) % 100000;
    setQuoteNumber(number.toString().padStart(5, '0'));
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
    if (user) {
      // Usuário autenticado - verificar na tabela reactions
      const { data: author } = await supabase
        .from('authors')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (author && author.length > 0) {
        const { data } = await supabase
          .from('reactions')
          .select('id')
          .eq('quote_id', quote.id)
          .eq('author_id', author[0].id)
          .limit(1);

        setHasReacted(data && data.length > 0);
      }
    } else {
      // Usuário anônimo - verificar localStorage
      const likedQuotes = JSON.parse(localStorage.getItem('liked_quotes_anon') || '[]');
      setHasReacted(likedQuotes.includes(quote.id));
    }
  };

  const handleReaction = async () => {
    if (isReacting) return;
    
    setIsReacting(true);

    if (user) {
      // Usuário autenticado
      const { data: author } = await supabase
        .from('authors')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (!author || author.length === 0) {
        toast({
          title: "Erro",
          description: "Perfil de autor não encontrado",
          variant: "destructive"
        });
        setIsReacting(false);
        return;
      }

      if (hasReacted) {
        // Remover curtida
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('quote_id', quote.id)
          .eq('author_id', author[0].id);

        if (!error) {
          // Decrementar likes_count na tabela quotes
          await supabase
            .from('quotes')
            .update({ likes_count: Math.max(0, likesCount - 1) })
            .eq('id', quote.id);

          setHasReacted(false);
          setLikesCount(prev => Math.max(0, prev - 1));
        }
      } else {
        // Adicionar curtida
        const { error } = await supabase
          .from('reactions')
          .insert({
            quote_id: quote.id,
            author_id: author[0].id
          });

        if (!error) {
          // Incrementar likes_count na tabela quotes
          await supabase
            .from('quotes')
            .update({ likes_count: likesCount + 1 })
            .eq('id', quote.id);

          setHasReacted(true);
          setLikesCount(prev => prev + 1);
        }
      }
    } else {
      // Usuário anônimo
      const likedQuotes = JSON.parse(localStorage.getItem('liked_quotes_anon') || '[]');
      
      if (hasReacted) {
        // Remover curtida
        const updatedLikes = likedQuotes.filter((id: string) => id !== quote.id);
        localStorage.setItem('liked_quotes_anon', JSON.stringify(updatedLikes));
        
        // Decrementar likes_count na tabela quotes
        const { error } = await supabase
          .from('quotes')
          .update({ likes_count: Math.max(0, likesCount - 1) })
          .eq('id', quote.id);

        if (!error) {
          setHasReacted(false);
          setLikesCount(prev => Math.max(0, prev - 1));
        }
      } else {
        // Adicionar curtida
        const updatedLikes = [...likedQuotes, quote.id];
        localStorage.setItem('liked_quotes_anon', JSON.stringify(updatedLikes));
        
        // Incrementar likes_count na tabela quotes
        const { error } = await supabase
          .from('quotes')
          .update({ likes_count: likesCount + 1 })
          .eq('id', quote.id);

        if (!error) {
          setHasReacted(true);
          setLikesCount(prev => prev + 1);
        }
      }
    }

    setIsReacting(false);
  };

  const handleShare = async (platform: string) => {
    const quoteUrl = `${window.location.origin}/quote/${quoteNumber}`;
    const text = `"${quote.content}" - ${quote.authors.name}`;

    // Register share
    if (user) {
      const { data: author } = await supabase
        .from('authors')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (author && author.length > 0) {
        await supabase.from('quote_shares').insert({
          quote_id: quote.id,
          platform,
          author_id: author[0].id
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
      case 'copy-quote':
        await navigator.clipboard.writeText(text);
        toast({
          title: "Frase copiada!",
          description: "A frase foi copiada para a área de transferência."
        });
        return;
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
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 max-w-4xl mx-auto">
      <CardContent className="p-4 sm:p-6">
        {/* Notes */}
        <div className="flex items-center justify-start mb-3">
          {quote.notes && (
            <div className="flex items-center text-muted-foreground">
              <StickyNote className="w-3 h-3 mr-1" />
              <span className="quote-note">Nota disponível</span>
            </div>
          )}
        </div>

        {/* Author info */}
        <div className="flex items-center space-x-3 mb-4">
          <Link to={`/author/${quote.authors.id}`}>
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
              <AvatarImage src={quote.authors.avatar_url} />
              <AvatarFallback className="text-xs sm:text-sm">
                {quote.authors.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Link 
                to={`/author/${quote.authors.id}`} 
                className="font-semibold hover:text-primary transition-colors text-base sm:text-lg truncate"
              >
                {quote.authors.name}
              </Link>
              {quote.authors.is_verified && (
                <Badge variant="default" className="text-xs flex-shrink-0 earth-gradient text-white">
                  ✓
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">{timeAgo}</p>
          </div>
        </div>

        {/* Quote content */}
        <div className="mb-6 cursor-pointer" onClick={() => window.location.href = `/quote/${quoteNumber}`}>
          <blockquote className="text-lg sm:text-xl leading-relaxed text-foreground font-medium text-justify max-w-none">
            "{displayContent}".
          </blockquote>
          {shouldTruncate && (
            <Link 
              to={`/quote/${quoteNumber}`}
              className="inline-block mt-3 text-primary hover:underline font-semibold text-sm"
            >
              Ler completo
            </Link>
          )}
          {quote.notes && (
            <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <p className="text-xs text-muted-foreground/70 italic leading-relaxed">
                Nota: {quote.notes}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 gap-3 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
            <Button
              variant="ghost"
              size="default"
              onClick={handleReaction}
              disabled={isReacting}
              className={`${hasReacted ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950' : 'text-muted-foreground hover:text-red-500'} rounded-full px-4`}
            >
              <Heart className={`w-4 h-4 mr-1 ${hasReacted ? 'fill-current' : ''}`} />
              <span className="hidden xs:inline">{likesCount}</span>
              <span className="xs:hidden">{likesCount > 0 ? likesCount : ''}</span>
            </Button>

            <Button variant="ghost" size="default" asChild className="rounded-full px-4">
              <Link to={`/quote/${quoteNumber}#comments`}>
                <MessageCircle className="w-4 h-4 mr-1" />
                <span className="hidden xs:inline">{commentCount}</span>
                <span className="xs:hidden">{commentCount > 0 ? commentCount : ''}</span>
              </Link>
            </Button>

            <div className="flex items-center text-sm text-muted-foreground px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <Eye className="w-4 h-4 mr-1" />
              <span className="hidden xs:inline">{quote.views_count || 0}</span>
              <span className="xs:hidden">{(quote.views_count || 0) > 0 ? (quote.views_count || 0) : ''}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="default" className="rounded-full px-4 bg-gradient-to-r from-primary to-secondary text-white border-0 hover:from-primary/90 hover:to-secondary/90 shadow-lg">
                <Share2 className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Compartilhar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleShare('copy-quote')}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar frase
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('copy')}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <div className="w-full">
                  <QuoteImageGenerator quote={quote} />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
