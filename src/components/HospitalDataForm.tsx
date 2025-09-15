import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Hospital, Activity, Pill, TestTube, AlertCircle } from 'lucide-react';

interface HospitalData {
  age: number;
  length_of_stay: number;
  num_lab_procedures: number;
  num_other_procedures: number;
  num_medications: number;
  outpatient_visits: number;
  previous_inpatient_stays: number;
  emergency_visits: number;
  diabetes_medication: string;
  glucose_test: string;
  a1c_test: string;
}

interface HospitalDataFormProps {
  onDataSubmit: (data: HospitalData) => void;
  initialData?: Partial<HospitalData> | null;
}

export const HospitalDataForm: React.FC<HospitalDataFormProps> = ({ 
  onDataSubmit, 
  initialData = {} 
}) => {
  const [formData, setFormData] = useState({
    age: initialData?.age?.toString() || '',
    length_of_stay: initialData?.length_of_stay?.toString() || '0',
    num_lab_procedures: initialData?.num_lab_procedures?.toString() || '0',
    num_other_procedures: initialData?.num_other_procedures?.toString() || '0',
    num_medications: initialData?.num_medications?.toString() || '0',
    outpatient_visits: initialData?.outpatient_visits?.toString() || '0',
    previous_inpatient_stays: initialData?.previous_inpatient_stays?.toString() || '0',
    emergency_visits: initialData?.emergency_visits?.toString() || '0',
    diabetes_medication: initialData?.diabetes_medication || '',
    glucose_test: initialData?.glucose_test || '',
    a1c_test: initialData?.a1c_test || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        age: initialData.age?.toString() || '',
        length_of_stay: initialData.length_of_stay?.toString() || '0',
        num_lab_procedures: initialData.num_lab_procedures?.toString() || '0',
        num_other_procedures: initialData.num_other_procedures?.toString() || '0',
        num_medications: initialData.num_medications?.toString() || '0',
        outpatient_visits: initialData.outpatient_visits?.toString() || '0',
        previous_inpatient_stays: initialData.previous_inpatient_stays?.toString() || '0',
        emergency_visits: initialData.emergency_visits?.toString() || '0',
        diabetes_medication: initialData.diabetes_medication || '',
        glucose_test: initialData.glucose_test || '',
        a1c_test: initialData.a1c_test || '',
      });
    }
  }, [initialData]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else {
      const ageNum = parseInt(formData.age, 10);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
        newErrors.age = 'Age must be between 0 and 150';
      }
    }

    if (!formData.diabetes_medication.trim()) {
      newErrors.diabetes_medication = 'Diabetes medication status is required';
    }

    if (!formData.glucose_test.trim()) {
      newErrors.glucose_test = 'Glucose test result is required';
    }

    if (!formData.a1c_test.trim()) {
      newErrors.a1c_test = 'A1C test result is required';
    }

    // Validate numeric fields are non-negative
    const numericFields = [
      'length_of_stay',
      'num_lab_procedures', 
      'num_other_procedures',
      'num_medications',
      'outpatient_visits',
      'previous_inpatient_stays',
      'emergency_visits'
    ];

    numericFields.forEach(field => {
      const value = parseInt(formData[field as keyof typeof formData], 10);
      if (isNaN(value) || value < 0) {
        newErrors[field] = `${field.replace(/_/g, ' ')} must be a non-negative number`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return formData.age.trim() !== '' &&
           formData.diabetes_medication.trim() !== '' &&
           formData.glucose_test.trim() !== '' &&
           formData.a1c_test.trim() !== '' &&
           Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const data: HospitalData = {
      age: parseInt(formData.age, 10),
      length_of_stay: parseInt(formData.length_of_stay, 10),
      num_lab_procedures: parseInt(formData.num_lab_procedures, 10),
      num_other_procedures: parseInt(formData.num_other_procedures, 10),
      num_medications: parseInt(formData.num_medications, 10),
      outpatient_visits: parseInt(formData.outpatient_visits, 10),
      previous_inpatient_stays: parseInt(formData.previous_inpatient_stays, 10),
      emergency_visits: parseInt(formData.emergency_visits, 10),
      diabetes_medication: formData.diabetes_medication,
      glucose_test: formData.glucose_test,
      a1c_test: formData.a1c_test,
    };
    onDataSubmit(data);
  };

  const renderField = (
    id: keyof typeof formData,
    label: string,
    type: 'number' | 'select' = 'number',
    options?: { value: string; label: string }[],
    required = false,
    placeholder = ''
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {type === 'number' ? (
        <Input
          id={id}
          type="number"
          placeholder={placeholder}
          value={formData[id]}
          onChange={(e) => handleInputChange(id, e.target.value)}
          className={errors[id] ? 'border-red-500' : ''}
        />
      ) : (
        <Select 
          value={formData[id]} 
          onValueChange={(value) => handleInputChange(id, value)}
        >
          <SelectTrigger className={errors[id] ? 'border-red-500' : ''}>
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options?.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {errors[id] && (
        <div className="flex items-center space-x-1 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{errors[id]}</span>
        </div>
      )}
    </div>
  );

  return (
    <Card className="healthcare-card p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="healthcare-heading flex items-center space-x-2">
            <Hospital className="h-5 w-5 text-primary" />
            <span>Hospital Data for Prediction</span>
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Fill in the administrative data from the patient's hospital visit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField('age', 'Patient Age', 'number', undefined, true, 'Enter age')}
          {renderField('length_of_stay', 'Length of Stay (days)', 'number', undefined, false, 'Enter days')}
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-semibold text-sm flex items-center space-x-2">
            <Activity className="h-4 w-4 text-primary" />
            <span>Medical Procedures & Medications</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('num_lab_procedures', 'Lab Procedures', 'number', undefined, false, 'Number of procedures')}
            {renderField('num_other_procedures', 'Other Procedures', 'number', undefined, false, 'Number of procedures')}
            {renderField('num_medications', 'Medications', 'number', undefined, false, 'Number of medications')}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-semibold text-sm flex items-center space-x-2">
            <Activity className="h-4 w-4 text-primary" />
            <span>Healthcare Utilization (Past Year)</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('outpatient_visits', 'Outpatient Visits', 'number', undefined, false, 'Number of visits')}
            {renderField('previous_inpatient_stays', 'Previous Inpatient Stays', 'number', undefined, false, 'Number of stays')}
            {renderField('emergency_visits', 'Emergency Visits', 'number', undefined, false, 'Number of visits')}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-semibold text-sm flex items-center space-x-2">
            <TestTube className="h-4 w-4 text-primary" />
            <span>Diabetes Management</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('diabetes_medication', 'Diabetes medication', 'select', [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' }
            ], true)}
            {renderField('glucose_test', 'Glucose test result', 'select', [
              { value: 'normal', label: 'Normal' },
              { value: 'high', label: 'High' },
              { value: 'not_done', label: 'Not Done' }
            ], true)}
            {renderField('a1c_test', 'A1C test result', 'select', [
              { value: 'normal', label: 'Normal' },
              { value: 'high', label: 'High' },
              { value: 'not_done', label: 'Not Done' }
            ], true)}
          </div>
        </div>

        <div className="pt-6 border-t">
          <Button 
            type="submit"
            className="w-full md:w-auto px-8"
            disabled={!isFormValid()}
          >
            Submit Data for Prediction
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            * Required fields. All other fields will default to 0 if not provided.
          </p>
        </div>
      </form>
    </Card>
  );
};