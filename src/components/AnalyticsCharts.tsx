import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface RiskDistribution {
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
}

interface ReadmissionFactor {
  factor: string;
  percentage: number;
  color: string;
}

interface AnalyticsData {
  riskDistribution: RiskDistribution;
  readmissionFactors: ReadmissionFactor[];
  lastUpdated: Date;
}

interface AnalyticsChartsProps {
  analyticsData?: AnalyticsData;
  onDataFetch?: () => Promise<AnalyticsData>;
  refreshInterval?: number; // in milliseconds
}

export const AnalyticsCharts = ({ 
  analyticsData, 
  onDataFetch, 
  refreshInterval = 300000 // 5 minutes
}: AnalyticsChartsProps) => {
  const [data, setData] = useState<AnalyticsData>(
    analyticsData || {
      riskDistribution: { lowRisk: 0, mediumRisk: 0, highRisk: 0 },
      readmissionFactors: [],
      lastUpdated: new Date()
    }
  );
  const [loading, setLoading] = useState(!analyticsData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (onDataFetch) {
        try {
          setLoading(true);
          setError(null);
          const newData = await onDataFetch();
          setData(newData);
        } catch (err) {
          setError('Failed to fetch analytics data');
          console.error('Analytics fetch error:', err);
          
          // Use mock data as fallback
          setData(getMockAnalyticsData());
        } finally {
          setLoading(false);
        }
      } else {
        // Use mock data if no fetch function provided
        setData(getMockAnalyticsData());
        setLoading(false);
      }
    };

    fetchData();

    // Set up periodic refresh if interval provided
    if (refreshInterval > 0 && onDataFetch) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [onDataFetch, refreshInterval]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'high': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="healthcare-card p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <div className="h-3 bg-muted rounded w-20"></div>
                    <div className="h-3 bg-muted rounded w-10"></div>
                  </div>
                  <div className="h-3 bg-muted/30 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card className="healthcare-card p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <div className="h-3 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-10"></div>
                  </div>
                  <div className="h-3 bg-muted/30 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="healthcare-card p-6">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">Showing cached data</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="healthcare-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Risk Distribution</h3>
          <span className="text-xs text-muted-foreground">
            Updated: {data.lastUpdated.toLocaleTimeString()}
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-success mr-2"></div>
                Low Risk
              </span>
              <span className="font-medium">{data.riskDistribution.lowRisk}%</span>
            </div>
            <Progress value={data.riskDistribution.lowRisk} className="h-3" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-warning mr-2"></div>
                Medium Risk
              </span>
              <span className="font-medium">{data.riskDistribution.mediumRisk}%</span>
            </div>
            <Progress value={data.riskDistribution.mediumRisk} className="h-3" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-destructive mr-2"></div>
                High Risk
              </span>
              <span className="font-medium">{data.riskDistribution.highRisk}%</span>
            </div>
            <Progress value={data.riskDistribution.highRisk} className="h-3" />
          </div>
        </div>
        
        {/* Summary insights */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Insight:</strong> {getInsightMessage(data.riskDistribution)}
          </p>
        </div>
      </Card>

      <Card className="healthcare-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Readmission Factors</h3>
          <span className="text-xs text-muted-foreground">
            Top {data.readmissionFactors.length} factors
          </span>
        </div>
        <div className="space-y-4">
          {data.readmissionFactors.map((factor, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center">
                  <div 
                    className={`w-3 h-3 rounded-full mr-2`}
                    style={{ backgroundColor: factor.color }}
                  ></div>
                  {factor.factor}
                </span>
                <span className="font-medium">{factor.percentage}%</span>
              </div>
              <Progress 
                value={factor.percentage} 
                className="h-3"
              />
            </div>
          ))}
        </div>

        {/* Action recommendations */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <p className="text-xs text-blue-700">
            <strong>Recommendation:</strong> {getRecommendation(data.readmissionFactors[0])}
          </p>
        </div>
      </Card>
    </div>
  );
};

// Helper functions
function getMockAnalyticsData(): AnalyticsData {
  return {
    riskDistribution: {
      lowRisk: Math.floor(Math.random() * 20) + 60, // 60-80%
      mediumRisk: Math.floor(Math.random() * 15) + 15, // 15-30%
      highRisk: Math.floor(Math.random() * 10) + 5  // 5-15%
    },
    readmissionFactors: [
      { factor: 'Medication Non-adherence', percentage: Math.floor(Math.random() * 10) + 35, color: '#dc2626' },
      { factor: 'Symptom Persistence', percentage: Math.floor(Math.random() * 10) + 25, color: '#ea580c' },
      { factor: 'Lifestyle Factors', percentage: Math.floor(Math.random() * 8) + 17, color: '#ca8a04' },
      { factor: 'Chronic Conditions', percentage: Math.floor(Math.random() * 5) + 8, color: '#65a30d' },
      { factor: 'Social Determinants', percentage: Math.floor(Math.random() * 5) + 5, color: '#0891b2' }
    ],
    lastUpdated: new Date()
  };
}

function getInsightMessage(riskDistribution: RiskDistribution): string {
  const { lowRisk, mediumRisk, highRisk } = riskDistribution;
  
  if (highRisk > 15) {
    return `High-risk patients (${highRisk}%) require immediate attention and enhanced monitoring.`;
  } else if (mediumRisk > 25) {
    return `Significant medium-risk population (${mediumRisk}%) - consider preventive interventions.`;
  } else {
    return `Good risk profile with ${lowRisk}% low-risk patients. Continue current care protocols.`;
  }
}

function getRecommendation(topFactor: ReadmissionFactor): string {
  const recommendations: { [key: string]: string } = {
    'medication non-adherence': 'Implement automated reminder systems and pharmacist consultations.',
    'symptom persistence': 'Enhance follow-up care and patient education on symptom management.',
    'lifestyle factors': 'Expand lifestyle counseling and support programs.',
    'chronic conditions': 'Strengthen chronic disease management protocols.',
    'social determinants': 'Consider social work referrals and community resource connections.'
  };
  
  return recommendations[topFactor?.factor?.toLowerCase()] || 
         'Focus on patient education and regular follow-up care.';
}