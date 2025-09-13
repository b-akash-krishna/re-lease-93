-- Patient Details Schema Migration
-- Creates comprehensive patient information tables

-- Create blood type enum
CREATE TYPE public.blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- Create gender enum
CREATE TYPE public.gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- Create marital status enum
CREATE TYPE public.marital_status AS ENUM ('single', 'married', 'divorced', 'widowed', 'separated', 'other');

-- Create hospitals table
CREATE TABLE public.hospitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient_details table
CREATE TABLE public.patient_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  hospital_id UUID REFERENCES public.hospitals(id),
  
  -- Basic Demographics
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender,
  blood_type blood_type,
  
  -- Contact Information
  phone TEXT,
  email TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'United States',
  
  -- Emergency Contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  
  -- Medical Information
  height_cm DECIMAL(5,2), -- in centimeters
  weight_kg DECIMAL(5,2), -- in kilograms
  allergies TEXT[], -- array of allergy strings
  medical_conditions TEXT[], -- array of condition strings
  current_medications TEXT[], -- array of medication strings
  
  -- Insurance Information
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  insurance_group_number TEXT,
  
  -- Additional Information
  marital_status marital_status,
  occupation TEXT,
  preferred_language TEXT DEFAULT 'English',
  notes TEXT,
  
  -- Hospital Assignment
  hospital_patient_id TEXT, -- Hospital's internal patient ID
  primary_physician TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical_history table for tracking hospital admissions
CREATE TABLE public.medical_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patient_details(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES public.hospitals(id),
  
  -- Admission Details
  admission_date TIMESTAMP WITH TIME ZONE NOT NULL,
  discharge_date TIMESTAMP WITH TIME ZONE,
  admission_type TEXT, -- 'emergency', 'elective', 'urgent', etc.
  
  -- Medical Information
  primary_diagnosis TEXT NOT NULL,
  secondary_diagnoses TEXT[],
  procedures_performed TEXT[],
  medications_prescribed TEXT[],
  
  -- Discharge Information
  discharge_disposition TEXT, -- 'home', 'snf', 'rehab', 'deceased', etc.
  discharge_instructions TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  
  -- Risk Assessment
  readmission_risk_score DECIMAL(3,2), -- 0.00 to 1.00
  risk_factors TEXT[],
  
  -- Clinical Notes
  attending_physician TEXT,
  discharge_summary TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create staff_patient_assignments table for hospital staff to access patients
CREATE TABLE public.staff_patient_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  role_type TEXT, -- 'primary_physician', 'nurse', 'case_manager', etc.
  
  UNIQUE(staff_profile_id, patient_profile_id, hospital_id)
);

-- Enable RLS on all tables
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_patient_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospitals
CREATE POLICY "Hospital staff can view their hospital" 
ON public.hospitals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'hospital_staff'
  )
);

-- RLS Policies for patient_details
CREATE POLICY "Patients can view their own details" 
ON public.patient_details 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = patient_details.profile_id 
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can update their own details" 
ON public.patient_details 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = patient_details.profile_id 
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can insert their own details" 
ON public.patient_details 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = patient_details.profile_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Hospital staff can view patients assigned to them
CREATE POLICY "Hospital staff can view assigned patients" 
ON public.patient_details 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff_patient_assignments spa
    JOIN public.profiles staff_profile ON staff_profile.id = spa.staff_profile_id
    WHERE spa.patient_profile_id = patient_details.profile_id
    AND staff_profile.user_id = auth.uid()
    AND staff_profile.role = 'hospital_staff'
    AND spa.is_active = true
  )
);

-- Hospital staff can update assigned patients
CREATE POLICY "Hospital staff can update assigned patients" 
ON public.patient_details 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.staff_patient_assignments spa
    JOIN public.profiles staff_profile ON staff_profile.id = spa.staff_profile_id
    WHERE spa.patient_profile_id = patient_details.profile_id
    AND staff_profile.user_id = auth.uid()
    AND staff_profile.role = 'hospital_staff'
    AND spa.is_active = true
  )
);

-- RLS Policies for medical_history
CREATE POLICY "Patients can view their own medical history" 
ON public.medical_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.patient_details pd
    JOIN public.profiles p ON p.id = pd.profile_id
    WHERE pd.id = medical_history.patient_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Hospital staff can view medical history of assigned patients" 
ON public.medical_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.patient_details pd
    JOIN public.staff_patient_assignments spa ON spa.patient_profile_id = pd.profile_id
    JOIN public.profiles staff_profile ON staff_profile.id = spa.staff_profile_id
    WHERE pd.id = medical_history.patient_id
    AND staff_profile.user_id = auth.uid()
    AND staff_profile.role = 'hospital_staff'
    AND spa.is_active = true
  )
);

-- Hospital staff can insert/update medical history for assigned patients
CREATE POLICY "Hospital staff can manage medical history for assigned patients" 
ON public.medical_history 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.patient_details pd
    JOIN public.staff_patient_assignments spa ON spa.patient_profile_id = pd.profile_id
    JOIN public.profiles staff_profile ON staff_profile.id = spa.staff_profile_id
    WHERE pd.id = medical_history.patient_id
    AND staff_profile.user_id = auth.uid()
    AND staff_profile.role = 'hospital_staff'
    AND spa.is_active = true
  )
);

-- RLS Policies for staff_patient_assignments
CREATE POLICY "Hospital staff can view their assignments" 
ON public.staff_patient_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = staff_patient_assignments.staff_profile_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Add update triggers for timestamps
CREATE TRIGGER update_hospitals_updated_at
  BEFORE UPDATE ON public.hospitals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_details_updated_at
  BEFORE UPDATE ON public.patient_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_history_updated_at
  BEFORE UPDATE ON public.medical_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_patient_details_profile_id ON public.patient_details(profile_id);
CREATE INDEX idx_patient_details_hospital_id ON public.patient_details(hospital_id);
CREATE INDEX idx_medical_history_patient_id ON public.medical_history(patient_id);
CREATE INDEX idx_medical_history_admission_date ON public.medical_history(admission_date);
CREATE INDEX idx_staff_assignments_staff_id ON public.staff_patient_assignments(staff_profile_id);
CREATE INDEX idx_staff_assignments_patient_id ON public.staff_patient_assignments(patient_profile_id);
CREATE INDEX idx_staff_assignments_active ON public.staff_patient_assignments(is_active);

-- Insert sample hospital data
INSERT INTO public.hospitals (name, address, city, state, zip_code, phone, email) VALUES
('General Medical Center', '123 Hospital Ave', 'Healthcare City', 'CA', '90210', '(555) 123-4567', 'info@generalmedical.com'),
('St. Mary''s Hospital', '456 Care Street', 'Wellness Town', 'NY', '10001', '(555) 987-6543', 'contact@stmarys.org'),
('University Health System', '789 Academic Blvd', 'Education City', 'TX', '75001', '(555) 555-0123', 'info@universityheath.edu');