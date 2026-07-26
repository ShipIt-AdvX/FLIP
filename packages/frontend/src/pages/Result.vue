<template>
    <div class="result-container">
        <div class="result-card">
            <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>正在生成你的图灵测试报告</p>
            </div>

            <div v-else class="result-content">
                <div class="result-label">图灵测试结果</div>

                <div class="score-display">
                    <div class="score-number">{{ humanScore }}</div>
                    <div class="score-unit">/ 100</div>
                </div>
                <div class="score-title">{{ scoreTitle }}</div>

                <div class="stats-row">
                    <div class="stat-item">
                        <div class="stat-value">{{ totalRounds }}</div>
                        <div class="stat-label">总轮数</div>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <div class="stat-value">{{ exposedCount }}</div>
                        <div class="stat-label">被识破</div>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <div class="stat-value">{{ totalRounds - exposedCount }}</div>
                        <div class="stat-label">安全过关</div>
                    </div>
                </div>

                <div class="summary-card">
                    <div class="summary-label">AI 裁判评语</div>
                    <p class="summary-text">{{ summary }}</p>
                </div>

                <div class="result-actions">
                    <button class="action-btn primary" @click="goToProfile">
                        完善资料，遇见同类
                    </button>
                    <button class="action-btn secondary" @click="goToCircle">
                        逛逛交友圈
                    </button>
                    <button class="action-btn outline" @click="replay">
                        再玩一次
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { humanScoreText } from '@/flip-defines';

const router = useRouter();
const loading = ref(true);
const humanScore = ref(0);
const totalRounds = ref(0);
const exposedCount = ref(0);
const summary = ref('');

const scoreTitle = computed(() => humanScoreText(humanScore.value));

async function loadSummary() {
    const gameData = localStorage.getItem('gameHistory');
    if (!gameData) {
        router.push('/');
        return;
    }
    const data = JSON.parse(gameData);
    totalRounds.value = data.totalRounds;
    exposedCount.value = data.exposedCount;

    try {
        const resp = await fetch('/api/game/summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                totalRounds: data.totalRounds,
                exposedCount: data.exposedCount
            })
        });
        const result = await resp.json();
        if (result.code === 200) {
            humanScore.value = result.data.humanScore;
            summary.value = result.data.summary;
        } else {
            humanScore.value = Math.round((data.totalRounds - data.exposedCount) / data.totalRounds * 100);
            summary.value = '测试结束。';
        }
    } catch (e) {
        humanScore.value = Math.round((data.totalRounds - data.exposedCount) / data.totalRounds * 100);
        summary.value = '测试结束。';
    }

    // 保存到 localStorage 供 Profile 页使用
    localStorage.setItem('gameResult', JSON.stringify({
        humanScore: humanScore.value,
        totalRounds: totalRounds.value,
        exposedCount: exposedCount.value,
        summary: summary.value
    }));

    loading.value = false;
}

function goToProfile() { router.push('/profile'); }
function goToCircle() { router.push('/circle'); }
function replay() {
    localStorage.removeItem('gameHistory');
    localStorage.removeItem('gameResult');
    router.push('/');
}

onMounted(() => { loadSummary(); });
</script>

<style scoped>
.result-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 64px);
    padding: 30px 20px;
    box-sizing: border-box;
}

.result-card {
    width: 100%;
    max-width: 480px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border-radius: 20px;
    padding: 48px 40px;
    box-shadow: 
        0 1px 3px rgba(0, 0, 0, 0.04),
        0 8px 32px rgba(0, 0, 0, 0.06),
        0 0 0 1px rgba(0, 0, 0, 0.03) inset;
    animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.loading-state { text-align: center; padding: 60px 20px; color: #999; }
.spinner {
    width: 36px; height: 36px;
    border: 2px solid #f0f0f0;
    border-top-color: #333;
    border-radius: 50%;
    margin: 0 auto 14px;
    animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state p { margin: 0; font-size: 14px; font-weight: 300; }

.result-content { text-align: center; animation: fadeIn 0.6s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.result-label {
    font-size: 12px;
    color: #999;
    letter-spacing: 2px;
    margin-bottom: 20px;
    font-weight: 300;
    text-transform: uppercase;
}

.score-display {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 6px;
    margin-bottom: 6px;
}
.score-number { font-size: 72px; font-weight: 200; color: #1a1a1a; line-height: 1; }
.score-unit { font-size: 18px; color: #aaa; font-weight: 300; }

.score-title {
    font-size: 18px;
    font-weight: 400;
    color: #555;
    margin-bottom: 32px;
    letter-spacing: 1px;
}

.stats-row {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 0;
    margin-bottom: 24px;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
}
.stat-item { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.stat-value { font-size: 24px; font-weight: 300; color: #1a1a1a; }
.stat-label { font-size: 12px; color: #aaa; font-weight: 300; }
.stat-divider { width: 1px; height: 32px; background: #eee; }

.summary-card {
    background: #fafafa;
    border-radius: 12px;
    padding: 18px 22px;
    margin-bottom: 28px;
    text-align: left;
    border: 1px solid #f5f5f5;
}
.summary-label { font-size: 12px; color: #999; margin-bottom: 10px; letter-spacing: 1px; }
.summary-text { margin: 0; color: #555; line-height: 1.7; font-size: 14px; font-weight: 300; }

.result-actions { display: flex; flex-direction: column; gap: 10px; }
.action-btn {
    padding: 14px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    letter-spacing: 0.5px;
}
.action-btn.primary { background: #1a1a1a; color: white; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
.action-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); background: #000; }
.action-btn.secondary { background: #fafafa; color: #333; border: 1px solid #eee; }
.action-btn.secondary:hover { transform: translateY(-1px); background: #f5f5f5; }
.action-btn.outline { background: transparent; color: #888; border: 1px solid #eee; }
.action-btn.outline:hover { transform: translateY(-1px); border-color: #ddd; color: #666; }

@media (max-width: 600px) {
    .result-card { padding: 36px 24px; border-radius: 16px; }
    .score-number { font-size: 56px; }
}
</style>
