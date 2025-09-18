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
    canvas.width = 800;
    canvas.height = 600;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'hsl(18, 55%, 51%)'); // Coral
    gradient.addColorStop(1, 'hsl(20, 65%, 51%)'); // Orange
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Quote text styling
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Main quote text
    const maxWidth = canvas.width - 120;
    const lineHeight = 50;
    const words = quote.content.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    // Break text into lines
    ctx.font = 'bold 32px Georgia, serif';
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
    const startY = canvas.height / 2 - (lines.length * lineHeight) / 2;
    lines.forEach((line, i) => {
      if (i === 0) {
        ctx.fillText(`"${line}`, canvas.width / 2, startY + i * lineHeight);
      } else if (i === lines.length - 1) {
        ctx.fillText(`${line}"`, canvas.width / 2, startY + i * lineHeight);
      } else {
        ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
      }
    });

    // Author name
    ctx.font = 'italic 24px Georgia, serif';
    ctx.fillText(`— ${quote.authors.name}`, canvas.width / 2, startY + lines.length * lineHeight + 40);

    // Watermark
    ctx.font = '12px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.textAlign = 'right';
    ctx.fillText('parafrase.com.br', canvas.width - 20, canvas.height - 20);

    // Download image
    const link = document.createElement('a');
    link.download = `frase-${quote.authors.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL();
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
        variant="ghost"
        size="sm"
        onClick={generateImage}
        className="text-primary hover:text-primary/80"
      >
        <Download className="w-4 h-4 mr-1" />
        Gerar Imagem
      </Button>
    </>
  );
};