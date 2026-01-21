-- Create tables for Supabase

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  medida TEXT NOT NULL,
  precioListaBs DECIMAL(10,2) NOT NULL DEFAULT 0,
  precioListaUsd DECIMAL(10,2) NOT NULL DEFAULT 0,
  adjustmentCashea DECIMAL(5,2) DEFAULT 0,
  adjustmentTransferencia DECIMAL(5,2) DEFAULT 0,
  adjustmentDivisas DECIMAL(5,2) DEFAULT 0,
  adjustmentCustom DECIMAL(5,2) DEFAULT 0,
  productType TEXT NOT NULL DEFAULT 'cauchos',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  settingKey TEXT UNIQUE NOT NULL,
  settingValue TEXT,
  taxRate DECIMAL(5,2),
  globalCashea DECIMAL(5,2) DEFAULT 0,
  globalTransferencia DECIMAL(5,2) DEFAULT 0,
  globalDivisas DECIMAL(5,2) DEFAULT 0,
  globalCustom DECIMAL(5,2) DEFAULT 0,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_productType ON products(productType);
CREATE INDEX IF NOT EXISTS idx_products_createdAt ON products(createdAt);
CREATE INDEX IF NOT EXISTS idx_settings_settingKey ON settings(settingKey);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings if they don't exist
INSERT INTO settings (settingKey, settingValue, taxRate) 
VALUES ('tax_rate', '16', 16)
ON CONFLICT (settingKey) DO NOTHING;

INSERT INTO settings (settingKey, settingValue, globalCashea, globalTransferencia, globalDivisas, globalCustom)
VALUES ('global_adj_cauchos', '0', 0, 0, 0, 0)
ON CONFLICT (settingKey) DO NOTHING;

INSERT INTO settings (settingKey, settingValue, globalCashea, globalTransferencia, globalDivisas, globalCustom)
VALUES ('global_adj_baterias', '0', 0, 0, 0, 0)
ON CONFLICT (settingKey) DO NOTHING;