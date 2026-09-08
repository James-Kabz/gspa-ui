<script setup>
import DashboardWidget from '../components/widgets/DashboardWidget.vue'

// Dummy data for different chart types
const barChartData = {
  labels: ['January', 'February', 'March', 'April', 'May'],
  datasets: [{
    data: [65, 59, 80, 81, 56]
  }]
}

const lineChartData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
  datasets: [{
    data: [12, 19, 3, 5, 2]
  }]
}

const pieChartData = {
  labels: ['Desktop', 'Mobile', 'Tablet'],
  datasets: [{
    data: [300, 50, 100]
  }]
}

const doughnutChartData = {
  labels: ['Completed', 'In Progress', 'Pending'],
  datasets: [{
    data: [75, 25, 10]
  }]
}
</script>

<template>
  <div class="widgets-test-page p-6 ui-surface-muted min-h-screen">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold ui-text mb-8">
        Widgets Test Page
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Bar Chart Widget -->
        <DashboardWidget
          id="bar-chart-widget"
          title="Monthly Sales"
          icon="chart-bar"
          chart-type="bar"
          :chart-data="barChartData"
          :customization-options="[
            { id: 'legend', label: 'Show Legend', default: true },
            { id: 'grid', label: 'Show Grid', default: true }
          ]"
        />

        <!-- Line Chart Widget -->
        <DashboardWidget
          id="line-chart-widget"
          title="Weekly Progress"
          icon="chart-line"
          chart-type="line"
          :chart-data="lineChartData"
          :customization-options="[
            { id: 'points', label: 'Show Points', default: true },
            { id: 'fillArea', label: 'Fill Area', default: false }
          ]"
        />

        <!-- Pie Chart Widget -->
        <DashboardWidget
          id="pie-chart-widget"
          title="Device Usage"
          icon="chart-pie"
          chart-type="pie"
          :chart-data="pieChartData"
          :customization-options="[
            { id: 'percentages', label: 'Show Percentages', default: true },
            { id: 'legend', label: 'Show Legend', default: true }
          ]"
        />

        <!-- Doughnut Chart Widget -->
        <DashboardWidget
          id="doughnut-chart-widget"
          title="Task Status"
          icon="circle-half-stroke"
          chart-type="doughnut"
          :chart-data="doughnutChartData"
          :customization-options="[
            { id: 'percentages', label: 'Show Percentages', default: true },
            { id: 'legend', label: 'Show Legend', default: true }
          ]"
        />
      </div>
    </div>
  </div>
</template>