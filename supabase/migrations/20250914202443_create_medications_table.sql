-- Create medications table
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patient_details(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  timing TEXT[],
  taken BOOLEAN[],
  purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for the new table
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medications table
CREATE POLICY "Patients can view their own medications"
ON public.medications
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.patient_details pd
    WHERE pd.id = medications.patient_id
    AND pd.profile_id = auth.uid()
  )
);

CREATE POLICY "Patients can update their own medications"
ON public.medications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.patient_details pd
    WHERE pd.id = medications.patient_id
    AND pd.profile_id = auth.uid()
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

-- Function to update timestamps
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();