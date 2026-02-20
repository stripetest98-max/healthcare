-- Create lab_reports table
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_name TEXT NOT NULL,
  test_type TEXT,
  lab_name TEXT,
  test_date DATE NOT NULL,
  result TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  report_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own lab reports"
  ON public.lab_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lab reports"
  ON public.lab_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab reports"
  ON public.lab_reports FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.lab_reports;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.lab_reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS lab_reports_user_id_idx ON public.lab_reports(user_id);
CREATE INDEX IF NOT EXISTS lab_reports_test_date_idx ON public.lab_reports(test_date);
