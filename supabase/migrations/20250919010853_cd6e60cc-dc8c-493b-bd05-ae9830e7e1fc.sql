-- Adicionar campo para identificar sessões anônimas na tabela reactions
ALTER TABLE reactions ADD COLUMN IF NOT EXISTS anonymous_session TEXT;

-- Criar índice para melhor performance em buscas
CREATE INDEX IF NOT EXISTS idx_reactions_anonymous_session ON reactions(anonymous_session);
CREATE INDEX IF NOT EXISTS idx_reactions_quote_author ON reactions(quote_id, author_id);

-- Criar função para atualizar contador de likes automaticamente
CREATE OR REPLACE FUNCTION update_quote_likes_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Criar triggers para atualização automática
DROP TRIGGER IF EXISTS trigger_update_likes_count_insert ON reactions;
DROP TRIGGER IF EXISTS trigger_update_likes_count_delete ON reactions;

CREATE TRIGGER trigger_update_likes_count_insert
  AFTER INSERT ON reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_likes_count();

CREATE TRIGGER trigger_update_likes_count_delete
  AFTER DELETE ON reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_likes_count();

-- Atualizar políticas RLS para permitir usuários anônimos
DROP POLICY IF EXISTS "Usuários anônimos podem reagir" ON reactions;
CREATE POLICY "Usuários anônimos podem reagir"
  ON reactions FOR INSERT
  WITH CHECK (
    (author_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM authors 
      WHERE id = author_id AND user_id = auth.uid()
    ))
    OR 
    (author_id IS NULL AND anonymous_session IS NOT NULL)
  );

-- Política para remoção de reações anônimas
DROP POLICY IF EXISTS "Usuários anônimos podem remover suas reações" ON reactions;
CREATE POLICY "Usuários anônimos podem remover suas reações"
  ON reactions FOR DELETE
  USING (
    (author_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM authors 
      WHERE id = author_id AND user_id = auth.uid()
    ))
    OR 
    (author_id IS NULL AND anonymous_session IS NOT NULL)
  );