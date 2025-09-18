import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { QuoteImageGenerator } from './QuoteImageGenerator';
import { 
  Copy, 
  Link, 
  Facebook, 
  Twitter, 
  MessageSquare, 
  Send,
  X 
} from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: {
    id: string;
    content: string;
    authors: {
      id: string;
      name: string;
    };
  };
  quoteNumber: string;
  onShare: (platform: string) => void;
}

export const ShareDialog = ({ open, onOpenChange, quote, quoteNumber, onShare }: ShareDialogProps) => {
  const quoteUrl = `${window.location.origin}/quote/${quoteNumber}`;
  const text = `"${quote.content}" - ${quote.authors.name}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(quoteUrl);
      toast({
        title: "Link copiado!",
        description: "O link da frase foi copiado para a área de transferência."
      });
      onShare('copy');
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      });
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Texto copiado!",
        description: "A frase foi copiada para a área de transferência."
      });
      onShare('copy-quote');
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive"
      });
    }
  };

  const handleSocialShare = (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(quoteUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(quoteUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + quoteUrl)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(quoteUrl)}&text=${encodeURIComponent(text)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      onShare(platform);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="flex items-center justify-center gap-2 text-lg">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white/80" />
            </div>
            Compartilhar Frase #{quoteNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quote Preview */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border">
            <blockquote className="text-sm italic text-center mb-2 leading-relaxed">
              "{quote.content.length > 100 ? quote.content.substring(0, 100) + '...' : quote.content}"
            </blockquote>
            <cite className="text-xs text-muted-foreground text-center block">
              — {quote.authors.name}
            </cite>
          </div>

          {/* Copy Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 h-12 rounded-xl"
            >
              <Link className="w-4 h-4" />
              <span className="text-sm">Copiar Link</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyText}
              className="flex items-center justify-center gap-2 h-12 rounded-xl"
            >
              <Copy className="w-4 h-4" />
              <span className="text-sm">Copiar Texto</span>
            </Button>
          </div>

          {/* Generate Image */}
          <div className="w-full">
            <QuoteImageGenerator quote={quote} />
          </div>

          {/* Social Share */}
          <div>
            <p className="text-sm text-muted-foreground mb-3 text-center">Compartilhar em:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center justify-center gap-2 h-12 rounded-xl hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Facebook</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center justify-center gap-2 h-12 rounded-xl hover:bg-sky-50 hover:border-sky-200 dark:hover:bg-sky-950"
              >
                <Twitter className="w-4 h-4 text-sky-500" />
                <span className="text-sm">Twitter</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare('whatsapp')}
                className="flex items-center justify-center gap-2 h-12 rounded-xl hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950"
              >
                <MessageSquare className="w-4 h-4 text-green-600" />
                <span className="text-sm">WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare('telegram')}
                className="flex items-center justify-center gap-2 h-12 rounded-xl hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950"
              >
                <Send className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Telegram</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
