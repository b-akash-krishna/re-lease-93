import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MoreHorizontal,
  Calendar,
  Phone,
  MessageSquare
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  diagnosis: string;
  admissionDate: string;
  dischargeDate: string;
  risk: 'Low' | 'Medium' | 'High';
  score: number;
  nextFollowup: string;
  contactNumber?: string;
  lastContact?: string;
  notes?: string;
  medications?: number;
  comorbidities?: string[];
}

interface PatientRiskTableProps {
  patients?: Patient[];
  onPatientSelect?: (patient: Patient) => void;
  onDataFetch?: () => Promise<Patient[]>;
  onScheduleFollowup?: (patientId: string, date: string) => void;
  onContactPatient?: (patientId: string, method: 'phone' | 'message') => void;
  showActions?: boolean;
  pageSize?: number;
}

type SortField = keyof Patient;
type SortDirection = 'asc' | 'desc';
type RiskFilter = 'All' | 'Low' | 'Medium' | 'High';

export const PatientRiskTable = ({ 
  patients, 
  onPatientSelect,
  onDataFetch,
  onScheduleFollowup,
  onContactPatient,
  showActions = true,
  pageSize = 10
}: PatientRiskTableProps) => {
  const [data, setData] = useState<Patient[]>(patients || []);
  const [loading, setLoading] = useState(!patients);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('All');
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      if (onDataFetch) {
        try {
          setLoading(true);
          const newData = await onDataFetch();
          setData(newData);
        } catch (err) {
          console.error('Patient fetch error:', err);
          setData(getMockPatients());
        } finally {
          setLoading(false);
        }
      } else if (!patients) {
        setData(getMockPatients());
        setLoading(false);
      }
    };

    fetchData();
  }, [onDataFetch, patients]);

  const filteredAndSortedPatients = useMemo(() => {
    let filtered = data.filter(patient => {
      const matchesSearch = 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRisk = riskFilter === 'All' || patient.risk === riskFilter;
      
      return matchesSearch && matchesRisk;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, riskFilter, sortField, sortDirection]);

  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedPatients.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedPatients, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedPatients.length / pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getRiskBadgeProps = (risk: string, score: number) => {
    switch (risk) {
      case 'High':
        return { 
          className: 'status-high bg-red-100 text-red-800 border-red-200',
          icon: <AlertTriangle className="h-3 w-3" />
        };
      case 'Medium':
        return { 
          className: 'status-medium bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="h-3 w-3" />
        };
      case 'Low':
        return { 
          className: 'status-low bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="h-3 w-3" />
        };
      default:
        return { 
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Clock className="h-3 w-3" />
        };
    }
  };

  const isOverdueFollowup = (followupDate: string) => {
    return new Date(followupDate) < new Date();
  };

  const getDaysUntilFollowup = (followupDate: string) => {
    const diff = new Date(followupDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Card className="healthcare-card overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                  <div className="h-4 bg-muted rounded w-12"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Patient Risk Assessment</h3>
          <p className="text-sm text-muted-foreground">
            {filteredAndSortedPatients.length} patients • {data.filter(p => p.risk === 'High').length} high risk
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          
          <select 
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskFilter)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>
      </div>

      <Card className="healthcare-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={selectedPatients.size === paginatedPatients.length && paginatedPatients.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPatients(new Set(paginatedPatients.map(p => p.id)));
                      } else {
                        setSelectedPatients(new Set());
                      }
                    }}
                  />
                </th>
                
                <th 
                  className="text-left p-4 font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Patient ID</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                
                <th 
                  className="text-left p-4 font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Patient Info</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                
                <th 
                  className="text-left p-4 font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('diagnosis')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Diagnosis</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                
                <th 
                  className="text-left p-4 font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('risk')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Risk Level</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                
                <th 
                  className="text-left p-4 font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('score')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                
                <th 
                  className="text-left p-4 font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('nextFollowup')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Next Follow-up</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                
                {showActions && (
                  <th className="text-left p-4 font-semibold">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.map((patient) => {
                const badgeProps = getRiskBadgeProps(patient.risk, patient.score);
                const daysUntilFollowup = getDaysUntilFollowup(patient.nextFollowup);
                const isOverdue = isOverdueFollowup(patient.nextFollowup);
                
                return (
                  <tr 
                    key={patient.id} 
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={selectedPatients.has(patient.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedPatients);
                          if (e.target.checked) {
                            newSelected.add(patient.id);
                          } else {
                            newSelected.delete(patient.id);
                          }
                          setSelectedPatients(newSelected);
                        }}
                      />
                    </td>
                    
                    <td className="p-4 font-mono text-sm">{patient.id}</td>
                    
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {patient.age}y • {patient.gender} 
                          {patient.comorbidities && patient.comorbidities.length > 0 && (
                            <span className="ml-2">
                              +{patient.comorbidities.length} comorbidities
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{patient.diagnosis}</div>
                        <div className="text-sm text-muted-foreground">
                          Discharged: {new Date(patient.dischargeDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <Badge className={`${badgeProps.className} flex items-center space-x-1 w-fit`}>
                        {badgeProps.icon}
                        <span>{patient.risk}</span>
                      </Badge>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold text-lg ${
                          patient.score >= 70 ? 'text-red-600' :
                          patient.score >= 40 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {patient.score}
                        </span>
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className={`${isOverdue ? 'text-red-600' : daysUntilFollowup <= 2 ? 'text-yellow-600' : ''}`}>
                        <div className="font-medium">
                          {new Date(patient.nextFollowup).toLocaleDateString()}
                        </div>
                        <div className="text-sm">
                          {isOverdue ? 'Overdue' : 
                           daysUntilFollowup === 0 ? 'Today' :
                           daysUntilFollowup === 1 ? 'Tomorrow' :
                           `In ${daysUntilFollowup} days`}
                        </div>
                      </div>
                    </td>
                    
                    {showActions && (
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onPatientSelect?.(patient)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          
                          {onContactPatient && patient.contactNumber && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onContactPatient(patient.id, 'phone')}
                                className="flex items-center space-x-1"
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onContactPatient(patient.id, 'message')}
                                className="flex items-center space-x-1"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {onScheduleFollowup && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const date = prompt('Enter new follow-up date (YYYY-MM-DD):');
                                if (date) onScheduleFollowup(patient.id, date);
                              }}
                              className="flex items-center space-x-1"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedPatients.length)} of {filteredAndSortedPatients.length} patients
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Bulk actions for selected patients */}
      {selectedPatients.size > 0 && (
        <Card className="healthcare-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedPatients.size} patients selected
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </Button>
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Helper function to generate mock patient data
function getMockPatients(): Patient[] {
  const diagnoses = ['Pneumonia', 'Heart Failure', 'Diabetes', 'Hypertension', 'COPD', 'Stroke', 'MI'];
  const firstNames = ['John', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'Chris', 'Anna', 'James', 'Maria'];
  const lastNames = ['Smith', 'Johnson', 'Davis', 'Wilson', 'Brown', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White'];
  const comorbidities = ['Diabetes', 'Hypertension', 'Heart Disease', 'COPD', 'Kidney Disease', 'Obesity'];

  return Array.from({ length: 25 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const score = Math.floor(Math.random() * 100);
    const risk = score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';
    const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
    
    const dischargeDate = new Date();
    dischargeDate.setDate(dischargeDate.getDate() - Math.floor(Math.random() * 30));
    
    const followupDate = new Date();
    followupDate.setDate(followupDate.getDate() + Math.floor(Math.random() * 21) - 5); // -5 to +15 days

    const patientComorbidities = comorbidities
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3));

    return {
      id: `PT${(i + 1).toString().padStart(3, '0')}`,
      name: `${firstName} ${lastName}`,
      age: Math.floor(Math.random() * 60) + 20,
      gender: Math.random() > 0.5 ? 'M' : 'F',
      diagnosis,
      admissionDate: new Date(dischargeDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dischargeDate: dischargeDate.toISOString().split('T')[0],
      risk: risk as 'Low' | 'Medium' | 'High',
      score,
      nextFollowup: followupDate.toISOString().split('T')[0],
      contactNumber: `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      lastContact: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      medications: Math.floor(Math.random() * 8) + 1,
      comorbidities: patientComorbidities.length > 0 ? patientComorbidities : undefined,
      notes: Math.random() > 0.6 ? 'Follow-up required for medication adherence' : undefined
    };
  }).sort((a, b) => b.score - a.score); // Sort by risk score descending
}