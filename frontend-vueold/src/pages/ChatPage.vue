<template>
  <div class="flex flex-col h-screen bg-cyber-smoke">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 md:px-6 py-3 border-b border-cyber-smoke-border bg-cyber-smoke/90 backdrop-blur-md z-20">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div class="w-9 h-9 rounded-lg bg-cyber-smoke-card cyber-border flex items-center justify-center">
            <Silhouette :size="28" color="rgba(0, 229, 200, 0.7)" ghost facing="left" />
          </div>
          <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyber-teal border-2 border-cyber-smoke"
            style="box-shadow: 0 0 6px rgba(0, 229, 200, 0.6)"
          />
        </div>
        <div>
          <h2 class="text-white font-semibold text-sm font-body">你的好友</h2>
          <p class="text-cyber-teal/50 text-[10px] font-mono tracking-wider uppercase" v-if="isLoading">对方正在输入... / Typing...</p>
          <p class="text-cyber-teal/50 text-[10px] font-mono tracking-wider uppercase" v-else>在线 / Online</p>
        </div>
      </div>
      <Countdown :total-seconds="180" @end="onTimeEnd" />
    </header>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
      <div class="flex justify-center animate-fade-in">
        <div class="flex items-center gap-2 bg-cyber-smoke-card/60 cyber-border rounded-lg px-4 py-2">
          <div class="w-1.5 h-1.5 rounded-full bg-cyber-teal" />
          <span class="text-xs text-white/40 font-body">游戏开始 — 你有 3 分钟时间与对方交流</span>
        </div>
      </div>

      <div v-for="msg in messages" :key="msg.id"
        class="flex animate-slide-up"
        :class="msg.sender === 'player' ? 'justify-end' : 'justify-start'"
      >
        <div class="flex gap-2.5 max-w-[80%] md:max-w-[60%]"
          :class="msg.sender === 'player' ? 'flex-row-reverse' : 'flex-row'"
        >
          <div class="flex-shrink-0 mt-1">
            <div v-if="msg.sender === 'player'"
              class="w-8 h-8 rounded-lg bg-cyber-teal/10 cyber-border-accent flex items-center justify-center"
            >
              <User :size="14" class="text-cyber-teal" />
            </div>
            <div v-else
              class="w-8 h-8 rounded-lg bg-cyber-smoke-card cyber-border flex items-center justify-center"
            >
              <Bot :size="14" class="text-white/40" />
            </div>
          </div>
          <div class="flex flex-col">
            <div class="px-4 py-2.5 text-sm leading-relaxed font-body"
              :class="msg.sender === 'player' ? 'bubble-player' : 'bubble-ai'"
            >
              <span :class="msg.sender === 'player' ? 'text-white/90' : 'text-white/70'">{{ msg.content }}</span>
            </div>
            <span class="text-[10px] text-white/20 mt-1 font-mono"
              :class="msg.sender === 'player' ? 'text-right' : 'text-left'"
            >{{ formatTime(msg.timestamp) }}</span>
          </div>
        </div>
      </div>

      <div v-if="error" class="flex justify-center animate-fade-in">
        <div class="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle :size="14" />
          <span>{{ error }}</span>
        </div>
      </div>
      <div ref="messagesEnd" />
    </div>

    <!-- Input -->
    <div class="px-4 md:px-6 py-3 border-t border-cyber-smoke-border bg-cyber-smoke/90 backdrop-blur-md">
      <div class="flex items-end gap-2.5 max-w-3xl mx-auto">
        <textarea
          ref="inputRef"
          v-model="input"
          @keydown="handleKeyDown"
          placeholder="输入消息..."
          rows="1"
          class="input-cyber flex-1 font-body text-sm resize-none max-h-32"
          style="min-height: 40px"
        />
        <button
          @click="handleSend"
          :disabled="!input.trim() || isLoading"
          class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
          :class="input.trim()
            ? 'bg-cyber-teal/15 cyber-border-accent cyber-glow'
            : 'bg-cyber-smoke-card cyber-border'"
        >
          <Send :size="16" :class="input.trim() ? 'text-cyber-teal' : 'text-white/25'" />
        </button>
      </div>
      <p class="text-center text-white/15 text-[10px] mt-2 font-mono tracking-wider">
        ENTER to send / SHIFT+ENTER for newline
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Send, User, Bot, AlertCircle } from '@lucide/vue'
import Countdown from '../components/Countdown.vue'
import Silhouette from '../components/Silhouette.vue'
import { useGame } from '../composables/useGame'

const route = useRoute()
const router = useRouter()
const gameId = computed(() => route.params.gameId as string)
const playerName = sessionStorage.getItem('playerName') || '玩家'

const input = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)
const messagesEnd = ref<HTMLDivElement | null>(null)
const messagesContainer = ref<HTMLDivElement | null>(null)

const { messages, isLoading, error, sendMessage } = useGame({ gameId, playerName })

function scrollToBottom() {
  nextTick(() => {
    messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

watch(messages, () => scrollToBottom(), { deep: true })
onMounted(scrollToBottom)

async function handleSend() {
  if (!input.value.trim() || isLoading.value) return
  const content = input.value.trim()
  input.value = ''
  await sendMessage(content)
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function onTimeEnd() {
  router.push(`/result`)
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>
