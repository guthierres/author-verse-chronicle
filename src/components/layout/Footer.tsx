import { Link } from 'react-router-dom';
import { Quote, Heart, Shield, FileText, Users, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Quote className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                ParaFrase
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-md">
              Descubra e compartilhe frases inspiradoras de autores incríveis. Uma rede social dedicada à sabedoria, inspiração e ao poder transformador das palavras.
            </p>
            <div className="flex items-center text-xs text-muted-foreground">
              <Heart className="w-3 h-3 mr-1 text-red-500" />
              Feito com amor para inspirar pessoas
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">Links Rápidos</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Timeline
                </Link>
              </li>
              <li>
                <Link to="/authors" className="text-muted-foreground hover:text-primary transition-colors">
                  Autores
                </Link>
              </li>
              <li>
                <Link to="/new-quote" className="text-muted-foreground hover:text-primary transition-colors">
                  Nova Frase
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                  Meu Perfil
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  Política de Cookies
                </Link>
              </li>
              <li>
                <a href="mailto:contato@parafrase.com" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground">
          <div className="mb-2 sm:mb-0">
            © 2025 ParaFrase. Todos os direitos reservados.
          </div>
          <div className="flex items-center space-x-4">
            <span>Versão 1.0.0</span>
            <span>•</span>
            <span>Conforme LGPD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;