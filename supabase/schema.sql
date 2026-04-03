-- profiles 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  height numeric NOT NULL,
  weight numeric NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  goal text NOT NULL CHECK (goal IN ('loss', 'gain', 'maintain')),
  activity_level text NOT NULL CHECK (
    activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- workout_logs 테이블
CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  exercise_name text NOT NULL,
  duration_minutes integer NOT NULL,
  intensity text NOT NULL CHECK (intensity IN ('low', 'moderate', 'high')),
  sets integer,
  reps integer,
  weight_kg numeric,
  calories_burned integer NOT NULL,
  met_value numeric NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- diet_logs 테이블
CREATE TABLE IF NOT EXISTS diet_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  meal_time text NOT NULL CHECK (meal_time IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name text NOT NULL,
  calories integer NOT NULL,
  protein_g numeric NOT NULL,
  carbs_g numeric NOT NULL,
  fat_g numeric NOT NULL,
  amount_g numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles updated_at 트리거
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS 비활성화 (개인 앱, 인증 없음)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE diet_logs DISABLE ROW LEVEL SECURITY;
