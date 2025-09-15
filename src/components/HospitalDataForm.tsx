import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Hospital, Activity, Pill, TestTube } from 'lucide-react';

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
    diabetes_medication: initialData?.diabetes_medication || 'no',
    glucose_test: initialData?.glucose_test || 'not_done',
    a1c_test: initialData?.a1c_test || 'not_done',
  });

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
        diabetes_medication: initialData.diabetes_medication || 'no',
        glucose_test: initialData.glucose_test || 'not_done',
        a1c_test: initialData.a1c_test || 'not_done',
      });
    }
  }, [initialData]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return formData.age.trim() !== '' &&
           formData.diabetes_medication.trim() !== '' &&
           formData.glucose_test.trim() !== '' &&
           formData.a1c_test.trim() !== '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <Card className="healthcare-card p-6">
      <div className="space-y-6">
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
          <div className="space-y-2">
            <Label htmlFor="age">Patient Age *</Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter age"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="length_of_stay">Length of Stay (days)</Label>
            <Input
              id="length_of_stay"
              type="number"
              placeholder="Enter days"
              value={formData.length_of_stay}
              onChange={(e) => handleInputChange('length_of_stay', e.target.value)}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Medical Procedures & Medications</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="num_lab_procedures">Lab Procedures</Label>
              <Input
                id="num_lab_procedures"
                type="number"
                placeholder="Number of procedures"
                value={formData.num_lab_procedures}
                onChange={(e) => handleInputChange('num_lab_procedures', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="num_other_procedures">Other Procedures</Label>
              <Input
                id="num_other_procedures"
                type="number"
                placeholder="Number of procedures"
                value={formData.num_other_procedures}
                onChange={(e) => handleInputChange('num_other_procedures', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="num_medications">Medications</Label>
              <Input
                id="num_medications"
                type="number"
                placeholder="Number of medications"
                value={formData.num_medications}
                onChange={(e) => handleInputChange('num_medications', e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Healthcare Utilization (Past Year)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="outpatient_visits">Outpatient Visits</Label>
              <Input
                id="outpatient_visits"
                type="number"
                placeholder="Number of visits"
                value={formData.outpatient_visits}
                onChange={(e) => handleInputChange('outpatient_visits', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="previous_inpatient_stays">Previous Inpatient Stays</Label>
              <Input
                id="previous_inpatient_stays"
                type="number"
                placeholder="Number of stays"
                value={formData.previous_inpatient_stays}
                onChange={(e) => handleInputChange('previous_inpatient_stays', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_visits">Emergency Visits</Label>
              <Input
                id="emergency_visits"
                type="number"
                placeholder="Number of visits"
                value={formData.emergency_visits}
                onChange={(e) => handleInputChange('emergency_visits', e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Diabetes Management</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="diabetes_medication">Diabetes medication *</Label>
              <Select value={formData.diabetes_medication} onValueChange={(value) => handleInputChange('diabetes_medication', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="glucose_test">Glucose test result *</Label>
              <Select value={formData.glucose_test} onValueChange={(value) => handleInputChange('glucose_test', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="not_done">Not Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="a1c_test">A1C test result *</Label>
              <Select value={formData.a1c_test} onValueChange={(value) => handleInputChange('a1c_test', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="not_done">Not Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t">
          <Button 
            onClick={handleSubmit}
            className="w-full md:w-auto px-8"
            disabled={!isFormValid()}
          >
            Submit Data for Prediction
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            * Required fields. All other fields will default to 0 if not provided.
          </p>
        </div>
      </div>
    </Card>
  );
};