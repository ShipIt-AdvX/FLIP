<template>
  <div class="flex items-center gap-3">
    <!-- Mini progress ring -->
    <div class="relative w-9 h-9">
      <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(42, 52, 68, 0.6)" stroke-width="2.5" />
        <circle
          cx="18" cy="18" r="15"
          fill="none"
          :stroke="isDanger ? '#f85149' : isWarning ? '#ffb800' : '#00e5c8'"
          stroke-width="2.5"
          stroke-linecap="round"
          :stroke-dasharray="`${progress} 100`"
          class="transition-all duration-1000 ease-linear"
          :style="isDanger ? { filter: 'drop-shadow(0 0 4px rgba(248,81,73,0.5))' } : undefined"
        />
      </svg>
    </div>

    <!-- Time digits -->
    <div
      class="font-mono text-xl font-semibold tracking-widest transition-all duration-300"
      :class="tick ? 'animate-counter-tick' : ''"
      :style="{
        color: isDanger ? '#f85149' : isWarning ? '#ffb800' : '#00e5c8',
        textShadow: isDanger
          ? '0 0 8px rgba(248,81,73,0.5)'
          : isWarning
            ? '0 0 8px rgba(255,184,0,0.4)'
            : '0 0 8px rgba(0,229,200,0.3)',
      }"
    >
      {{ formatTime(remaining) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps<{
  totalSeconds: number
}>()

const emit = defineEmits<{
  (e: 'end'): void
}>()

const remaining = ref(props.totalSeconds)
const tick = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const isWarning = computed(() => remaining.value <= 30)
const isDanger = computed(() => remaining.value <= 10)
const progress = computed(() => (remaining.value / props.totalSeconds) * 100)

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function startTimer() {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    remaining.value--
    tick.value = true
    setTimeout(() => { tick.value = false }, 150)
    if (remaining.value <= 0) {
      clearInterval(timer!)
      timer = null
      emit('end')
    }
  }, 1000)
}

watch(() => props.totalSeconds, (val) => {
  remaining.value = val
  startTimer()
}, { immediate: true })

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
