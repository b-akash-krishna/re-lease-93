import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { User, Edit, Save, X } from "lucide-react";

interface Patient {
  name: string;
  age: number;
  gender: string;
  patientId: string;
  diagnosis: string;
  dischargeDate: string;
  nextCheckup: string;
}

interface PatientDetailsProps {
  patient: Patient;
}

export const PatientDetails = ({ patient }: PatientDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    phone: "+1 (555) 123-4567",
    email: "john.smith@email.com",
    address: "123 Main St, Anytown, ST 12345",
    emergencyContact: "Jane Smith - (555) 987-6543",
    weight: "75 kg",
    height: "175 cm"
  });
  
  const { toast } = useToast();

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your information has been saved successfully",
    });
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Profile Header */}
      <Card className="healthcare-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{patient.name}</h2>
              <p className="text-muted-foreground">Patient ID: {patient.patientId}</p>
            </div>
          </div>
          <Button
            variant={isEditing ? "destructive" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Medical Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Medical Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age:</span>
                <span className="font-medium">{patient.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gender:</span>
                <span className="font-medium">{patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diagnosis:</span>
                <span className="font-medium text-primary">{patient.diagnosis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discharge Date:</span>
                <span className="font-medium">{patient.dischargeDate}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Physical Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Weight:</span>
                {isEditing ? (
                  <Input
                    value={editedInfo.weight}
                    onChange={(e) => setEditedInfo({...editedInfo, weight: e.target.value})}
                    className="w-24 text-right"
                  />
                ) : (
                  <span className="font-medium">{editedInfo.weight}</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Height:</span>
                {isEditing ? (
                  <Input
                    value={editedInfo.height}
                    onChange={(e) => setEditedInfo({...editedInfo, height: e.target.value})}
                    className="w-24 text-right"
                  />
                ) : (
                  <span className="font-medium">{editedInfo.height}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
            {isEditing && (
              <Button onClick={handleSave} className="bg-success hover:bg-success/90">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Phone Number</Label>
                {isEditing ? (
                  <Input
                    value={editedInfo.phone}
                    onChange={(e) => setEditedInfo({...editedInfo, phone: e.target.value})}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium mt-1">{editedInfo.phone}</p>
                )}
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Email Address</Label>
                {isEditing ? (
                  <Input
                    value={editedInfo.email}
                    onChange={(e) => setEditedInfo({...editedInfo, email: e.target.value})}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium mt-1">{editedInfo.email}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Address</Label>
                {isEditing ? (
                  <Input
                    value={editedInfo.address}
                    onChange={(e) => setEditedInfo({...editedInfo, address: e.target.value})}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium mt-1">{editedInfo.address}</p>
                )}
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Emergency Contact</Label>
                {isEditing ? (
                  <Input
                    value={editedInfo.emergencyContact}
                    onChange={(e) => setEditedInfo({...editedInfo, emergencyContact: e.target.value})}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium mt-1">{editedInfo.emergencyContact}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};