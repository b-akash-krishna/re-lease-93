-- Migration: Create hospital_data and prediction_results tables
-- Created: 2024-12-15
-- Description: Add tables for storing hospital administrative data and ML prediction results

-- Table to store hospital administrative data for each patient
CREATE TABLE IF NOT EXISTS public.hospital_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Patient Demographics
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 150),
    length_of_stay INTEGER DEFAULT 0 CHECK (length_of_stay >= 0),
    
    -- Medical Procedures & Medications  
    num_lab_procedures INTEGER DEFAULT 0 CHECK (num_lab_procedures >= 0),
    num_other_procedures INTEGER DEFAULT 0 CHECK (num_other_procedures >= 0),
    num_medications INTEGER DEFAULT 0 CHECK (num_medications >= 0),
    
    -- Healthcare Utilization (past year)
    outpatient_visits INTEGER DEFAULT 0 CHECK (outpatient_visits >= 0),
    previous_inpatient_stays INTEGER DEFAULT 0 CHECK (previous_inpatient_stays >= 0),
    emergency_visits INTEGER DEFAULT 0 CHECK (emergency_visits >= 0),
    
    -- Diabetes Management
    diabetes_medication TEXT NOT NULL CHECK (diabetes_medication IN ('yes', 'no')),
    glucose_test TEXT NOT NULL CHECK (glucose_test IN ('normal', 'high', 'not_done')),
    a1c_test TEXT NOT NULL CHECK (a1c_test IN ('normal', 'high', 'not_done')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure only one record per user
    CONSTRAINT unique_hospital_data_per_user UNIQUE (profile_id)
);

-- Table to store ML prediction results
CREATE TABLE IF NOT EXISTS public.prediction_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Prediction data
    prediction TEXT NOT NULL CHECK (prediction IN ('Yes', 'No')),
    confidence TEXT,
    model_available BOOLEAN DEFAULT false NOT NULL,
    
    -- Risk factors and additional data (stored as JSONB for flexibility)
    risk_factors JSONB,
    
    -- Reference to the hospital data used for this prediction
    hospital_data_id UUID REFERENCES public.hospital_data(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hospital_data_profile_id ON public.hospital_data(profile_id);
CREATE INDEX IF NOT EXISTS idx_hospital_data_updated_at ON public.hospital_data(updated_at);

CREATE INDEX IF NOT EXISTS idx_prediction_results_profile_id ON public.prediction_results(profile_id);
CREATE INDEX IF NOT EXISTS idx_prediction_results_created_at ON public.prediction_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prediction_results_prediction ON public.prediction_results(prediction);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for hospital_data table
DROP TRIGGER IF EXISTS update_hospital_data_updated_at ON public.hospital_data;
CREATE TRIGGER update_hospital_data_updated_at
    BEFORE UPDATE ON public.hospital_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.hospital_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospital_data table
CREATE POLICY "Users can view their own hospital data" 
    ON public.hospital_data FOR SELECT 
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own hospital data" 
    ON public.hospital_data FOR INSERT 
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own hospital data" 
    ON public.hospital_data FOR UPDATE 
    USING (auth.uid() = profile_id) 
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own hospital data" 
    ON public.hospital_data FOR DELETE 
    USING (auth.uid() = profile_id);

-- RLS Policies for prediction_results table
CREATE POLICY "Users can view their own prediction results" 
    ON public.prediction_results FOR SELECT 
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own prediction results" 
    ON public.prediction_results FOR INSERT 
    WITH CHECK (auth.uid() = profile_id);

-- Optional: Healthcare providers can view all data (uncomment if needed)
-- CREATE POLICY "Healthcare providers can view all hospital data" 
--     ON public.hospital_data FOR SELECT 
--     USING (
--         EXISTS (
--             SELECT 1 FROM public.profiles 
--             WHERE profiles.id = auth.uid() 
--             AND profiles.role = 'healthcare_provider'
--         )
--     );

-- CREATE POLICY "Healthcare providers can view all prediction results" 
--     ON public.prediction_results FOR SELECT 
--     USING (
--         EXISTS (
--             SELECT 1 FROM public.profiles 
--             WHERE profiles.id = auth.uid() 
--             AND profiles.role = 'healthcare_provider'
--         )
--     );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.hospital_data TO authenticated;
GRANT ALL ON public.prediction_results TO authenticated;
GRANT SELECT ON public.hospital_data TO anon;
GRANT SELECT ON public.prediction_results TO anon;

-- Add helpful comments
COMMENT ON TABLE public.hospital_data IS 'Stores hospital administrative data used for readmission predictions';
COMMENT ON TABLE public.prediction_results IS 'Stores ML model prediction results with timestamps';
COMMENT ON COLUMN public.hospital_data.profile_id IS 'References the authenticated user';
COMMENT ON COLUMN public.hospital_data.age IS 'Patient age in years (0-150)';
COMMENT ON COLUMN public.hospital_data.length_of_stay IS 'Length of hospital stay in days';
COMMENT ON COLUMN public.hospital_data.diabetes_medication IS 'Whether patient is on diabetes medication (yes/no)';
COMMENT ON COLUMN public.hospital_data.glucose_test IS 'Glucose test result (normal/high/not_done)';
COMMENT ON COLUMN public.hospital_data.a1c_test IS 'A1C test result (normal/high/not_done)';
COMMENT ON COLUMN public.prediction_results.prediction IS 'Readmission prediction result (Yes/No)';
COMMENT ON COLUMN public.prediction_results.risk_factors IS 'JSON object containing risk factor analysis';
COMMENT ON COLUMN public.prediction_results.hospital_data_id IS 'References the hospital_data record used for this prediction';