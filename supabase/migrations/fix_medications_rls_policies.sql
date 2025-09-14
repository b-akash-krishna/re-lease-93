-- Fix RLS policies for medications table
-- The issue is that the policies are checking pd.profile_id = auth.uid()
-- but they should be checking against the user's profile from the profiles table

-- Drop all existing policies for medications table
DROP POLICY IF EXISTS "Patients can view their own medications" ON public.medications;
DROP POLICY IF EXISTS "Patients can insert their own medications" ON public.medications;
DROP POLICY IF EXISTS "Patients can update their own medications" ON public.medications;
DROP POLICY IF EXISTS "Patients can delete their own medications" ON public.medications;
DROP POLICY IF EXISTS "Hospital staff can view assigned patients' medications" ON public.medications;
DROP POLICY IF EXISTS "Hospital staff can insert medications for assigned patients" ON public.medications;
DROP POLICY IF EXISTS "Hospital staff can update assigned patients' medications" ON public.medications;
DROP POLICY IF EXISTS "Hospital staff can delete assigned patients' medications" ON public.medications;

-- Create corrected policies
CREATE POLICY "Patients can view their own medications"
ON public.medications
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.patient_details pd
    JOIN public.profiles p ON p.id = pd.profile_id
    WHERE pd.id = medications.patient_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can insert their own medications"
ON public.medications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.patient_details pd
    JOIN public.profiles p ON p.id = pd.profile_id
    WHERE pd.id = medications.patient_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can update their own medications"
ON public.medications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.patient_details pd
    JOIN public.profiles p ON p.id = pd.profile_id
    WHERE pd.id = medications.patient_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can delete their own medications"
ON public.medications
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.patient_details pd
    JOIN public.profiles p ON p.id = pd.profile_id
    WHERE pd.id = medications.patient_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Hospital staff can view assigned patients' medications"
ON public.medications
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.staff_patient_assignments spa
    JOIN public.patient_details pd ON pd.profile_id = spa.patient_profile_id
    JOIN public.profiles staff_profile ON staff_profile.id = spa.staff_profile_id
    WHERE pd.id = medications.patient_id
    AND staff_profile.user_id = auth.uid()
    AND staff_profile.role = 'hospital_staff'
    AND spa.is_active = true
  )
);

CREATE POLICY "Hospital staff can insert medications for assigned patients"
ON public.medications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.staff_patient_assignments spa
    JOIN public.patient_details pd ON pd.profile_id = spa.patient_profile_id
    JOIN public.profiles staff_profile ON staff_profile.id = spa.staff_profile_id
    WHERE pd.id = medications.patient_id
    AND staff_profile.user_id = auth.uid()
    AND staff_profile.role = 'hospital_staff'
    AND spa.is_active = true
  )
);

CREATE POLICY "Hospital staff can update assigned patients' medications"
ON public.medications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.staff_patient_assignments spa
    JOIN public.patient_details pd ON pd.profile_id = spa.patient_profile_id
    JOIN public.profiles staff_profile ON staff_profile.id = spa.staff_profile_id
    WHERE pd.id = medications.patient_id
    AND staff_profile.user_id = auth.uid()
    AND staff_profile.role = 'hospital_staff'
    AND spa.is_active = true
  )
);

CREATE POLICY "Hospital staff can delete assigned patients' medications"
ON public.medications
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.staff_patient_assignments spa
    JOIN public.patient_details pd ON pd.profile_id = spa.patient_profile_id
    JOIN public.profiles staff_profile ON staff_profile.id = spa.staff_profile_id
    WHERE pd.id = medications.patient_id
    AND staff_profile.user_id = auth.uid()
    AND staff_profile.role = 'hospital_staff'
    AND spa.is_active = true
  )
);

-- Add an index to improve performance of these RLS queries
CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON public.medications(patient_id);