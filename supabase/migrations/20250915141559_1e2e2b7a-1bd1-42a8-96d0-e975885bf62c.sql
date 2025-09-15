-- Criar tabelas para o sistema de frases de autores

-- Tabela de perfis de autores
CREATE TABLE public.authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de frases
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.authors(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de comentários
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.authors(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de reações (upvotes)
CREATE TABLE public.reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.authors(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quote_id, author_id)
);

-- Tabela de visualizações
CREATE TABLE public.quote_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  viewer_ip TEXT,
  author_id UUID REFERENCES public.authors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de compartilhamentos
CREATE TABLE public.quote_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  author_id UUID REFERENCES public.authors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de configurações do admin
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para authors
CREATE POLICY "Authors podem ver todos os perfis ativos" ON public.authors
  FOR SELECT USING (is_active = true);

CREATE POLICY "Usuários podem criar seu próprio perfil de autor" ON public.authors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.authors
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para quotes
CREATE POLICY "Todos podem ver frases aprovadas e ativas" ON public.quotes
  FOR SELECT USING (is_approved = true AND is_active = true);

CREATE POLICY "Autores podem criar suas frases" ON public.quotes
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.authors 
    WHERE id = author_id AND user_id = auth.uid()
  ));

CREATE POLICY "Autores podem atualizar suas próprias frases" ON public.quotes
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.authors 
    WHERE id = author_id AND user_id = auth.uid()
  ));

-- Políticas RLS para comments
CREATE POLICY "Todos podem ver comentários aprovados" ON public.comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Autores podem comentar" ON public.comments
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.authors 
    WHERE id = author_id AND user_id = auth.uid()
  ));

-- Políticas RLS para reactions
CREATE POLICY "Todos podem ver reações" ON public.reactions
  FOR SELECT USING (true);

CREATE POLICY "Autores podem reagir" ON public.reactions
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.authors 
    WHERE id = author_id AND user_id = auth.uid()
  ));

CREATE POLICY "Autores podem remover suas reações" ON public.reactions
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.authors 
    WHERE id = author_id AND user_id = auth.uid()
  ));

-- Políticas RLS para quote_views
CREATE POLICY "Todos podem registrar visualizações" ON public.quote_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem ver contadores" ON public.quote_views
  FOR SELECT USING (true);

-- Políticas RLS para quote_shares
CREATE POLICY "Todos podem registrar compartilhamentos" ON public.quote_shares
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem ver compartilhamentos" ON public.quote_shares
  FOR SELECT USING (true);

-- Políticas RLS para site_settings (apenas admins - será gerenciado via edge function)
CREATE POLICY "Apenas leitura pública das configurações" ON public.site_settings
  FOR SELECT USING (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON public.authors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil de autor automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.authors (user_id, name, bio)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    'Novo autor na plataforma'
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar autor automaticamente quando usuário se cadastra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Inserir configurações padrão
INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', '"Frase de Autor"'),
  ('site_description', '"Rede social de frases de autores"'),
  ('admin_panel_enabled', 'true'),
  ('registration_enabled', 'true'),
  ('moderation_enabled', 'true');