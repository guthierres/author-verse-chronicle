import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, AlertTriangle } from 'lucide-react';

const Privacy = () => {
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
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
          <p className="text-muted-foreground">Última atualização: Janeiro de 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                1. Informações que Coletamos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>Coletamos as seguintes informações quando você usa o ParaFrase:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Informações de Conta:</strong> Nome, email e senha quando você se registra</li>
                <li><strong>Conteúdo:</strong> Frases, comentários e reações que você publica</li>
                <li><strong>Dados de Uso:</strong> Como você interage com a plataforma</li>
                <li><strong>Informações Técnicas:</strong> Endereço IP, tipo de dispositivo, navegador</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                2. Como Usamos suas Informações
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>Utilizamos suas informações para:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Personalizar sua experiência na plataforma</li>
                <li>Comunicar atualizações e novidades</li>
                <li>Garantir a segurança da plataforma</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                3. Compartilhamento de Informações
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>Não vendemos suas informações pessoais. Podemos compartilhar dados apenas:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Com seu consentimento explícito</li>
                <li>Para cumprir obrigações legais</li>
                <li>Com prestadores de serviços confiáveis (sob contrato de confidencialidade)</li>
                <li>Em caso de fusão ou aquisição da empresa</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                4. Seus Direitos (LGPD)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Acesso:</strong> Saber quais dados temos sobre você</li>
                <li><strong>Correção:</strong> Corrigir dados incompletos ou incorretos</li>
                <li><strong>Exclusão:</strong> Solicitar a remoção de seus dados</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> Se opor ao tratamento de seus dados</li>
                <li><strong>Revogação:</strong> Retirar seu consentimento a qualquer momento</li>
              </ul>
              <p className="mt-3">
                Para exercer esses direitos, entre em contato conosco através do email: 
                <a href="mailto:privacidade@parafrase.com" className="text-primary hover:underline ml-1">
                  privacidade@parafrase.com
                </a>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                5. Cookies e Tecnologias Similares
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>Utilizamos cookies para:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Manter você logado na plataforma</li>
                <li>Lembrar suas preferências</li>
                <li>Analisar o uso da plataforma</li>
                <li>Personalizar anúncios (quando aplicável)</li>
              </ul>
              <p>Você pode gerenciar cookies através das configurações do seu navegador.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Segurança dos Dados</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Implementamos medidas técnicas e organizacionais adequadas para proteger suas informações 
                contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
              <p>
                Utilizamos criptografia, controles de acesso e monitoramento contínuo para garantir 
                a segurança de seus dados.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Retenção de Dados</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Mantemos suas informações apenas pelo tempo necessário para cumprir as finalidades 
                descritas nesta política ou conforme exigido por lei.
              </p>
              <p>
                Quando você exclui sua conta, removemos suas informações pessoais, exceto quando 
                precisamos mantê-las por obrigações legais.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Alterações nesta Política</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças 
                significativas através da plataforma ou por email.
              </p>
              <p>
                O uso continuado da plataforma após as alterações constitui aceitação da 
                nova política.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contato</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>Para questões sobre privacidade, entre em contato:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email: privacidade@parafrase.com</li>
                <li>Encarregado de Dados: dpo@parafrase.com</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;