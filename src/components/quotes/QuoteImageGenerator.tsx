import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

  const generateImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas dimensions
    canvas.width = 1200;
    canvas.height = 900;

    // Enable high DPI rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width *= dpr;
    canvas.height *= dpr;
    ctx.scale(dpr, dpr);
    
    const canvasWidth = 1200;
    const canvasHeight = 900;
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, 'hsl(18, 55%, 51%)'); // Coral
    gradient.addColorStop(0.5, 'hsl(19, 60%, 51%)'); // Middle tone
    gradient.addColorStop(1, 'hsl(20, 65%, 51%)'); // Orange
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Add subtle pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < canvasWidth; i += 40) {
      for (let j = 0; j < canvasHeight; j += 40) {
        ctx.fillRect(i, j, 1, 1);
      }
    }

    // Quote text styling
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Main quote text
    const maxWidth = canvasWidth - 200;
    const lineHeight = 70;
    const words = quote.content.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    // Break text into lines
    ctx.font = 'bold 48px Georgia, serif';
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

    // Draw quote text
    const startY = canvasHeight / 2 - (lines.length * lineHeight) / 2;
    lines.forEach((line, i) => {
      if (i === 0) {
        ctx.fillText(`"${line}`, canvasWidth / 2, startY + i * lineHeight);
      } else if (i === lines.length - 1) {
        ctx.fillText(`${line}"`, canvasWidth / 2, startY + i * lineHeight);
      } else {
        ctx.fillText(line, canvasWidth / 2, startY + i * lineHeight);
      }
    });

    // Reset shadow for author name
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Author name
    ctx.font = 'italic 36px Georgia, serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText(`— ${quote.authors.name}`, canvasWidth / 2, startY + lines.length * lineHeight + 80);

    // Add decorative elements
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Top decorative line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 - 100, startY - 60);
    ctx.lineTo(canvasWidth / 2 + 100, startY - 60);
    ctx.stroke();
    
    // Bottom decorative line
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 - 100, startY + lines.length * lineHeight + 140);
    ctx.lineTo(canvasWidth / 2 + 100, startY + lines.length * lineHeight + 140);
    ctx.stroke();

    // Watermark
    ctx.font = '18px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'right';
    ctx.fillText('ParaFrase.com', canvasWidth - 40, canvasHeight - 40);

    // Download image
    const link = document.createElement('a');
    link.download = `frase-${quote.authors.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    toast({
      title: "Imagem gerada!",
      description: "A imagem da frase foi baixada com sucesso."
    });
  };

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <Button
        variant="default"
        size="sm"
        onClick={generateImage}
        className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold shadow-lg"
      >
        <Download className="w-4 h-4 mr-1" />
        Gerar Imagem
      </Button>
    </>
  );
};