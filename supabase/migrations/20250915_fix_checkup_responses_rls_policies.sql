-- Fix RLS policies for checkup_responses table
-- The issue is that the policies are checking profile_id directly against auth.uid()
-- but they should be checking against the user's profile from the profiles table

-- Drop existing policies for checkup_responses table
DROP POLICY IF EXISTS "Patients can view their own checkup responses" ON public.checkup_responses;
DROP POLICY IF EXISTS "Patients can insert their own checkup responses" ON public.checkup_responses;
DROP POLICY IF EXISTS "Patients can update their own checkup responses" ON public.checkup_responses;
DROP POLICY IF EXISTS "Patients can delete their own checkup responses" ON public.checkup_responses;
DROP POLICY IF EXISTS "Hospital staff can view assigned patients' checkup responses" ON public.checkup_responses;
DROP POLICY IF EXISTS "Hospital staff can insert checkup responses for assigned patients" ON public.checkup_responses;
DROP POLICY IF EXISTS "Hospital staff can update assigned patients' checkup responses" ON public.checkup_responses;
DROP POLICY IF EXISTS "Hospital staff can delete assigned patients' checkup responses" ON public.checkup_responses;

-- Create corrected policies for patients
CREATE POLICY "Patients can view their own checkup responses"
ON public.checkup_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.patient_details pd
    JOIN public.profiles p ON p.id = pd.profile_id
    WHERE pd.id = checkup_responses.patient_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can insert their own checkup responses"
ON public.checkup_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.patient_details pd
    JOIN public.profiles p ON p.id = pd.profile_id
    WHERE pd.id = checkup_responses.patient_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can update their own checkup responses"
ON public.checkup_responses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.patient_details pd
    JOIN public.profiles p ON p.id = pd.profile_id
    WHERE pd.id = checkup_responses.patient_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can delete their own checkup responses"
ON public.checkup_responses
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.patient_details pd
    JOIN public.profiles p ON p.id = pd.profile_id
    WHERE pd.id = checkup_responses.patient_id
    AND p.user_id = auth.uid()
  )
);

-- Create policies for hospital staff
CREATE POLICY "Hospital staff can view assigned patients' checkup responses"
ON public.checkup_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.staff_patient_assignments spa
    JOIN public.patient_details pd ON pd.profile_id = spa.patient_profile_id
    JOIN public.profiles staff_profile ON staff_profile.id = spa.staff_profile_id
    WHERE pd.id = checkup_responses.patient_id
    AND staff_profile.user_id = auth.uid()
    AND staff_profile.role = 'hospital_staff'
    AND spa.is_active = true
  )
);

CREATE POLICY "Hospital staff can insert checkup responses for assigned patients"
ON public.checkup_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.staff_patient_assignments spa
    JOIN public.patient_details pd ON pd.profile_id = spa.patient_profile_id
    JOIN public.profiles staff_profile ON staff_profile.id = spa.staff_profile_id
    WHERE pd.id = checkup_responses.patient_id
    AND staff_profile.user_id = auth.uid()
    AND staff_profile.role = 'hospital_staff'
    AND spa.is_active = true
  )
);

CREATE POLICY "Hospital staff can update assigned patients' checkup responses"
ON public.checkup_responses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.staff_patient_assignments spa
    JOIN public.patient_details pd ON pd.profile_id = spa.patient_profile_id
    JOIN public.profiles staff_profile ON staff_profile.id = spa.staff_profile_id
    WHERE pd.id = checkup_responses.patient_id
    AND staff_profile.user_id = auth.uid()
    AND staff_profile.role = 'hospital_staff'
    AND spa.is_active = true
  )
);

CREATE POLICY "Hospital staff can delete assigned patients' checkup responses"
ON public.checkup_responses
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.staff_patient_assignments spa
    JOIN public.patient_details pd ON pd.profile_id = spa.patient_profile_id
    JOIN public.profiles staff_profile ON staff_profile.id = spa.staff_profile_id
    WHERE pd.id = checkup_responses.patient_id
    AND staff_profile.user_id = auth.uid()
    AND staff_profile.role = 'hospital_staff'
    AND spa.is_active = true
  )
);

-- Add missing update timestamp trigger
CREATE TRIGGER update_checkup_responses_updated_at
  BEFORE UPDATE ON public.checkup_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Improve index coverage for better RLS policy performance
DROP INDEX IF EXISTS idx_checkup_responses_patient_id;
CREATE INDEX idx_checkup_responses_patient_id ON public.checkup_responses(patient_id);
CREATE INDEX idx_checkup_responses_created_at ON public.checkup_responses(created_at DESC);

-- Add index to optimize the patient profile lookups
CREATE INDEX IF NOT EXISTS idx_patient_details_profile_patient ON public.patient_details(profile_id, id);