<template>
  <svg
    :width="size"
    :height="size * 1.5"
    viewBox="0 0 100 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="[animated ? 'animate-float' : '', className]"
    :style="{ transform: `scaleX(${facing === 'left' ? -1 : 1})`, filter: ghost ? `drop-shadow(0 0 ${size * 0.15}px ${color})` : undefined }"
  >
    <defs>
      <linearGradient :id="`body-grad-${uid}`" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" :stopColor="color" :stopOpacity="ghost ? 0.5 : 0.9" />
        <stop offset="100%" :stopColor="color" :stopOpacity="ghost ? 0.15 : 0.5" />
      </linearGradient>
      <filter :id="`sil-glow-${uid}`">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <g :filter="ghost ? `url(#sil-glow-${uid})` : undefined">
      <!-- Head -->
      <circle cx="50" cy="22" r="16" :fill="ghost ? 'none' : `url(#body-grad-${uid})`"
        :stroke="color"
        :strokeWidth="ghost ? 1.5 : 0"
        :opacity="ghost ? 0.6 : 1"
      />
      <!-- Neck -->
      <rect x="43" y="37" width="14" height="8" rx="4"
        :fill="color"
        :opacity="ghost ? 0.3 : 0.6"
      />
      <!-- Torso -->
      <path
        d="M28 45 L 38 43 Q 50 41 62 43 L 72 45 L 70 90 L 58 92 L 55 60 L 45 60 L 42 92 L 30 90 Z"
        :fill="ghost ? 'none' : `url(#body-grad-${uid})`"
        :stroke="color"
        :strokeWidth="ghost ? 1.2 : 0"
        :opacity="ghost ? 0.4 : 1"
      />
      <!-- Shoulder accents -->
      <line x1="28" y1="45" x2="18" y2="52" :stroke="color" strokeWidth="1.5" opacity="0.4" stroke-linecap="round" />
      <line x1="72" y1="45" x2="82" y2="52" :stroke="color" strokeWidth="1.5" opacity="0.4" stroke-linecap="round" />
      <!-- Question mark (ghost mode) -->
      <text v-if="ghost"
        x="50" y="75"
        text-anchor="middle"
        :fill="color"
        font-size="20"
        font-family="'Chakra Petch', sans-serif"
        font-weight="600"
        opacity="0.5"
      >?</text>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: number
  color?: string
  animated?: boolean
  facing?: 'left' | 'right'
  className?: string
  ghost?: boolean
}>(), {
  size: 120,
  color: 'rgba(0, 229, 200, 0.7)',
  animated: false,
  facing: 'right',
  className: '',
  ghost: false,
})

// unique ID per instance for SVG filter/gradient isolation
const uid = computed(() => Math.random().toString(36).slice(2, 8))
</script>
