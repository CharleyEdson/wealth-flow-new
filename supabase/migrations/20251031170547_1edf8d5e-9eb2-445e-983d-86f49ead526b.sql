-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'client');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create invite_codes table
CREATE TABLE public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  used_by UUID REFERENCES auth.users(id),
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create balance_sheets table
CREATE TABLE public.balance_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assets JSONB NOT NULL DEFAULT '{}',
  liabilities JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create net_worth_history table
CREATE TABLE public.net_worth_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  net_worth DECIMAL(15, 2) NOT NULL,
  calculated_from_balance_sheet_id UUID REFERENCES public.balance_sheets(id),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL
);

-- Create statements_of_purpose table
CREATE TABLE public.statements_of_purpose (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create business_information table
CREATE TABLE public.business_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  information JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.net_worth_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statements_of_purpose ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_information ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create trigger function for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_balance_sheets_updated_at
  BEFORE UPDATE ON public.balance_sheets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_statements_of_purpose_updated_at
  BEFORE UPDATE ON public.statements_of_purpose
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_business_information_updated_at
  BEFORE UPDATE ON public.business_information
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for invite_codes
CREATE POLICY "Super admins can manage invite codes"
  ON public.invite_codes FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone can view unused codes for validation"
  ON public.invite_codes FOR SELECT
  USING (NOT is_used);

-- RLS Policies for balance_sheets
CREATE POLICY "Users can view their own balance sheet"
  ON public.balance_sheets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all balance sheets"
  ON public.balance_sheets FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can update their own balance sheet"
  ON public.balance_sheets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balance sheet"
  ON public.balance_sheets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all balance sheets"
  ON public.balance_sheets FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for net_worth_history
CREATE POLICY "Users can view their own net worth history"
  ON public.net_worth_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all net worth history"
  ON public.net_worth_history FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage net worth history"
  ON public.net_worth_history FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for statements_of_purpose
CREATE POLICY "Users can view their own statement"
  ON public.statements_of_purpose FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all statements"
  ON public.statements_of_purpose FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can update their own statement"
  ON public.statements_of_purpose FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statement"
  ON public.statements_of_purpose FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all statements"
  ON public.statements_of_purpose FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for business_information
CREATE POLICY "Users can view their own business info"
  ON public.business_information FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all business info"
  ON public.business_information FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage all business info"
  ON public.business_information FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_balance_sheets_user_id ON public.balance_sheets(user_id);
CREATE INDEX idx_net_worth_history_user_id ON public.net_worth_history(user_id);
CREATE INDEX idx_net_worth_history_date ON public.net_worth_history(year, month);
CREATE INDEX idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX idx_invite_codes_used ON public.invite_codes(is_used);