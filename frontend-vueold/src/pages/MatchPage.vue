<template>
  <div class="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-cyber-smoke px-4">
    <!-- Background grid pattern -->
    <div class="absolute inset-0 pointer-events-none opacity-60"
      :style="{
        backgroundImage: 'linear-gradient(rgba(0, 229, 200, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 200, 0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }"
    />
    <!-- Radial glow -->
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
      :style="{ background: 'radial-gradient(circle at center, rgba(0, 229, 200, 0.04) 0%, transparent 70%)' }"
    />
    <!-- Corner frame -->
    <div class="absolute inset-6 pointer-events-none">
      <div class="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyber-teal/20" />
      <div class="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyber-teal/20" />
      <div class="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyber-teal/20" />
      <div class="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyber-teal/20" />
    </div>

    <div class="relative z-10 flex flex-col items-center max-w-md w-full">
      <!-- Hero silhouettes -->
      <div class="flex items-end justify-center gap-6 md:gap-10 mb-8 animate-fade-in">
        <div class="opacity-30">
          <Silhouette :size="90" color="rgba(0, 229, 200, 0.5)" ghost animated facing="right" />
        </div>
        <div class="flex flex-col items-center gap-2 -mt-4">
          <div class="w-16 h-16 rounded-lg bg-cyber-smoke-card cyber-border-accent flex items-center justify-center rotate-45">
            <span class="font-display text-cyber-teal font-bold text-xl -rotate-45 tracking-widest">VS</span>
          </div>
          <div class="w-20 h-px bg-gradient-to-r from-transparent via-cyber-teal/30 to-transparent" />
        </div>
        <div class="opacity-30">
          <Silhouette :size="90" color="rgba(0, 229, 200, 0.5)" ghost animated facing="left" />
        </div>
      </div>

      <!-- Title -->
      <div class="text-center mb-10 animate-slide-up">
        <h1 class="font-display text-4xl md:text-5xl font-bold tracking-wider text-white mb-2">
          <span class="text-cyber-teal">HUMAN</span>
          <span class="text-white/30 mx-2">or</span>
          <span class="text-cyber-amber">NOT</span>
          <span class="text-white/30">?</span>
        </h1>
        <p class="text-sm text-white/40 font-body tracking-wide">与未知对手对话，判断对方是人类还是 AI</p>
      </div>

      <!-- Input card -->
      <div class="w-full animate-slide-up-delay">
        <div class="relative surface-card corner-marks p-6">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-2 h-2 rounded-full bg-cyber-teal animate-glow-pulse" />
            <span class="font-mono text-xs text-cyber-teal/70 tracking-wider uppercase">Identity</span>
          </div>
          <input
            v-model="playerName"
            @keydown.enter="!isMatching && handleStart()"
            type="text"
            placeholder="输入你的昵称..."
            :disabled="isMatching"
            maxlength="20"
            class="input-cyber w-full font-body text-sm disabled:opacity-40"
          />
          <div v-if="playerName.length > 0" class="flex justify-end mt-2">
            <span class="font-mono text-[10px] text-white/20">{{ playerName.length }}/20</span>
          </div>
          <div v-if="error" class="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <span class="w-1.5 h-1.5 rounded-full bg-red-400" />
            {{ error }}
          </div>
          <button
            @click="handleStart"
            :disabled="isMatching"
            class="btn-cyber w-full mt-4 py-3 text-sm font-display tracking-wider"
          >
            <span class="flex items-center justify-center gap-2">
              <Loader2 v-if="isMatching" :size="16" class="animate-spin" />
              <Zap v-else :size="16" />
              {{ isMatching ? '连接中...' : '开始匹配' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Matching animation -->
      <div v-if="isMatching" class="mt-8 flex flex-col items-center gap-4 animate-fade-in">
        <div class="flex items-center gap-5">
          <Silhouette :size="45" color="rgba(0, 229, 200, 0.6)" animated facing="right" />
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-cyber-teal animate-typing-dot" style="animation-delay: 0ms" />
            <span class="w-1.5 h-1.5 rounded-full bg-cyber-teal animate-typing-dot" style="animation-delay: 150ms" />
            <span class="w-1.5 h-1.5 rounded-full bg-cyber-teal animate-typing-dot" style="animation-delay: 300ms" />
          </div>
          <Silhouette :size="45" color="rgba(0, 229, 200, 0.6)" animated facing="left" />
        </div>
        <p class="font-mono text-xs text-white/30 animate-scan tracking-wider">SEARCHING...</p>
      </div>
    </div>

    <div class="absolute bottom-8 text-center">
      <p class="font-mono text-[10px] text-white/15 tracking-wider uppercase">3 min chat / AI judge / social deduction</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Loader2, Zap } from '@lucide/vue'
import Silhouette from '../components/Silhouette.vue'

const router = useRouter()
const playerName = ref('')
const isMatching = ref(false)
const error = ref<string | null>(null)

const handleStart = async () => {
  if (!playerName.value.trim()) {
    error.value = '请输入玩家昵称'
    return
  }
  isMatching.value = true
  error.value = null
  try {
    sessionStorage.setItem('playerName', playerName.value.trim())
    router.push(`/chat`)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '匹配失败，请重试'
    isMatching.value = false
  }
}
</script>
