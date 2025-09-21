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

  // Paletas de cores expandidas com mais variedade
  const colorPalettes = [
    // Sunset Collection
    ['hsl(14, 80%, 60%)', 'hsl(21, 85%, 65%)', 'hsl(35, 90%, 70%)'],
    ['hsl(340, 75%, 65%)', 'hsl(15, 80%, 60%)', 'hsl(45, 85%, 70%)'],
    ['hsl(25, 70%, 55%)', 'hsl(40, 75%, 60%)', 'hsl(55, 80%, 65%)'],
    
    // Ocean Collection
    ['hsl(200, 70%, 50%)', 'hsl(220, 75%, 55%)', 'hsl(240, 80%, 60%)'],
    ['hsl(180, 65%, 45%)', 'hsl(200, 70%, 50%)', 'hsl(220, 75%, 55%)'],
    ['hsl(190, 80%, 50%)', 'hsl(210, 85%, 55%)', 'hsl(230, 90%, 60%)'],
    
    // Forest Collection
    ['hsl(120, 60%, 45%)', 'hsl(140, 65%, 50%)', 'hsl(160, 70%, 55%)'],
    ['hsl(100, 55%, 40%)', 'hsl(120, 60%, 45%)', 'hsl(140, 65%, 50%)'],
    ['hsl(150, 70%, 50%)', 'hsl(170, 75%, 55%)', 'hsl(190, 80%, 60%)'],
    
    // Purple Dreams
    ['hsl(280, 70%, 60%)', 'hsl(300, 75%, 65%)', 'hsl(320, 80%, 70%)'],
    ['hsl(260, 65%, 55%)', 'hsl(280, 70%, 60%)', 'hsl(300, 75%, 65%)'],
    ['hsl(270, 80%, 65%)', 'hsl(290, 85%, 70%)', 'hsl(310, 90%, 75%)'],
    
    // Warm Earth
    ['hsl(25, 65%, 55%)', 'hsl(35, 70%, 60%)', 'hsl(45, 75%, 65%)'],
    ['hsl(30, 60%, 50%)', 'hsl(40, 65%, 55%)', 'hsl(50, 70%, 60%)'],
    
    // Cool Mint
    ['hsl(160, 60%, 50%)', 'hsl(180, 65%, 55%)', 'hsl(200, 70%, 60%)'],
    ['hsl(170, 70%, 55%)', 'hsl(190, 75%, 60%)', 'hsl(210, 80%, 65%)'],
    
    // Rose Gold
    ['hsl(340, 60%, 65%)', 'hsl(20, 70%, 70%)', 'hsl(40, 75%, 75%)'],
    ['hsl(330, 65%, 60%)', 'hsl(10, 75%, 65%)', 'hsl(30, 80%, 70%)'],
    
    // Deep Space
    ['hsl(240, 80%, 40%)', 'hsl(260, 85%, 45%)', 'hsl(280, 90%, 50%)'],
    ['hsl(220, 75%, 35%)', 'hsl(240, 80%, 40%)', 'hsl(260, 85%, 45%)'],
    
    // Tropical Vibes
    ['hsl(180, 70%, 50%)', 'hsl(160, 75%, 55%)', 'hsl(140, 80%, 60%)'],
    ['hsl(170, 75%, 55%)', 'hsl(150, 80%, 60%)', 'hsl(130, 85%, 65%)'],
    
    // Fire Collection
    ['hsl(0, 85%, 60%)', 'hsl(15, 90%, 65%)', 'hsl(30, 95%, 70%)'],
    ['hsl(350, 80%, 55%)', 'hsl(5, 85%, 60%)', 'hsl(20, 90%, 65%)'],
    
    // Ice Collection
    ['hsl(200, 60%, 70%)', 'hsl(220, 65%, 75%)', 'hsl(240, 70%, 80%)'],
    ['hsl(190, 70%, 65%)', 'hsl(210, 75%, 70%)', 'hsl(230, 80%, 75%)'],
    
    // Neon Collection
    ['hsl(300, 90%, 60%)', 'hsl(280, 95%, 65%)', 'hsl(260, 100%, 70%)'],
    ['hsl(120, 85%, 55%)', 'hsl(140, 90%, 60%)', 'hsl(160, 95%, 65%)'],
    
    // Vintage Collection
    ['hsl(40, 50%, 60%)', 'hsl(30, 55%, 55%)', 'hsl(20, 60%, 50%)'],
    ['hsl(60, 45%, 65%)', 'hsl(50, 50%, 60%)', 'hsl(40, 55%, 55%)']
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
      canvasWidth = canvasHeight = 800; // Reduced size for better performance
    } else {
      canvasWidth = 600;
      canvasHeight = 1067; // Reduced story format (9:16 ratio)
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Simplified rendering without DPI scaling for better performance
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Create random gradient background with more variety
    const palette = getRandomPalette();
    
    // Random gradient direction for more variety
    const gradientTypes = [
      () => ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight), // Diagonal
      () => ctx.createLinearGradient(0, 0, canvasWidth, 0), // Horizontal
      () => ctx.createLinearGradient(0, 0, 0, canvasHeight), // Vertical
      () => ctx.createRadialGradient(canvasWidth/2, canvasHeight/2, 0, canvasWidth/2, canvasHeight/2, Math.max(canvasWidth, canvasHeight)/2), // Radial
    ];
    
    const randomGradientType = gradientTypes[Math.floor(Math.random() * gradientTypes.length)];
    const gradient = randomGradientType();
    
    gradient.addColorStop(0, palette[0]);
    gradient.addColorStop(0.5, palette[1]);
    gradient.addColorStop(1, palette[2]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Add varied pattern overlays for texture
    const patternType = Math.floor(Math.random() * 3);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    
    if (patternType === 0) {
      // Dots pattern
      for (let i = 0; i < canvasWidth; i += 80) {
        for (let j = 0; j < canvasHeight; j += 80) {
          ctx.beginPath();
          ctx.arc(i, j, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (patternType === 1) {
      // Lines pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvasWidth; i += 100) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasHeight);
        ctx.stroke();
      }
    }

    // Add varied geometric overlays
    const geometryType = Math.floor(Math.random() * 4);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 2;
    
    if (geometryType === 0) {
      // Circles
      for (let i = 0; i < 4; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        const size = 30 + Math.random() * 80;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (geometryType === 1) {
      // Triangles
      for (let i = 0; i < 3; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        const size = 40 + Math.random() * 60;
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x + size, y + size);
        ctx.closePath();
        ctx.stroke();
      }
    } else if (geometryType === 2) {
      // Hexagons
      for (let i = 0; i < 3; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        const size = 25 + Math.random() * 50;
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const angle = (j * Math.PI) / 3;
          const px = x + size * Math.cos(angle);
          const py = y + size * Math.sin(angle);
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
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
        displayLine = displayLine + '".';
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
    link.href = canvas.toDataURL('image/jpeg', 0.9); // JPEG with 90% quality for smaller file size
    link.click();

    toast({
      title: "Imagem gerada!",
      description: `Imagem otimizada para ${format === 'square' ? 'postagem' : 'story'} baixada com sucesso.`
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
                <p className="text-xs text-muted-foreground">Ideal para posts (800x800)</p>
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
                <p className="text-xs text-muted-foreground">Ideal para stories (600x1067)</p>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
