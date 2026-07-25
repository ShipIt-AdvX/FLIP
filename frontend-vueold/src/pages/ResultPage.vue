<template>
  <!--沟槽的ai怎么用了tailwind css，，，-->
  <div class="min-h-screen bg-cyber-smoke flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none opacity-40"
      :style="{
        backgroundImage: 'linear-gradient(rgba(0, 229, 200, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 200, 0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }"
    />
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
      :style="{
        background: result?.isAi
          ? 'radial-gradient(circle at center, rgba(248,81,73,0.04) 0%, transparent 70%)'
          : 'radial-gradient(circle at center, rgba(0,229,200,0.04) 0%, transparent 70%)',
      }"
    />
    <!-- Corner frame -->
    <div class="absolute inset-6 pointer-events-none">
      <div class="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2 border-cyber-teal/15" />
      <div class="absolute top-0 right-0 w-10 h-10 border-r-2 border-t-2 border-cyber-teal/15" />
      <div class="absolute bottom-0 left-0 w-10 h-10 border-l-2 border-b-2 border-cyber-teal/15" />
      <div class="absolute bottom-0 right-0 w-10 h-10 border-r-2 border-b-2 border-cyber-teal/15" />
    </div>

    <div class="relative z-10 w-full max-w-lg">
      <!-- Loading -->
      <div v-if="isLoading" class="flex flex-col items-center gap-4 py-12 animate-fade-in">
        <Gavel :size="32" class="text-cyber-teal animate-pulse" />
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-cyber-teal animate-typing-dot" style="animation-delay: 0ms" />
          <span class="w-1.5 h-1.5 rounded-full bg-cyber-teal animate-typing-dot" style="animation-delay: 150ms" />
          <span class="w-1.5 h-1.5 rounded-full bg-cyber-teal animate-typing-dot" style="animation-delay: 300ms" />
        </div>
        <p class="font-mono text-xs text-white/30 tracking-wider animate-scan">ANALYZING...</p>
        <p class="font-mono text-xs text-white/30 tracking-wider animate-scan">正在为你分析一份 言纹 报告...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-8 animate-fade-in">
        <div class="surface-card inline-flex items-center gap-3 px-5 py-3">
          <AlertTriangle :size="20" class="text-red-400" />
          <p class="text-red-400 text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- Result -->
      <div v-else-if="result" class="space-y-5 animate-slide-up">
        <div class="relative surface-card corner-marks p-6 text-center">
          <div class="flex justify-center mb-5">
            <div v-if="result.isAi" class="flex flex-col items-center gap-2 animate-reveal">
              <XCircle :size="48" class="text-red-400" style="filter: drop-shadow(0 0 8px rgba(248,81,73,0.3))" />
              <span class="font-display text-red-400 font-bold text-lg tracking-wider">AI DETECTED</span>
            </div>
            <div v-else class="flex flex-col items-center gap-2 animate-reveal">
              <CheckCircle2 :size="48" class="text-cyber-teal" style="filter: drop-shadow(0 0 8px rgba(0,229,200,0.3))" />
              <span class="font-display text-cyber-teal font-bold text-lg tracking-wider">HUMAN CONFIRMED</span>
            </div>
          </div>
          <div class="flex items-center justify-center gap-5">
            <Silhouette :size="55" color="rgba(0, 229, 200, 0.6)" ghost facing="right" />
            <div class="flex flex-col items-center">
              <Shield :size="20" class="text-white/20" />
              <span class="font-mono text-[9px] text-white/20 tracking-widest mt-0.5">VS</span>
            </div>
            <Silhouette :size="55" :color="result.isAi ? 'rgba(248,81,73,0.6)' : 'rgba(0,229,200,0.6)'" ghost facing="left" />
          </div>
        </div>

        <!-- Confidence -->
        <div class="surface-card p-4 space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-xs text-white/50 font-body">置信度</span>
            <span class="font-mono text-sm font-semibold" :style="{ color: progress > 70 ? (result.isAi ? '#f85149' : '#00e5c8') : '#ffb800' }">
              {{ progress }}%
            </span>
          </div>
          <div class="h-2 rounded-full bg-cyber-smoke overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500 ease-out"
              :style="{
                width: `${progress}%`,
                background: progress > 70
                  ? result.isAi ? 'linear-gradient(90deg, #f85149, #ff6d63)' : 'linear-gradient(90deg, #00e5c8, #00f5d8)'
                  : 'linear-gradient(90deg, #ffb800, #ffd34e)',
                boxShadow: progress > 70
                  ? result.isAi ? '0 0 8px rgba(248,81,73,0.4)' : '0 0 8px rgba(0,229,200,0.4)'
                  : '0 0 8px rgba(255,184,0,0.3)',
              }"
            />
          </div>
        </div>

        <!-- Reason -->
        <div class="surface-card p-5">
          <div class="flex items-center gap-2 mb-3">
            <Sparkles :size="14" class="text-cyber-amber" />
            <span class="font-mono text-[10px] text-cyber-amber/70 tracking-wider uppercase">Analysis</span>
          </div>
          <p class="text-white/50 text-sm leading-relaxed font-body">{{ result.reason }}</p>
        </div>
      </div>

      <!-- Restart -->
      <div class="mt-8 animate-slide-up-delay">
        <button @click="router.push('/')" class="btn-cyber w-full py-3 text-sm font-display tracking-wider">
          <span class="flex items-center justify-center gap-2">
            <RotateCcw :size="16" />
            <span>再来一局</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RotateCcw, Gavel, Sparkles, Shield, AlertTriangle, CheckCircle2, XCircle } from '@lucide/vue'
import Silhouette from '../components/Silhouette.vue'

interface JudgeResult {
  reason: string
  type: string
}

const route = useRoute()
const router = useRouter()

const result = ref<JudgeResult | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const progress = ref(0)
let progressTimer: ReturnType<typeof setInterval> | null = null

async function fetchResult() {
  try {
    const res = await fetch('/api/judge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: useGame }),
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error((errData as any).message || '获取判决结果失败')
    }
    const data = await res.json()
    const judgeData = data.data
    if (judgeData) {
      result.value = {
        confidence
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取判决结果失败'
  } finally {
    isLoading.value = false
  }
}

function startProgressAnimation() {
  if (!result.value) return
  setTimeout(() => {
    progressTimer = setInterval(() => {
      if (progress.value >= result.value!.confidence) {
        clearInterval(progressTimer!)
        progressTimer = null
        return
      }
      progress.value++
    }, 20)
  }, 600)
}

watch(result, (val) => {
  if (val) startProgressAnimation()
})

onMounted(() => {
  fetchResult()
})
</script>
