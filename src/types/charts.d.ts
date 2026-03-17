interface ChartDataPoint {
  label: string;
  value: number;
  series?: number;
}

interface ChartReferenceLine {
  value: number;
  label?: string;
  series?: number;
}

interface BarChartGroupValue {
  name: string;
  value: number;
  series?: number;
}

interface BarChartGroup {
  label: string;
  values: BarChartGroupValue[];
}

interface DonutCenterMetric {
  label: string;
  value: string;
}

interface LineChartPoint {
  label: string;
  value: number;
}

interface LineChartSeries {
  name: string;
  data: LineChartPoint[];
  series?: number;
}
