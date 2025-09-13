import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    User,
    Edit,
    Save,
    X,
    Phone,
    Mail,
    MapPin,
    AlertTriangle,
    Heart,
    Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/integrations/supabase/types";

type PatientDetails = Database["public"]["Tables"]["patient_details"]["Row"];
type PatientDetailsInsert =
    Database["public"]["Tables"]["patient_details"]["Insert"];
type PatientDetailsUpdate =
    Database["public"]["Tables"]["patient_details"]["Update"];

export const PatientDetails = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
        null
    );
    const [editedDetails, setEditedDetails] = useState<
        Partial<PatientDetailsUpdate>
    >({});

    const { toast } = useToast();
    const { profile } = useAuth();

    useEffect(() => {
        if (profile?.id) {
            fetchPatientDetails();
        }
    }, [profile?.id]);

    const fetchPatientDetails = async () => {
        if (!profile?.id) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("patient_details")
                .select(
                    `
          *,
          hospitals:hospital_id (
            name,
            address,
            city,
            state,
            phone
          )
        `
                )
                .eq("profile_id", profile.id)
                .single();

            if (error && error.code !== "PGRST116") {
                throw error;
            }

            setPatientDetails(data);
            if (data) {
                setEditedDetails(data);
            }
        } catch (error) {
            console.error("Error fetching patient details:", error);
            toast({
                title: "Error",
                description: "Failed to load patient details",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!profile?.id) return;

        try {
            setSaving(true);

            if (patientDetails) {
                // Update existing patient details
                const { error } = await supabase
                    .from("patient_details")
                    .update(editedDetails)
                    .eq("profile_id", profile.id);

                if (error) throw error;
            } else {
                // Create new patient details
                const insertData: PatientDetailsInsert = {
                    profile_id: profile.id,
                    first_name: editedDetails.first_name || "",
                    last_name: editedDetails.last_name || "",
                    date_of_birth: editedDetails.date_of_birth || "",
                    ...editedDetails,
                };

                const { error } = await supabase
                    .from("patient_details")
                    .insert(insertData);

                if (error) throw error;
            }

            await fetchPatientDetails();
            setIsEditing(false);

            toast({
                title: "Profile Updated",
                description: "Your information has been saved successfully",
            });
        } catch (error) {
            console.error("Error saving patient details:", error);
            toast({
                title: "Error",
                description: "Failed to save patient details",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedDetails(patientDetails || {});
        setIsEditing(false);
    };

    const calculateAge = (dateOfBirth: string) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age;
    };

    const formatHeight = (heightCm: number) => {
        const feet = Math.floor(heightCm / 30.48);
        const inches = Math.round((heightCm % 30.48) / 2.54);
        return `${heightCm} cm (${feet}'${inches}")`;
    };

    if (loading) {
        return (
            <div className="space-y-6 fade-in">
                <div className="animate-pulse">
                    <Card className="healthcare-card p-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-200 rounded w-48"></div>
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    if (!patientDetails && !isEditing) {
        return (
            <div className="space-y-6 fade-in">
                <Card className="healthcare-card p-6 text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        Complete Your Profile
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Please add your personal information to get started with
                        your healthcare journey.
                    </p>
                    <Button onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Add Personal Information
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            {/* Profile Header */}
            <Card className="healthcare-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">
                                {patientDetails?.first_name}{" "}
                                {patientDetails?.last_name}
                            </h2>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>
                                    Age:{" "}
                                    {patientDetails?.date_of_birth
                                        ? calculateAge(
                                              patientDetails.date_of_birth
                                          )
                                        : "N/A"}
                                </span>
                                <span>•</span>
                                <span>
                                    Gender:{" "}
                                    {patientDetails?.gender || "Not specified"}
                                </span>
                                <span>•</span>
                                <span>
                                    ID:{" "}
                                    {patientDetails?.hospital_patient_id ||
                                        "Not assigned"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {!isEditing ? (
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        ) : (
                            <div className="flex space-x-2">
                                <Button onClick={handleSave} disabled={saving}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Blood Type and Basic Info */}
                {patientDetails?.blood_type && (
                    <div className="flex items-center space-x-4 mb-4">
                        <Badge
                            variant="secondary"
                            className="flex items-center space-x-1"
                        >
                            <Heart className="w-3 h-3" />
                            <span>Blood Type: {patientDetails.blood_type}</span>
                        </Badge>
                        {patientDetails.primary_physician && (
                            <Badge variant="outline">
                                Primary Physician:{" "}
                                {patientDetails.primary_physician}
                            </Badge>
                        )}
                    </div>
                )}
            </Card>

            {/* Personal Information */}
            <Card className="healthcare-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="first_name">First Name</Label>
                            {isEditing ? (
                                <Input
                                    id="first_name"
                                    value={editedDetails.first_name || ""}
                                    onChange={(e) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            first_name: e.target.value,
                                        })
                                    }
                                    placeholder="Enter first name"
                                />
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.first_name ||
                                        "Not provided"}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="last_name">Last Name</Label>
                            {isEditing ? (
                                <Input
                                    id="last_name"
                                    value={editedDetails.last_name || ""}
                                    onChange={(e) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            last_name: e.target.value,
                                        })
                                    }
                                    placeholder="Enter last name"
                                />
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.last_name ||
                                        "Not provided"}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="date_of_birth">Date of Birth</Label>
                            {isEditing ? (
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    value={editedDetails.date_of_birth || ""}
                                    onChange={(e) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            date_of_birth: e.target.value,
                                        })
                                    }
                                />
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.date_of_birth
                                        ? new Date(
                                              patientDetails.date_of_birth
                                          ).toLocaleDateString()
                                        : "Not provided"}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="gender">Gender</Label>
                            {isEditing ? (
                                <Select
                                    value={editedDetails.gender || ""}
                                    onValueChange={(value) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            gender: value as any,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">
                                            Male
                                        </SelectItem>
                                        <SelectItem value="female">
                                            Female
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Other
                                        </SelectItem>
                                        <SelectItem value="prefer_not_to_say">
                                            Prefer not to say
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.gender || "Not provided"}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="blood_type">Blood Type</Label>
                            {isEditing ? (
                                <Select
                                    value={editedDetails.blood_type || ""}
                                    onValueChange={(value) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            blood_type: value as any,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select blood type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.blood_type ||
                                        "Not provided"}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="height_cm">Height</Label>
                            {isEditing ? (
                                <Input
                                    id="height_cm"
                                    type="number"
                                    value={editedDetails.height_cm || ""}
                                    onChange={(e) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            height_cm: parseFloat(
                                                e.target.value
                                            ),
                                        })
                                    }
                                    placeholder="Height in cm"
                                />
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.height_cm
                                        ? formatHeight(patientDetails.height_cm)
                                        : "Not provided"}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="weight_kg">Weight</Label>
                            {isEditing ? (
                                <Input
                                    id="weight_kg"
                                    type="number"
                                    value={editedDetails.weight_kg || ""}
                                    onChange={(e) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            weight_kg: parseFloat(
                                                e.target.value
                                            ),
                                        })
                                    }
                                    placeholder="Weight in kg"
                                />
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.weight_kg
                                        ? `${patientDetails.weight_kg} kg`
                                        : "Not provided"}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="marital_status">
                                Marital Status
                            </Label>
                            {isEditing ? (
                                <Select
                                    value={editedDetails.marital_status || ""}
                                    onValueChange={(value) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            marital_status: value as any,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select marital status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">
                                            Single
                                        </SelectItem>
                                        <SelectItem value="married">
                                            Married
                                        </SelectItem>
                                        <SelectItem value="divorced">
                                            Divorced
                                        </SelectItem>
                                        <SelectItem value="widowed">
                                            Widowed
                                        </SelectItem>
                                        <SelectItem value="separated">
                                            Separated
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.marital_status ||
                                        "Not provided"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Contact Information */}
            <Card className="healthcare-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            {isEditing ? (
                                <Input
                                    id="phone"
                                    value={editedDetails.phone || ""}
                                    onChange={(e) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            phone: e.target.value,
                                        })
                                    }
                                    placeholder="+1 (555) 123-4567"
                                />
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.phone || "Not provided"}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            {isEditing ? (
                                <Input
                                    id="email"
                                    type="email"
                                    value={editedDetails.email || ""}
                                    onChange={(e) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="email@example.com"
                                />
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.email || "Not provided"}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="address_line1">
                                Address Line 1
                            </Label>
                            {isEditing ? (
                                <Input
                                    id="address_line1"
                                    value={editedDetails.address_line1 || ""}
                                    onChange={(e) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            address_line1: e.target.value,
                                        })
                                    }
                                    placeholder="123 Main Street"
                                />
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.address_line1 ||
                                        "Not provided"}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="address_line2">
                                Address Line 2
                            </Label>
                            {isEditing ? (
                                <Input
                                    id="address_line2"
                                    value={editedDetails.address_line2 || ""}
                                    onChange={(e) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            address_line2: e.target.value,
                                        })
                                    }
                                    placeholder="Apt 2B (optional)"
                                />
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.address_line2 || ""}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="city">City</Label>
                            {isEditing ? (
                                <Input
                                    id="city"
                                    value={editedDetails.city || ""}
                                    onChange={(e) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            city: e.target.value,
                                        })
                                    }
                                    placeholder="Your City"
                                />
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.city || "Not provided"}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="state">State</Label>
                            {isEditing ? (
                                <Input
                                    id="state"
                                    value={editedDetails.state || ""}
                                    onChange={(e) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            state: e.target.value,
                                        })
                                    }
                                    placeholder="ST"
                                />
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.state || "Not provided"}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="zip_code">ZIP Code</Label>
                            {isEditing ? (
                                <Input
                                    id="zip_code"
                                    value={editedDetails.zip_code || ""}
                                    onChange={(e) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            zip_code: e.target.value,
                                        })
                                    }
                                    placeholder="12345"
                                />
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.zip_code || "Not provided"}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="country">Country</Label>
                            {isEditing ? (
                                <Input
                                    id="country"
                                    value={
                                        editedDetails.country || "United States"
                                    }
                                    onChange={(e) =>
                                        setEditedDetails({
                                            ...editedDetails,
                                            country: e.target.value,
                                        })
                                    }
                                    placeholder="United States"
                                />
                            ) : (
                                <p className="mt-1 text-sm text-foreground">
                                    {patientDetails?.country || "United States"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Emergency Contact */}
            <Card className="healthcare-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Emergency Contact
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <Label htmlFor="emergency_contact_name">
                            Contact Name
                        </Label>
                        {isEditing ? (
                            <Input
                                id="emergency_contact_name"
                                value={
                                    editedDetails.emergency_contact_name || ""
                                }
                                onChange={(e) =>
                                    setEditedDetails({
                                        ...editedDetails,
                                        emergency_contact_name: e.target.value,
                                    })
                                }
                                placeholder="Full Name"
                            />
                        ) : (
                            <p className="mt-1 text-sm text-foreground">
                                {patientDetails?.emergency_contact_name ||
                                    "Not provided"}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="emergency_contact_phone">
                            Contact Phone
                        </Label>
                        {isEditing ? (
                            <Input
                                id="emergency_contact_phone"
                                value={
                                    editedDetails.emergency_contact_phone || ""
                                }
                                onChange={(e) =>
                                    setEditedDetails({
                                        ...editedDetails,
                                        emergency_contact_phone: e.target.value,
                                    })
                                }
                                placeholder="+1 (555) 987-6543"
                            />
                        ) : (
                            <p className="mt-1 text-sm text-foreground">
                                {patientDetails?.emergency_contact_phone ||
                                    "Not provided"}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="emergency_contact_relationship">
                            Relationship
                        </Label>
                        {isEditing ? (
                            <Input
                                id="emergency_contact_relationship"
                                value={
                                    editedDetails.emergency_contact_relationship ||
                                    ""
                                }
                                onChange={(e) =>
                                    setEditedDetails({
                                        ...editedDetails,
                                        emergency_contact_relationship:
                                            e.target.value,
                                    })
                                }
                                placeholder="Spouse, Parent, etc."
                            />
                        ) : (
                            <p className="mt-1 text-sm text-foreground">
                                {patientDetails?.emergency_contact_relationship ||
                                    "Not provided"}
                            </p>
                        )}
                    </div>
                </div>
            </Card>

            {/* Medical Information */}
            <Card className="healthcare-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Medical Information
                </h3>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="allergies">Allergies</Label>
                        {isEditing ? (
                            <Textarea
                                id="allergies"
                                value={
                                    editedDetails.allergies?.join(", ") || ""
                                }
                                onChange={(e) =>
                                    setEditedDetails({
                                        ...editedDetails,
                                        allergies: e.target.value
                                            ? e.target.value.split(", ")
                                            : [],
                                    })
                                }
                                placeholder="List allergies separated by commas"
                                rows={2}
                            />
                        ) : (
                            <div className="mt-1">
                                {patientDetails?.allergies &&
                                patientDetails.allergies.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {patientDetails.allergies.map(
                                            (allergy, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="destructive"
                                                >
                                                    {allergy}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-foreground">
                                        No known allergies
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="medical_conditions">
                            Medical Conditions
                        </Label>
                        {isEditing ? (
                            <Textarea
                                id="medical_conditions"
                                value={
                                    editedDetails.medical_conditions?.join(
                                        ", "
                                    ) || ""
                                }
                                onChange={(e) =>
                                    setEditedDetails({
                                        ...editedDetails,
                                        medical_conditions: e.target.value
                                            ? e.target.value.split(", ")
                                            : [],
                                    })
                                }
                                placeholder="List medical conditions separated by commas"
                                rows={3}
                            />
                        ) : (
                            <div className="mt-1">
                                {patientDetails?.medical_conditions &&
                                patientDetails.medical_conditions.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {patientDetails.medical_conditions.map(
                                            (condition, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                >
                                                    {condition}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-foreground">
                                        No medical conditions listed
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="current_medications">
                            Current Medications
                        </Label>
                        {isEditing ? (
                            <Textarea
                                id="current_medications"
                                value={
                                    editedDetails.current_medications?.join(
                                        ", "
                                    ) || ""
                                }
                                onChange={(e) =>
                                    setEditedDetails({
                                        ...editedDetails,
                                        current_medications: e.target.value
                                            ? e.target.value.split(", ")
                                            : [],
                                    })
                                }
                                placeholder="List current medications separated by commas"
                                rows={3}
                            />
                        ) : (
                            <div className="mt-1">
                                {patientDetails?.current_medications &&
                                patientDetails.current_medications.length >
                                    0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {patientDetails.current_medications.map(
                                            (medication, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                >
                                                    {medication}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-foreground">
                                        No current medications
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Additional Information */}
            <Card className="healthcare-card p-6">
                <h3 className="text-lg font-semibold mb-4">
                    Additional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="occupation">Occupation</Label>
                        {isEditing ? (
                            <Input
                                id="occupation"
                                value={editedDetails.occupation || ""}
                                onChange={(e) =>
                                    setEditedDetails({
                                        ...editedDetails,
                                        occupation: e.target.value,
                                    })
                                }
                                placeholder="Your occupation"
                            />
                        ) : (
                            <p className="mt-1 text-sm text-foreground">
                                {patientDetails?.occupation || "Not provided"}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="preferred_language">
                            Preferred Language
                        </Label>
                        {isEditing ? (
                            <Input
                                id="preferred_language"
                                value={
                                    editedDetails.preferred_language ||
                                    "English"
                                }
                                onChange={(e) =>
                                    setEditedDetails({
                                        ...editedDetails,
                                        preferred_language: e.target.value,
                                    })
                                }
                                placeholder="English"
                            />
                        ) : (
                            <p className="mt-1 text-sm text-foreground">
                                {patientDetails?.preferred_language ||
                                    "English"}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-4">
                    <Label htmlFor="notes">Additional Notes</Label>
                    {isEditing ? (
                        <Textarea
                            id="notes"
                            value={editedDetails.notes || ""}
                            onChange={(e) =>
                                setEditedDetails({
                                    ...editedDetails,
                                    notes: e.target.value,
                                })
                            }
                            placeholder="Any additional information you'd like to share"
                            rows={3}
                        />
                    ) : (
                        <p className="mt-1 text-sm text-foreground">
                            {patientDetails?.notes || "No additional notes"}
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
};
