import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Loader2, Quote, Mail, CheckCircle } from 'lucide-react';

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailAlert, setShowEmailAlert] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!"
      });
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    setUserEmail(email);

    const { error } = await signUp(email, password, name);

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
      setShowEmailAlert(false);
    } else {
      setRegisteredEmail(email);
      setShowEmailAlert(true);
      toast({
        title: "Cadastro realizado!",
        description: "Verifique sua caixa de entrada (e/ou spam) para ativar sua conta."
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Quote className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Frase de Autor
          </h1>
          <p className="text-muted-foreground mt-2">Compartilhe suas frases inspiradoras</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Bem-vindo</CardTitle>
            <CardDescription className="text-center">
              Faça login ou cadastre-se para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showEmailAlert && (
              <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <div className="space-y-2">
                    <p className="font-semibold">Cadastro realizado com sucesso!</p>
                    <p>Enviamos um email de confirmação para <strong>{registeredEmail}</strong></p>
                    <div className="flex items-start space-x-2 mt-3">
                      <Mail className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400" />
                      <div className="text-sm">
                        <p>Para ativar sua conta:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Verifique sua <strong>caixa de entrada</strong></li>
                          <li>Verifique também a pasta de <strong>spam/lixo eletrônico</strong></li>
                          <li>Clique no link de confirmação no email</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastro</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome</Label>
                    <Input
                      id="register-name"
                      name="name"
                      type="text"
                      placeholder="Seu nome"
                      required
                      disabled={showEmailAlert}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      disabled={showEmailAlert}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      disabled={showEmailAlert}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || showEmailAlert}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cadastrar
                  </Button>
                  {showEmailAlert && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setShowEmailAlert(false)}
                    >
                      Fazer novo cadastro
                    </Button>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;