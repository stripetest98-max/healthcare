-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  prescribed_by TEXT,
  prescribed_date DATE DEFAULT CURRENT_DATE,
  instructions TEXT,
  refills INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can create their own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can update their own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can delete their own prescriptions" ON public.prescriptions;

-- Create policies
CREATE POLICY "Users can view their own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescriptions"
  ON public.prescriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.prescriptions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS prescriptions_user_id_idx ON public.prescriptions(user_id);
CREATE INDEX IF NOT EXISTS prescriptions_status_idx ON public.prescriptions(status);
CREATE INDEX IF NOT EXISTS prescriptions_date_idx ON public.prescriptions(prescribed_date);
