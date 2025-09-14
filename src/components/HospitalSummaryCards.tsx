import { Card } from "@/components/ui/card";
import { Users, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEffect, useState } from "react";

interface SummaryMetric {
  label: string;
  value: number;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon: any;
  colorClass: string;
  priority: 'critical' | 'warning' | 'success' | 'info';
}

interface HospitalSummaryData {
  totalDischarged: SummaryMetric;
  predictedReadmissions: SummaryMetric;
  lowRiskPatients: SummaryMetric;
  highRiskPatients: SummaryMetric;
  lastUpdated: Date;
  timeframe: string;
}

interface HospitalSummaryCardsProps {
  summaryData?: HospitalSummaryData;
  onDataFetch?: () => Promise<HospitalSummaryData>;
  refreshInterval?: number;
  timeframe?: 'today' | 'week' | 'month';
}

export const HospitalSummaryCards = ({ 
  summaryData, 
  onDataFetch, 
  refreshInterval = 60000, // 1 minute
  timeframe = 'today'
}: HospitalSummaryCardsProps) => {
  const [data, setData] = useState<HospitalSummaryData | null>(summaryData || null);
  const [loading, setLoading] = useState(!summaryData);
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
          setError('Failed to fetch summary data');
          console.error('Summary fetch error:', err);
          
          // Use mock data as fallback
          setData(getMockSummaryData(timeframe));
        } finally {
          setLoading(false);
        }
      } else {
        // Use mock data if no fetch function provided
        setData(getMockSummaryData(timeframe));
        setLoading(false);
      }
    };

    fetchData();

    // Set up periodic refresh if interval provided
    if (refreshInterval > 0 && onDataFetch) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [onDataFetch, refreshInterval, timeframe]);

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      case 'stable': return <Minus className="h-3 w-3 text-gray-600" />;
      default: return null;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable', priority?: string) => {
    if (!trend) return '';
    
    // For some metrics, "up" might be bad (e.g., readmissions)
    if (priority === 'critical' || priority === 'warning') {
      return trend === 'up' ? 'text-red-600' : trend === 'down' ? 'text-green-600' : 'text-gray-600';
    }
    
    // For positive metrics, "up" is good
    return trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="healthcare-card p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-3 bg-muted rounded w-24 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-16 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="healthcare-card p-6 col-span-full">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">{error || 'No data available'}</p>
            <p className="text-xs mt-2">Please try refreshing the page</p>
          </div>
        </Card>
      </div>
    );
  }

  const metrics = [
    data.totalDischarged,
    data.predictedReadmissions,
    data.lowRiskPatients,
    data.highRiskPatients
  ];

  return (
    <div className="space-y-4">
      {/* Header with timeframe and last updated */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Hospital Summary</h2>
          <p className="text-sm text-muted-foreground capitalize">
            Data for {data.timeframe} • Last updated: {data.lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card 
            key={index} 
            className={`healthcare-card p-6 transition-all hover:shadow-lg ${
              metric.priority === 'critical' ? 'border-red-200' :
              metric.priority === 'warning' ? 'border-yellow-200' :
              metric.priority === 'success' ? 'border-green-200' :
              'border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  {metric.label}
                </p>
                <div className="flex items-baseline space-x-2">
                  <p className={`text-3xl font-bold ${metric.colorClass}`}>
                    {metric.value.toLocaleString()}
                  </p>
                  {metric.trend && metric.trendValue && (
                    <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend, metric.priority)}`}>
                      {getTrendIcon(metric.trend)}
                      <span className="text-xs font-medium">
                        {metric.trendValue}%
                      </span>
                    </div>
                  )}
                </div>
                {metric.percentage && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ({metric.percentage}%)
                  </p>
                )}
              </div>
              <div className={`p-2 rounded-full bg-white/80`}>
                <metric.icon className={`h-8 w-8 ${metric.colorClass}`} />
              </div>
            </div>

            {/* Priority indicator */}
            {metric.priority === 'critical' && (
              <div className="mt-3 px-2 py-1 bg-red-50 rounded text-xs text-red-700 border border-red-200">
                Requires immediate attention
              </div>
            )}
            {metric.priority === 'warning' && (
              <div className="mt-3 px-2 py-1 bg-yellow-50 rounded text-xs text-yellow-700 border border-yellow-200">
                Monitor closely
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Quick insights */}
      <Card className="healthcare-card p-4">
        <h3 className="text-sm font-semibold mb-2">Quick Insights</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Readmission Rate: </span>
            <span className={
              data.predictedReadmissions.percentage! > 25 ? 'text-red-600' :
              data.predictedReadmissions.percentage! > 15 ? 'text-yellow-600' :
              'text-green-600'
            }>
              {data.predictedReadmissions.percentage}%
              {data.predictedReadmissions.percentage! > 20 ? ' (Above average)' : ' (Within normal range)'}
            </span>
          </div>
          <div>
            <span className="font-medium">Risk Profile: </span>
            <span className={
              data.highRiskPatients.percentage! > 30 ? 'text-red-600' :
              data.highRiskPatients.percentage! > 20 ? 'text-yellow-600' :
              'text-green-600'
            }>
              {data.lowRiskPatients.percentage}% low risk, {data.highRiskPatients.percentage}% high risk
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Helper function to generate mock data
function getMockSummaryData(timeframe: string): HospitalSummaryData {
  const baseMultiplier = {
    'today': 1,
    'week': 7,
    'month': 30
  };

  const multiplier = baseMultiplier[timeframe as keyof typeof baseMultiplier] || 1;
  
  const totalDischarged = Math.floor((Math.random() * 50 + 100) * multiplier);
  const readmissions = Math.floor(totalDischarged * (0.15 + Math.random() * 0.1)); // 15-25%
  const highRisk = Math.floor(totalDischarged * (0.25 + Math.random() * 0.1)); // 25-35%
  const lowRisk = totalDischarged - readmissions - highRisk + Math.floor(Math.random() * 20);

  return {
    totalDischarged: {
      label: 'Total Discharged Patients',
      value: totalDischarged,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      trendValue: Math.floor(Math.random() * 10) + 2,
      icon: Users,
      colorClass: 'text-foreground',
      priority: 'info'
    },
    predictedReadmissions: {
      label: 'Predicted Readmissions',
      value: readmissions,
      percentage: Math.round((readmissions / totalDischarged) * 100),
      trend: Math.random() > 0.6 ? 'down' : 'up',
      trendValue: Math.floor(Math.random() * 8) + 1,
      icon: AlertTriangle,
      colorClass: 'text-destructive',
      priority: readmissions / totalDischarged > 0.2 ? 'critical' : 'warning'
    },
    lowRiskPatients: {
      label: 'Low Risk Patients',
      value: lowRisk,
      percentage: Math.round((lowRisk / totalDischarged) * 100),
      trend: Math.random() > 0.4 ? 'up' : 'stable',
      trendValue: Math.floor(Math.random() * 5) + 1,
      icon: CheckCircle,
      colorClass: 'text-success',
      priority: 'success'
    },
    highRiskPatients: {
      label: 'High Risk Patients',
      value: highRisk,
      percentage: Math.round((highRisk / totalDischarged) * 100),
      trend: Math.random() > 0.5 ? 'down' : 'up',
      trendValue: Math.floor(Math.random() * 6) + 1,
      icon: Clock,
      colorClass: 'text-warning',
      priority: highRisk / totalDischarged > 0.3 ? 'critical' : 'warning'
    },
    lastUpdated: new Date(),
    timeframe
  };
}