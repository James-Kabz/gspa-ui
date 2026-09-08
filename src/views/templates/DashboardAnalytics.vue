<script setup>
import { computed, ref } from 'vue'
import BarChart from '../../components/charts/BarChart.vue'
import Button from '../../components/Button.vue'
import Card from '../../components/Card.vue'
import Graph from '../../components/Graph.vue'
import GraphFilters from '../../components/GraphFilters.vue'
import LineChart from '../../components/charts/LineChart.vue'
import DashboardShell from './DashboardShell.vue'

const dateFrom = ref('')
const dateTo = ref('')
const dataSource = ref('')

const chartSources = [
  { label: 'Core Platform', value: 'core' },
  { label: 'Integrations', value: 'integrations' },
  { label: 'Manual Uploads', value: 'manual' }
]

const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const weeklyScore = [34, 41, 37, 46, 53, 58, 55]

const barLabels = ['APAC', 'EMEA', 'LATAM', 'NA', 'MEA']
const barData = [14, 22, 11, 27, 9]

const trendSummary = computed(() => {
  const recent = weeklyScore[weeklyScore.length - 1]
  const prior = weeklyScore[weeklyScore.length - 2]
  const delta = prior ? ((recent - prior) / prior) * 100 : 0
  return {
    value: delta.toFixed(1),
    direction: delta >= 0 ? 'up' : 'down'
  }
})
</script>

<template>
  <DashboardShell current-page="Analytics">
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold ui-text">
            Analytics
          </h1>
          <p class="ui-text mt-1">
            Monitor risk scoring, review throughput, and regional trends.
          </p>
        </div>
        <Button variant="secondary">
          Download Report
        </Button>
      </div>

      <GraphFilters
        :data-sources="chartSources"
        show-export
        @update:date-from="(value) => (dateFrom = value)"
        @update:date-to="(value) => (dateTo = value)"
        @update:data-source="(value) => (dataSource = value)"
        @export="() => {}"
      />

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card
          title="Weekly Risk Score"
          variant="elevated"
          padding="lg"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-3xl font-semibold ui-text">
                {{ weeklyScore[weeklyScore.length - 1] }}
              </p>
              <p class="text-sm ui-text">
                Rolling average
              </p>
            </div>
            <div
              class="px-3 py-1 rounded-full text-xs font-semibold"
              :class="trendSummary.direction === 'up' ? 'ui-success-soft ui-success' : 'ui-warning-soft ui-warning'"
            >
              {{ trendSummary.direction === 'up' ? '+' : '' }}{{ trendSummary.value }}%
            </div>
          </div>
        </Card>
        <Card
          title="Filters"
          variant="outlined"
          padding="lg"
        >
          <div class="space-y-2 text-sm ui-text">
            <p>Date range: {{ dateFrom || 'Any' }} - {{ dateTo || 'Any' }}</p>
            <p>Source: {{ dataSource || 'All sources' }}</p>
            <p>Segments: 4 active cohorts</p>
          </div>
        </Card>
        <Card
          title="Upcoming Reviews"
          variant="outlined"
          padding="lg"
        >
          <div class="space-y-3">
            <div class="rounded-lg border ui-border-strong p-3">
              <p class="text-sm font-semibold ui-text">
                Vendor renewal cycle
              </p>
              <p class="text-xs ui-text">
                Due in 5 days
              </p>
            </div>
            <div class="rounded-lg border ui-border-strong p-3">
              <p class="text-sm font-semibold ui-text">
                Quarterly policy review
              </p>
              <p class="text-xs ui-text">
                Due in 2 weeks
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Graph
          title="Daily Risk Score"
          description="Momentum across the past week"
          variant="elevated"
        >
          <LineChart
            :data="weeklyScore"
            :labels="weeklyLabels"
            :width="520"
            :height="280"
            value-suffix="%"
          />
        </Graph>

        <Graph
          title="Regional Escalations"
          description="Escalations per region"
          variant="elevated"
        >
          <BarChart
            :data="barData"
            :labels="barLabels"
            series-label="Escalations"
            value-suffix=""
            :width="520"
            :height="280"
          />
        </Graph>
      </div>
    </div>
  </DashboardShell>
</template>
