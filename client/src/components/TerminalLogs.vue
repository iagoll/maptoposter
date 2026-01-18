<template>
  <v-card elevation="2">
    <v-card-title class="text-h6 d-flex align-center">
      <v-icon class="mr-2">mdi-console</v-icon>
      Generation Log
      <v-spacer></v-spacer>
      <v-chip :color="store.statusColor" size="small" class="mr-2">
        {{ store.jobStatus }}
      </v-chip>
      <v-btn
        icon
        size="small"
        @click="store.showTerminal = false"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="pa-0">
      <div class="terminal-container" ref="terminalContainer">
        <div
          v-for="(log, index) in store.logs"
          :key="index"
          :class="['terminal-line', `terminal-${log.type}`]"
        >
          <span class="terminal-timestamp">{{ formatTime(log.timestamp) }}</span>
          <span class="terminal-message">{{ log.message }}</span>
        </div>
        <div v-if="store.logs.length === 0" class="terminal-empty">
          Waiting for logs...
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { usePosterStore } from '../store/posterStore'
import { formatTime } from '../services/utils'

const store = usePosterStore()
const terminalContainer = ref(null)

// Auto-scroll to bottom when new logs arrive
watch(() => store.logs.length, async () => {
  await nextTick()
  if (terminalContainer.value) {
    terminalContainer.value.scrollTop = terminalContainer.value.scrollHeight
  }
})
</script>

<style scoped>
.terminal-container {
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 0 0 4px 4px;
}

.terminal-line {
  margin-bottom: 2px;
  white-space: pre-wrap;
  word-break: break-word;
}

.terminal-timestamp {
  color: #858585;
  margin-right: 8px;
  font-size: 10px;
}

.terminal-message {
  color: #d4d4d4;
}

.terminal-stdout {
  color: #4ec9b0;
}

.terminal-stderr {
  color: #f48771;
}

.terminal-empty {
  color: #858585;
  text-align: center;
  padding: 40px;
  font-style: italic;
}

.terminal-container::-webkit-scrollbar {
  width: 8px;
}

.terminal-container::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.terminal-container::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.terminal-container::-webkit-scrollbar-thumb:hover {
  background: #666;
}

@media (max-width: 960px) {
  .terminal-container {
    max-height: 300px;
    font-size: 11px;
  }
}

@media (max-width: 600px) {
  .terminal-container {
    max-height: 250px;
    font-size: 10px;
    padding: 12px;
  }
}
</style>
