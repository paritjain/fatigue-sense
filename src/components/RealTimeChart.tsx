import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DataPoint {
  time: number;
  value: number;
}

interface RealTimeChartProps {
  data: DataPoint[];
  label: string;
  unit: string;
  color?: string;
  threshold?: number;
  thresholdLabel?: string;
}

const RealTimeChart = ({ 
  data, 
  label, 
  unit, 
  color = 'hsl(var(--primary))',
  threshold,
  thresholdLabel
}: RealTimeChartProps) => {
  const latestValue = data.length > 0 ? data[data.length - 1].value : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="font-mono text-sm" style={{ color }}>
          {latestValue.toFixed(1)} {unit}
        </span>
      </div>
      
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis 
              dataKey="time" 
              hide 
            />
            <YAxis 
              hide 
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            {threshold && (
              <ReferenceLine 
                y={threshold} 
                stroke="hsl(var(--status-fatigued))" 
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {threshold && thresholdLabel && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-4 h-px bg-status-fatigued" style={{ background: 'repeating-linear-gradient(90deg, hsl(var(--status-fatigued)) 0 3px, transparent 3px 6px)' }} />
          <span>{thresholdLabel}: {threshold}{unit}</span>
        </div>
      )}
    </div>
  );
};

export default RealTimeChart;
