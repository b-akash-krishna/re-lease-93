-- Create the checkup_responses table
CREATE TABLE public.checkup_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patient_details(id) ON DELETE CASCADE,
  checkup_date TIMESTAMP WITH TIME ZONE NOT NULL,
  responses JSONB NOT NULL,
  risk_score INTEGER NOT NULL,
  prediction_result TEXT,
  triggered_alert BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for the new table
ALTER TABLE public.checkup_responses ENABLE ROW LEVEL SECURITY;

-- RLS policy for patients to see their own checkups
CREATE POLICY "Patients can view their own checkup responses"
ON public.checkup_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.patient_details
    WHERE id = checkup_responses.patient_id
    AND profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- RLS policy for patients to insert their own checkups
CREATE POLICY "Patients can insert their own checkup responses"
ON public.checkup_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.patient_details
    WHERE id = checkup_responses.patient_id
    AND profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Index for better performance
CREATE INDEX idx_checkup_responses_patient_id ON public.checkup_responses(patient_id);