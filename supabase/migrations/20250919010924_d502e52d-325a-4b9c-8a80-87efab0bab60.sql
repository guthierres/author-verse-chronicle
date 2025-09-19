-- Habilitar RLS em todas as tabelas que precisam
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Corrigir a função para ter search_path seguro
CREATE OR REPLACE FUNCTION update_quote_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador
    UPDATE quotes 
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.quote_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador
    UPDATE quotes 
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = OLD.quote_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;