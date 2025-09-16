import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Users, AlertCircle, Scale, Shield } from 'lucide-react';

const Terms = () => {
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
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
          <p className="text-muted-foreground">Última atualização: Janeiro de 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                1. Aceitação dos Termos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Ao acessar e usar o ParaFrase, você concorda em cumprir estes Termos de Uso. 
                Se você não concorda com qualquer parte destes termos, não deve usar nossa plataforma.
              </p>
              <p>
                Estes termos constituem um acordo legal entre você e o ParaFrase, 
                governando seu uso de nossos serviços.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Descrição do Serviço</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                O ParaFrase é uma plataforma social dedicada ao compartilhamento de frases inspiradoras, 
                citações e pensamentos de autores diversos.
              </p>
              <p>Nossos serviços incluem:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Publicação e compartilhamento de frases</li>
                <li>Interação através de reações e comentários</li>
                <li>Perfis de autores e usuários</li>
                <li>Timeline personalizada de conteúdo</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Registro e Conta de Usuário</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>Para usar certas funcionalidades, você deve criar uma conta fornecendo:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Informações precisas e atualizadas</li>
                <li>Um endereço de email válido</li>
                <li>Uma senha segura</li>
              </ul>
              <p>
                Você é responsável por manter a confidencialidade de sua conta e senha, 
                e por todas as atividades que ocorrem em sua conta.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                4. Conduta do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>Ao usar o ParaFrase, você concorda em NÃO:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Publicar conteúdo ofensivo, difamatório ou ilegal</li>
                <li>Violar direitos autorais ou propriedade intelectual</li>
                <li>Assediar, intimidar ou ameaçar outros usuários</li>
                <li>Usar a plataforma para spam ou atividades comerciais não autorizadas</li>
                <li>Tentar hackear ou comprometer a segurança da plataforma</li>
                <li>Criar contas falsas ou se passar por outras pessoas</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Conteúdo do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Você mantém a propriedade do conteúdo que publica, mas concede ao ParaFrase 
                uma licença para usar, exibir e distribuir esse conteúdo na plataforma.
              </p>
              <p>
                Você é responsável por garantir que possui os direitos necessários para 
                publicar o conteúdo e que ele não viola direitos de terceiros.
              </p>
              <p>
                Reservamo-nos o direito de remover conteúdo que viole estes termos ou 
                nossas diretrizes da comunidade.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Moderação de Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Todo conteúdo publicado passa por moderação antes de ser exibido publicamente. 
                Isso inclui frases e comentários.
              </p>
              <p>
                Nossa equipe de moderação avalia o conteúdo com base em nossas diretrizes 
                da comunidade e pode aprovar, rejeitar ou solicitar modificações.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="w-5 h-5 mr-2" />
                7. Propriedade Intelectual
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                O ParaFrase e todo seu conteúdo original (design, código, marca) são 
                propriedade nossa e protegidos por leis de propriedade intelectual.
              </p>
              <p>
                As frases e citações publicadas pelos usuários permanecem de propriedade 
                de seus respectivos autores originais.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Publicidade</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Podemos exibir anúncios na plataforma para sustentar nossos serviços gratuitos. 
                Estes anúncios são claramente identificados como tal.
              </p>
              <p>
                Você concorda que podemos usar informações não pessoais para personalizar 
                os anúncios exibidos, sempre respeitando sua privacidade.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Limitação de Responsabilidade</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                O ParaFrase é fornecido "como está" sem garantias de qualquer tipo. 
                Não garantimos que o serviço será ininterrupto ou livre de erros.
              </p>
              <p>
                Nossa responsabilidade é limitada ao máximo permitido por lei, 
                excluindo danos indiretos ou consequenciais.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Suspensão e Encerramento</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Podemos suspender ou encerrar sua conta se você violar estes termos 
                ou nossas diretrizes da comunidade.
              </p>
              <p>
                Você pode encerrar sua conta a qualquer momento através das 
                configurações do perfil.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Alterações nos Termos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Podemos modificar estes termos periodicamente. Notificaremos sobre 
                mudanças significativas através da plataforma.
              </p>
              <p>
                O uso continuado após as alterações constitui aceitação dos novos termos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Lei Aplicável</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Estes termos são regidos pelas leis brasileiras. Qualquer disputa 
                será resolvida nos tribunais competentes do Brasil.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                13. Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>Para questões sobre estes termos, entre em contato:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email: legal@parafrase.com</li>
                <li>Suporte: suporte@parafrase.com</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;