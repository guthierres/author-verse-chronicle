import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Image, Palette } from 'lucide-react';
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

  // Paletas de cores predefinidas para degradês aleatórios
  const colorPalettes = [
    // Sunset
    ['hsl(14, 80%, 60%)', 'hsl(21, 85%, 65%)', 'hsl(35, 90%, 70%)'],
    // Ocean
    ['hsl(200, 70%, 50%)', 'hsl(220, 75%, 55%)', 'hsl(240, 80%, 60%)'],
    // Forest
    ['hsl(120, 60%, 45%)', 'hsl(140, 65%, 50%)', 'hsl(160, 70%, 55%)'],
    // Purple Dream
    ['hsl(280, 70%, 60%)', 'hsl(300, 75%, 65%)', 'hsl(320, 80%, 70%)'],
    // Warm Earth
    ['hsl(25, 65%, 55%)', 'hsl(35, 70%, 60%)', 'hsl(45, 75%, 65%)'],
    // Cool Mint
    ['hsl(160, 60%, 50%)', 'hsl(180, 65%, 55%)', 'hsl(200, 70%, 60%)'],
    // Rose Gold
    ['hsl(340, 60%, 65%)', 'hsl(20, 70%, 70%)', 'hsl(40, 75%, 75%)'],
    // Deep Space
    ['hsl(240, 80%, 40%)', 'hsl(260, 85%, 45%)', 'hsl(280, 90%, 50%)'],
    // Autumn
    ['hsl(15, 75%, 55%)', 'hsl(30, 80%, 60%)', 'hsl(45, 85%, 65%)'],
    // Tropical
    ['hsl(180, 70%, 50%)', 'hsl(160, 75%, 55%)', 'hsl(140, 80%, 60%)']
  ];

  const getRandomPalette = () => {
    return colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  };

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
    
    // Create random gradient background
    const palette = getRandomPalette();
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, palette[0]);
    gradient.addColorStop(0.5, palette[1]);
    gradient.addColorStop(1, palette[2]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Add subtle pattern overlay for texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < canvasWidth; i += 60) {
      for (let j = 0; j < canvasHeight; j += 60) {
        ctx.beginPath();
        ctx.arc(i, j, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Add subtle geometric overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      const size = 50 + Math.random() * 100;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Add ParaFrase logo area (simplified geometric representation)
    const logoSize = format === 'square' ? 60 : 80;
    const logoX = 60;
    const logoY = 60;
    
    // Logo background with better contrast
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 15);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(logoX + 2, logoY + 2, logoSize - 4, logoSize - 4, 13);
    ctx.fill();
    
    // Quote icon representation
    ctx.fillStyle = palette[0];
    ctx.font = `bold ${logoSize * 0.5}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('"', logoX + logoSize/2, logoY + logoSize * 0.65);

    // Add ParaFrase logo text
    ctx.font = `bold ${format === 'square' ? '20px' : '24px'} Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText('ParaFrase', logoX + logoSize + 20, logoY + logoSize * 0.65);

    // Quote text styling with better contrast
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Calculate available space for text
    const padding = 80;
    const maxWidth = canvasWidth - (padding * 2);
    const availableHeight = canvasHeight - 350; // More space for better layout
    
    // Smart font sizing based on content length
    const contentLength = quote.content.length;
    let baseFontSize;
    
    if (contentLength < 50) {
      baseFontSize = format === 'square' ? 48 : 56;
    } else if (contentLength < 100) {
      baseFontSize = format === 'square' ? 42 : 48;
    } else if (contentLength < 200) {
      baseFontSize = format === 'square' ? 36 : 42;
    } else {
      baseFontSize = format === 'square' ? 30 : 36;
    }
    
    let fontSize = baseFontSize;
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
    } while (fontSize > 18); // Lower minimum for very long quotes

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
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Author name
    const authorFontSize = Math.max(22, fontSize * 0.65);
    ctx.font = `italic ${authorFontSize}px Georgia, serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(`— ${quote.authors.name}`, canvasWidth / 2, startY + lines.length * lineHeight + 60);

    // Enhanced decorative elements
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Decorative elements with gradient colors
    const decorativeGradient = ctx.createLinearGradient(canvasWidth / 2 - 150, 0, canvasWidth / 2 + 150, 0);
    decorativeGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    decorativeGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    decorativeGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    
    ctx.strokeStyle = decorativeGradient;
    ctx.lineWidth = 3;
    
    // Top decorative line with rounded caps
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 - 120, startY - 50);
    ctx.lineTo(canvasWidth / 2 + 120, startY - 50);
    ctx.stroke();
    
    // Bottom decorative line
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 - 120, startY + lines.length * lineHeight + 110);
    ctx.lineTo(canvasWidth / 2 + 120, startY + lines.length * lineHeight + 110);
    ctx.stroke();
    
    // Add small decorative dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 3; i++) {
      const dotX = canvasWidth / 2 - 20 + (i * 20);
      ctx.beginPath();
      ctx.arc(dotX, startY - 25, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(dotX, startY + lines.length * lineHeight + 85, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Enhanced watermark with ParaFrase branding
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
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
            variant="outline"
            size="default"
            disabled={isGenerating}
            className="w-full justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800"
          >
            <Palette className="w-4 h-4" />
            <span className="text-sm font-medium">Gerar Imagem</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56">
          <DropdownMenuItem onClick={() => generateImage('square')} disabled={isGenerating}>
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center">
                <Download className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Formato Quadrado</p>
                <p className="text-xs text-muted-foreground">Ideal para posts (1080x1080)</p>
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => generateImage('story')} disabled={isGenerating}>
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-orange-500 rounded flex items-center justify-center">
                <Download className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Formato Story</p>
                <p className="text-xs text-muted-foreground">Ideal para stories (1080x1920)</p>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
