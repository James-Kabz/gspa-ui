<script setup>
import { computed, ref } from 'vue'
import Badge from '../../components/Badge.vue'
import Button from '../../components/Button.vue'
import Card from '../../components/Card.vue'
import DashboardWidget from '../../components/widgets/DashboardWidget.vue'
import DataTable from '../../components/DataTable.vue'
import Input from '../../components/Input.vue'
import DashboardShell from './DashboardShell.vue'

const stats = ref([
  {
    label: 'Total Users',
    value: '2,847',
    delta: '+12.4%',
    trend: 'up',
    helper: 'Since last month'
  },
  {
    label: 'Revenue',
    value: '$45,231',
    delta: '+8.1%',
    trend: 'up',
    helper: 'Monthly recurring'
  },
  {
    label: 'At-Risk Accounts',
    value: '37',
    delta: '-4.2%',
    trend: 'down',
    helper: 'Last 30 days'
  },
  {
    label: 'Conversion Rate',
    value: '3.24%',
    delta: '+0.4%',
    trend: 'up',
    helper: 'Site to trial'
  }
])

const activityRows = ref([
  {
    id: 1,
    user: 'Alice Johnson',
    action: 'Published Q1 report',
    status: 'completed',
    time: '2 hours ago'
  },
  {
    id: 2,
    user: 'Ben Clarke',
    action: 'Updated compliance checklist',
    status: 'in_progress',
    time: '5 hours ago'
  },
  {
    id: 3,
    user: 'Cynthia Yu',
    action: 'Escalated vendor review',
    status: 'blocked',
    time: 'Yesterday'
  },
  {
    id: 4,
    user: 'Devon Carter',
    action: 'Resolved audit task',
    status: 'completed',
    time: 'Yesterday'
  },
  {
    id: 5,
    user: 'Eva Warren',
    action: 'Scheduled onboarding',
    status: 'scheduled',
    time: '2 days ago'
  }
])

const columns = [
  { key: 'user', label: 'User' },
  { key: 'action', label: 'Action' },
  { key: 'status', label: 'Status' },
  { key: 'time', label: 'Time' }
]

const statusVariant = (status) => {
  const map = {
    completed: 'success',
    in_progress: 'warning',
    blocked: 'danger',
    scheduled: 'secondary'
  }
  return map[status] || 'secondary'
}

const search = ref('')
const filteredRows = computed(() => {
  if (!search.value.trim()) return activityRows.value
  const query = search.value.toLowerCase()
  return activityRows.value.filter((row) =>
    [row.user, row.action, row.status, row.time].some((value) =>
      String(value).toLowerCase().includes(query)
    )
  )
})

const revenueChart = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  datasets: [{
    label: 'Revenue Growth %',
    data: [18, 24, 21, 29, 36, 41, 39, 47],
    borderColor: 'var(--ui-primary)'
  }]
}

const pipelineChart = {
  labels: ['Qualified', 'Proposal', 'Review', 'Negotiation', 'Won'],
  datasets: [{
    label: 'Deals by Stage',
    data: [28, 21, 16, 11, 8],
    backgroundColor: ['#2563eb', '#0ea5e9', '#14b8a6', '#22c55e', '#f59e0b']
  }]
}
</script>

<template>
  <DashboardShell>
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold ui-text">
            Executive Overview
          </h1>
          <p class="ui-text mt-1">
            Snapshot of platform health and recent operational activity.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <Input
            v-model="search"
            placeholder="Search activity"
            class="w-64"
          />
          <Button variant="primary">
            Create Report
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card
          v-for="stat in stats"
          :key="stat.label"
          :title="stat.label"
          variant="elevated"
          padding="lg"
        >
          <div class="flex items-end justify-between">
            <div>
              <div class="text-2xl font-semibold ui-text">
                {{ stat.value }}
              </div>
              <p class="text-sm ui-text mt-1">
                {{ stat.helper }}
              </p>
            </div>
            <Badge
              :variant="stat.trend === 'up' ? 'success' : 'warning'"
              size="sm"
            >
              {{ stat.delta }}
            </Badge>
          </div>
        </Card>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <DashboardWidget
          id="revenue"
          title="Revenue Momentum"
          icon="chart-line"
          chart-type="line"
          :chart-data="revenueChart"
          :chart-options="{ valueSuffix: '%' }"
          :customization-options="[
            { id: 'points', label: 'Show Points', default: true },
            { id: 'fillArea', label: 'Fill Area', default: true }
          ]"
        />
        <DashboardWidget
          id="pipeline"
          title="Pipeline Stages"
          icon="chart-bar"
          chart-type="bar"
          :chart-data="pipelineChart"
          :customization-options="[
            { id: 'legend', label: 'Show Legend', default: true },
            { id: 'grid', label: 'Show Grid', default: true }
          ]"
        />
        <Card
          title="Decision Log"
          padding="lg"
          variant="outlined"
        >
          <div class="space-y-3">
            <div class="rounded-lg border ui-border-strong p-3">
              <p class="text-sm font-semibold ui-text">
                Vendor renewal approved
              </p>
              <p class="text-xs ui-text">
                Signed off by Finance · 2 hours ago
              </p>
            </div>
            <div class="rounded-lg border ui-border-strong p-3">
              <p class="text-sm font-semibold ui-text">
                Risk score recalibration
              </p>
              <p class="text-xs ui-text">
                Scheduled for Feb 10 · 1 day ago
              </p>
            </div>
            <div class="rounded-lg border ui-border-strong p-3">
              <p class="text-sm font-semibold ui-text">
                New policy rollout
              </p>
              <p class="text-xs ui-text">
                HR compliance · 3 days ago
              </p>
            </div>
            <Button size="sm">
              Open Timeline
            </Button>
          </div>
        </Card>
      </div>

      <Card
        title="Recent Activity"
        subtitle="Latest changes and automation signals"
        variant="elevated"
        padding="none"
      >
        <DataTable
          :data="filteredRows"
          :columns="columns"
          :show-pagination="true"
          :page-size="5"
          striped
        >
          <template #cell-status="{ value }">
            <Badge
              :variant="statusVariant(value)"
              size="sm"
            >
              {{ value.replace('_', ' ') }}
            </Badge>
          </template>
        </DataTable>
      </Card>
    </div>
  </DashboardShell>
</template>
