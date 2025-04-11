import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

interface PerformanceDataProps {
  overall: number;
  subjects: {
    [key: string]: number;
  };
  recentTrend: number[];
}

interface PerformanceChartProps {
  performanceData: PerformanceDataProps;
}

const { width } = Dimensions.get('window');

const PerformanceChart: React.FC<PerformanceChartProps> = ({ performanceData }) => {
  // Format subject data for bar chart
  const subjectLabels = Object.keys(performanceData.subjects).map(subject => subject.substring(0, 4));
  const subjectData = Object.values(performanceData.subjects).map(value => Math.round(value));
  
  // Recent trend data for line chart
  const trendLabels = ["Test 5", "Test 4", "Test 3", "Test 2", "Test 1"];
  const trendData = performanceData.recentTrend.map(value => Math.round(value));

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(107, 76, 230, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#6b4ce6"
    }
  };

  const barData = {
    labels: subjectLabels,
    datasets: [
      {
        data: subjectData,
        colors: [
          (opacity = 1) => `rgba(107, 76, 230, ${opacity})`,
          (opacity = 1) => `rgba(157, 133, 242, ${opacity})`,
          (opacity = 1) => `rgba(78, 126, 255, ${opacity})`,
          (opacity = 1) => `rgba(46, 213, 115, ${opacity})`,
          (opacity = 1) => `rgba(255, 126, 179, ${opacity})`,
          (opacity = 1) => `rgba(255, 165, 2, ${opacity})`,
          (opacity = 1) => `rgba(255, 71, 87, ${opacity})`,
        ]
      }
    ]
  };

  const lineData = {
    labels: trendLabels,
    datasets: [
      {
        data: trendData,
        color: (opacity = 1) => `rgba(107, 76, 230, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ["Recent Test Performance"]
  };

  const TabSelector = ({ selected }) => (
    <View style={styles.tabSelector}>
      <View style={[styles.tab, selected === 0 && styles.selectedTab]}>
        <Text style={[styles.tabText, selected === 0 && styles.selectedTabText]}>Subjects</Text>
      </View>
      <View style={[styles.tab, selected === 1 && styles.selectedTab]}>
        <Text style={[styles.tabText, selected === 1 && styles.selectedTabText]}>Recent Trend</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>Subject Performance</Text>
      <View style={styles.chartWrapper}>
        <BarChart
          data={barData}
          width={width - 60}
          height={180}
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
          showValuesOnTopOfBars
          withInnerLines={false}
          showBarTops={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  chartWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  chart: {
    borderRadius: 16,
    paddingRight: 0,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0eafa',
    borderRadius: 25,
    padding: 4,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 25,
  },
  selectedTab: {
    backgroundColor: '#6b4ce6',
  },
  tabText: {
    color: '#6b4ce6',
    fontWeight: '500',
    fontSize: 14,
  },
  selectedTabText: {
    color: 'white',
  },
});

export default PerformanceChart;