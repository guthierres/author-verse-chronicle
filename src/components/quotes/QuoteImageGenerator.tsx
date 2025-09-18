import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Image } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface QuoteImageGeneratorProps {
  quote: {
    content: string;
    authors: {
      name: string;
    };
  };
}

export const QuoteImageGenerator = ({ quote }: QuoteImageGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = (format: 'square' | 'story') => {
    if (isGenerating) return;
    setIsGenerating(true);

    const canvas = canvasRef.current;
    if (!canvas) {
      setIsGenerating(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // Canvas dimensions based on format
    let canvasWidth, canvasHeight;
    if (format === 'square') {
      canvasWidth = canvasHeight = 1080; // Instagram post format
    } else {
      canvasWidth = 1080;
      canvasHeight = 1920; // Instagram story format
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Enable high DPI rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width *= dpr;
    canvas.height *= dpr;
    ctx.scale(dpr, dpr);
    
    // Create gradient background matching ParaFrase brand colors
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, 'hsl(18, 55%, 51%)'); // Coral
    gradient.addColorStop(0.5, 'hsl(19, 60%, 51%)'); // Middle tone
    gradient.addColorStop(1, 'hsl(20, 65%, 51%)'); // Orange
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Add subtle pattern overlay for texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < canvasWidth; i += 40) {
      for (let j = 0; j < canvasHeight; j += 40) {
        ctx.fillRect(i, j, 1, 1);
      }
    }

    // Add ParaFrase logo area (simplified geometric representation)
    const logoSize = format === 'square' ? 60 : 80;
    const logoX = 60;
    const logoY = 60;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 15);
    ctx.fill();
    
    // Quote icon representation
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = `bold ${logoSize * 0.5}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('"', logoX + logoSize/2, logoY + logoSize * 0.65);

    // Add ParaFrase logo text
    ctx.font = `bold ${format === 'square' ? '20px' : '24px'} Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'left';
    ctx.fillText('ParaFrase', logoX + logoSize + 20, logoY + logoSize * 0.65);

    // Quote text styling
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Calculate available space for text
    const padding = 80;
    const maxWidth = canvasWidth - (padding * 2);
    const availableHeight = canvasHeight - 300; // Space for logo, author, and margins
    
    // Determine optimal font size based on content length and available space
    let fontSize = format === 'square' ? 42 : 48;
    let lineHeight = fontSize * 1.4;
    let lines: string[] = [];
    
    // Function to break text into lines
    const breakTextIntoLines = (text: string, maxWidth: number, fontSize: number) => {
      ctx.font = `bold ${fontSize}px Georgia, serif`;
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    // Adjust font size to fit content
    do {
      lines = breakTextIntoLines(quote.content, maxWidth, fontSize);
      const totalTextHeight = lines.length * lineHeight;
      
      if (totalTextHeight <= availableHeight) {
        break; // Text fits
      }
      
      fontSize -= 2;
      lineHeight = fontSize * 1.4;
    } while (fontSize > 20); // Minimum font size

    // Draw quote text
    ctx.font = `bold ${fontSize}px Georgia, serif`;
    const startY = canvasHeight / 2 - (lines.length * lineHeight) / 2;
    
    lines.forEach((line, i) => {
      let displayLine = line;
      if (i === 0) {
        displayLine = `"${line}`;
      }
      if (i === lines.length - 1) {
        displayLine = displayLine + '"';
      }
      ctx.fillText(displayLine, canvasWidth / 2, startY + i * lineHeight);
    });

    // Reset shadow for author name
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Author name
    const authorFontSize = Math.max(24, fontSize * 0.7);
    ctx.font = `italic ${authorFontSize}px Georgia, serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText(`— ${quote.authors.name}`, canvasWidth / 2, startY + lines.length * lineHeight + 60);

    // Add decorative elements
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Top decorative line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 - 100, startY - 40);
    ctx.lineTo(canvasWidth / 2 + 100, startY - 40);
    ctx.stroke();
    
    // Bottom decorative line
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 - 100, startY + lines.length * lineHeight + 100);
    ctx.lineTo(canvasWidth / 2 + 100, startY + lines.length * lineHeight + 100);
    ctx.stroke();

    // Enhanced watermark with ParaFrase branding
    ctx.font = '16px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('ParaFrase - Frases que inspiram', canvasWidth / 2, canvasHeight - 30);

    // Download image
    const formatName = format === 'square' ? 'post' : 'story';
    const link = document.createElement('a');
    link.download = `parafrase-${formatName}-${quote.authors.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    toast({
      title: "Imagem gerada!",
      description: `Imagem para ${format === 'square' ? 'postagem' : 'story'} baixada com sucesso.`
    });

    setIsGenerating(false);
  };

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isGenerating}
            className="w-full justify-start p-2 h-auto hover:bg-accent"
          >
            <Image className="w-4 h-4 mr-2" />
            Baixar imagem
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => generateImage('square')} disabled={isGenerating}>
            <Download className="w-4 h-4 mr-2" />
            Quadrado (Post)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => generateImage('story')} disabled={isGenerating}>
            <Download className="w-4 h-4 mr-2" />
            Vertical (Story)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
