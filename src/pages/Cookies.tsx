import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cookie, Settings, BarChart, Target } from 'lucide-react';

const Cookies = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cookie className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Política de Cookies</h1>
          <p className="text-muted-foreground">Última atualização: Janeiro de 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>O que são Cookies?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você 
                visita um site. Eles ajudam o site a lembrar informações sobre sua visita, 
                tornando sua experiência mais fácil e personalizada.
              </p>
              <p>
                No ParaFrase, utilizamos cookies para melhorar sua experiência, manter você 
                logado e entender como você usa nossa plataforma.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Tipos de Cookies que Utilizamos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Cookies Essenciais</h4>
                <p>Necessários para o funcionamento básico da plataforma:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Manter você logado em sua conta</li>
                  <li>Lembrar suas preferências de idioma</li>
                  <li>Garantir a segurança da plataforma</li>
                  <li>Funcionalidades do carrinho de compras (se aplicável)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <BarChart className="w-4 h-4 mr-1" />
                  2. Cookies de Análise
                </h4>
                <p>Nos ajudam a entender como você usa a plataforma:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Páginas mais visitadas</li>
                  <li>Tempo gasto na plataforma</li>
                  <li>Padrões de navegação</li>
                  <li>Identificação de problemas técnicos</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Cookies de Funcionalidade</h4>
                <p>Melhoram sua experiência na plataforma:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Lembrar suas preferências de exibição</li>
                  <li>Personalizar conteúdo baseado em seus interesses</li>
                  <li>Facilitar o compartilhamento em redes sociais</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  4. Cookies de Publicidade
                </h4>
                <p>Utilizados para personalizar anúncios (quando aplicável):</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Exibir anúncios relevantes aos seus interesses</li>
                  <li>Limitar a frequência de anúncios</li>
                  <li>Medir a eficácia das campanhas publicitárias</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookies de Terceiros</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>Também utilizamos cookies de parceiros confiáveis:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Google Analytics:</strong> Para análise de tráfego e comportamento</li>
                <li><strong>Google AdSense:</strong> Para exibição de anúncios personalizados</li>
                <li><strong>Redes Sociais:</strong> Para funcionalidades de compartilhamento</li>
              </ul>
              <p>
                Estes parceiros têm suas próprias políticas de privacidade e cookies, 
                que recomendamos que você leia.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Cookies</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>Você pode controlar cookies de várias maneiras:</p>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Configurações do Navegador</h4>
                <p>A maioria dos navegadores permite:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Ver quais cookies estão armazenados</li>
                  <li>Excluir cookies existentes</li>
                  <li>Bloquear cookies de sites específicos</li>
                  <li>Bloquear cookies de terceiros</li>
                </ul>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Configurações da Plataforma</h4>
                <p>
                  Em breve, ofereceremos um painel de controle de cookies onde você 
                  poderá escolher quais tipos de cookies aceitar.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Impacto de Desabilitar Cookies</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Embora você possa desabilitar cookies, isso pode afetar sua experiência:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Você precisará fazer login toda vez que visitar o site</li>
                <li>Suas preferências não serão lembradas</li>
                <li>Algumas funcionalidades podem não funcionar corretamente</li>
                <li>Os anúncios podem ser menos relevantes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atualizações desta Política</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Podemos atualizar esta política de cookies periodicamente para refletir 
                mudanças em nossa prática ou por outros motivos operacionais, legais ou regulamentares.
              </p>
              <p>
                Recomendamos que você revise esta página regularmente para se manter 
                informado sobre nosso uso de cookies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>Se você tiver dúvidas sobre nossa política de cookies:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email: cookies@parafrase.com</li>
                <li>Suporte: suporte@parafrase.com</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cookies;