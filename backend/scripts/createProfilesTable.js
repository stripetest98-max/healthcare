const supabase = require('../config/supabase');

async function createProfilesTable() {
  console.log('🚀 Creating profiles table...');

  const sql = `
    -- Create profiles table
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      full_name TEXT,
      phone TEXT,
      date_of_birth DATE,
      gender TEXT CHECK (gender IN ('male', 'female', 'other')),
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      blood_group TEXT,
      allergies TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Enable Row Level Security
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

    -- Create policies
    CREATE POLICY "Users can view their own profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);

    CREATE POLICY "Users can update their own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);

    CREATE POLICY "Users can insert their own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);

    -- Create function to handle user creation
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, full_name)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create trigger
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

    -- Create updated_at function
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create updated_at trigger
    DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error creating table:', error.message);
      console.log('\n📝 Please run this SQL manually in Supabase Dashboard:');
      console.log('1. Go to: https://supabase.com/dashboard');
      console.log('2. Open SQL Editor');
      console.log('3. Copy code from: CREATE_PROFILES_TABLE.sql');
      console.log('4. Paste and Run\n');
      return false;
    }

    console.log('✅ Profiles table created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Manual Setup Required:');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Copy code from: CREATE_PROFILES_TABLE.sql');
    console.log('4. Paste and Run\n');
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  createProfilesTable()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = createProfilesTable;
