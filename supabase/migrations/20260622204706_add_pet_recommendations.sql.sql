ALTER TABLE pets ADD COLUMN IF NOT EXISTS recommendations TEXT;

COMMENT ON COLUMN pets.recommendations IS 'Рекомендации по уходу за питомцем — редактируется администратором';
