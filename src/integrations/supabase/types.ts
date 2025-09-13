export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5";
    };
    public: {
        Tables: {
            hospitals: {
                Row: {
                    id: string;
                    name: string;
                    address: string | null;
                    city: string | null;
                    state: string | null;
                    zip_code: string | null;
                    phone: string | null;
                    email: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    address?: string | null;
                    city?: string | null;
                    state?: string | null;
                    zip_code?: string | null;
                    phone?: string | null;
                    email?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    address?: string | null;
                    city?: string | null;
                    state?: string | null;
                    zip_code?: string | null;
                    phone?: string | null;
                    email?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            medical_history: {
                Row: {
                    id: string;
                    patient_id: string;
                    hospital_id: string | null;
                    admission_date: string;
                    discharge_date: string | null;
                    admission_type: string | null;
                    primary_diagnosis: string;
                    secondary_diagnoses: string[] | null;
                    procedures_performed: string[] | null;
                    medications_prescribed: string[] | null;
                    discharge_disposition: string | null;
                    discharge_instructions: string | null;
                    follow_up_required: boolean | null;
                    follow_up_date: string | null;
                    readmission_risk_score: number | null;
                    risk_factors: string[] | null;
                    attending_physician: string | null;
                    discharge_summary: string | null;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    patient_id: string;
                    hospital_id?: string | null;
                    admission_date: string;
                    discharge_date?: string | null;
                    admission_type?: string | null;
                    primary_diagnosis: string;
                    secondary_diagnoses?: string[] | null;
                    procedures_performed?: string[] | null;
                    medications_prescribed?: string[] | null;
                    discharge_disposition?: string | null;
                    discharge_instructions?: string | null;
                    follow_up_required?: boolean | null;
                    follow_up_date?: string | null;
                    readmission_risk_score?: number | null;
                    risk_factors?: string[] | null;
                    attending_physician?: string | null;
                    discharge_summary?: string | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    patient_id?: string;
                    hospital_id?: string | null;
                    admission_date?: string;
                    discharge_date?: string | null;
                    admission_type?: string | null;
                    primary_diagnosis?: string;
                    secondary_diagnoses?: string[] | null;
                    procedures_performed?: string[] | null;
                    medications_prescribed?: string[] | null;
                    discharge_disposition?: string | null;
                    discharge_instructions?: string | null;
                    follow_up_required?: boolean | null;
                    follow_up_date?: string | null;
                    readmission_risk_score?: number | null;
                    risk_factors?: string[] | null;
                    attending_physician?: string | null;
                    discharge_summary?: string | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "medical_history_hospital_id_fkey";
                        columns: ["hospital_id"];
                        isOneToOne: false;
                        referencedRelation: "hospitals";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "medical_history_patient_id_fkey";
                        columns: ["patient_id"];
                        isOneToOne: false;
                        referencedRelation: "patient_details";
                        referencedColumns: ["id"];
                    }
                ];
            };
            patient_details: {
                Row: {
                    id: string;
                    profile_id: string;
                    hospital_id: string | null;
                    first_name: string;
                    last_name: string;
                    date_of_birth: string;
                    gender: Database["public"]["Enums"]["gender"] | null;
                    blood_type:
                        | Database["public"]["Enums"]["blood_type"]
                        | null;
                    phone: string | null;
                    email: string | null;
                    address_line1: string | null;
                    address_line2: string | null;
                    city: string | null;
                    state: string | null;
                    zip_code: string | null;
                    country: string | null;
                    emergency_contact_name: string | null;
                    emergency_contact_phone: string | null;
                    emergency_contact_relationship: string | null;
                    height_cm: number | null;
                    weight_kg: number | null;
                    allergies: string[] | null;
                    medical_conditions: string[] | null;
                    current_medications: string[] | null;
                    insurance_provider: string | null;
                    insurance_policy_number: string | null;
                    insurance_group_number: string | null;
                    marital_status:
                        | Database["public"]["Enums"]["marital_status"]
                        | null;
                    occupation: string | null;
                    preferred_language: string | null;
                    notes: string | null;
                    hospital_patient_id: string | null;
                    primary_physician: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    profile_id: string;
                    hospital_id?: string | null;
                    first_name: string;
                    last_name: string;
                    date_of_birth: string;
                    gender?: Database["public"]["Enums"]["gender"] | null;
                    blood_type?:
                        | Database["public"]["Enums"]["blood_type"]
                        | null;
                    phone?: string | null;
                    email?: string | null;
                    address_line1?: string | null;
                    address_line2?: string | null;
                    city?: string | null;
                    state?: string | null;
                    zip_code?: string | null;
                    country?: string | null;
                    emergency_contact_name?: string | null;
                    emergency_contact_phone?: string | null;
                    emergency_contact_relationship?: string | null;
                    height_cm?: number | null;
                    weight_kg?: number | null;
                    allergies?: string[] | null;
                    medical_conditions?: string[] | null;
                    current_medications?: string[] | null;
                    insurance_provider?: string | null;
                    insurance_policy_number?: string | null;
                    insurance_group_number?: string | null;
                    marital_status?:
                        | Database["public"]["Enums"]["marital_status"]
                        | null;
                    occupation?: string | null;
                    preferred_language?: string | null;
                    notes?: string | null;
                    hospital_patient_id?: string | null;
                    primary_physician?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    profile_id?: string;
                    hospital_id?: string | null;
                    first_name?: string;
                    last_name?: string;
                    date_of_birth?: string;
                    gender?: Database["public"]["Enums"]["gender"] | null;
                    blood_type?:
                        | Database["public"]["Enums"]["blood_type"]
                        | null;
                    phone?: string | null;
                    email?: string | null;
                    address_line1?: string | null;
                    address_line2?: string | null;
                    city?: string | null;
                    state?: string | null;
                    zip_code?: string | null;
                    country?: string | null;
                    emergency_contact_name?: string | null;
                    emergency_contact_phone?: string | null;
                    emergency_contact_relationship?: string | null;
                    height_cm?: number | null;
                    weight_kg?: number | null;
                    allergies?: string[] | null;
                    medical_conditions?: string[] | null;
                    current_medications?: string[] | null;
                    insurance_provider?: string | null;
                    insurance_policy_number?: string | null;
                    insurance_group_number?: string | null;
                    marital_status?:
                        | Database["public"]["Enums"]["marital_status"]
                        | null;
                    occupation?: string | null;
                    preferred_language?: string | null;
                    notes?: string | null;
                    hospital_patient_id?: string | null;
                    primary_physician?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "patient_details_hospital_id_fkey";
                        columns: ["hospital_id"];
                        isOneToOne: false;
                        referencedRelation: "hospitals";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "patient_details_profile_id_fkey";
                        columns: ["profile_id"];
                        isOneToOne: true;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            profiles: {
                Row: {
                    created_at: string;
                    display_name: string | null;
                    id: string;
                    patient_id: string | null;
                    role: Database["public"]["Enums"]["user_role"];
                    staff_id: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    display_name?: string | null;
                    id?: string;
                    patient_id?: string | null;
                    role?: Database["public"]["Enums"]["user_role"];
                    staff_id?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    display_name?: string | null;
                    id?: string;
                    patient_id?: string | null;
                    role?: Database["public"]["Enums"]["user_role"];
                    staff_id?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            staff_patient_assignments: {
                Row: {
                    id: string;
                    staff_profile_id: string;
                    patient_profile_id: string;
                    hospital_id: string;
                    assigned_date: string;
                    is_active: boolean | null;
                    role_type: string | null;
                };
                Insert: {
                    id?: string;
                    staff_profile_id: string;
                    patient_profile_id: string;
                    hospital_id: string;
                    assigned_date?: string;
                    is_active?: boolean | null;
                    role_type?: string | null;
                };
                Update: {
                    id?: string;
                    staff_profile_id?: string;
                    patient_profile_id?: string;
                    hospital_id?: string;
                    assigned_date?: string;
                    is_active?: boolean | null;
                    role_type?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "staff_patient_assignments_hospital_id_fkey";
                        columns: ["hospital_id"];
                        isOneToOne: false;
                        referencedRelation: "hospitals";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "staff_patient_assignments_patient_profile_id_fkey";
                        columns: ["patient_profile_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "staff_patient_assignments_staff_profile_id_fkey";
                        columns: ["staff_profile_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
            gender: "male" | "female" | "other" | "prefer_not_to_say";
            marital_status:
                | "single"
                | "married"
                | "divorced"
                | "widowed"
                | "separated"
                | "other";
            user_role: "patient" | "hospital_staff";
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
    keyof Database,
    "public"
>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never = never
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
          DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
          DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
          Row: infer R;
      }
        ? R
        : never
    : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
          Insert: infer I;
      }
        ? I
        : never
    : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
          Update: infer U;
      }
        ? U
        : never
    : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        | keyof DefaultSchema["Enums"]
        | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never = never
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema["CompositeTypes"]
        | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
    public: {
        Enums: {
            blood_type: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            gender: ["male", "female", "other", "prefer_not_to_say"],
            marital_status: [
                "single",
                "married",
                "divorced",
                "widowed",
                "separated",
                "other",
            ],
            user_role: ["patient", "hospital_staff"],
        },
    },
} as const;
