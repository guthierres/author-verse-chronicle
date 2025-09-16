-- Create user roles table for admin permissions
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()),
    'user'::user_role
  );
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR ALL USING (public.is_admin());

-- Update quotes table policies for admin access
DROP POLICY IF EXISTS "Todos podem ver frases aprovadas e ativas" ON public.quotes;
CREATE POLICY "Public can view approved quotes" ON public.quotes
  FOR SELECT USING (is_approved = true AND is_active = true);

CREATE POLICY "Admins can view all quotes" ON public.quotes
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all quotes" ON public.quotes
  FOR UPDATE USING (public.is_admin());

-- Update comments table policies for admin access  
DROP POLICY IF EXISTS "Todos podem ver comentários aprovados" ON public.comments;
CREATE POLICY "Public can view approved comments" ON public.comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Admins can view all comments" ON public.comments
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all comments" ON public.comments
  FOR UPDATE USING (public.is_admin());

-- Update authors table to protect email exposure
DROP POLICY IF EXISTS "Authors podem ver todos os perfis ativos" ON public.authors;
CREATE POLICY "Public can view active author profiles" ON public.authors
  FOR SELECT USING (is_active = true);

-- Create trigger for updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert admin role for first user (you can change this later)
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'admin'::user_role FROM auth.users LIMIT 1
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';