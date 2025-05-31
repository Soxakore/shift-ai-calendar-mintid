-- Create password_histories table
CREATE TABLE IF NOT EXISTS password_histories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL CHECK (action IN ('created', 'changed', 'reset')),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create qr_codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  qr_code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_password_histories_user_id ON password_histories(user_id);
CREATE INDEX IF NOT EXISTS idx_password_histories_organization_id ON password_histories(organization_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_organization_id ON qr_codes(organization_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_qr_code ON qr_codes(qr_code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_active ON qr_codes(is_active);

-- Add columns to profiles table for tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS qr_code_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS qr_code_expires_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on new tables
ALTER TABLE password_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for password_histories
CREATE POLICY "Users can view their own password history" ON password_histories
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('org_admin', 'super_admin')
      AND organization_id = password_histories.organization_id
    )
  );

CREATE POLICY "Org admins can insert password history" ON password_histories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('org_admin', 'super_admin')
      AND organization_id = password_histories.organization_id
    )
  );

-- RLS policies for qr_codes
CREATE POLICY "Users can view their own QR codes" ON qr_codes
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('org_admin', 'super_admin')
      AND organization_id = qr_codes.organization_id
    )
  );

CREATE POLICY "Org admins can manage QR codes" ON qr_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('org_admin', 'super_admin')
      AND organization_id = qr_codes.organization_id
    )
  );

-- Create trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_password_histories_updated_at 
  BEFORE UPDATE ON password_histories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_codes_updated_at 
  BEFORE UPDATE ON qr_codes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
