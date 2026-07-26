<template>
    <div class="game-container">
        <div class="game-card">
            <!-- 顶部：轮次指示 -->
            <div class="game-header">
                <div class="round-info">
                    <span class="round-label">第 {{ round }} 轮</span>
                    <span class="round-hint" v-if="round < 3">至少完成 3 轮</span>
                    <span class="round-hint" v-else>可随时结束</span>
                </div>
                <div class="exposed-info">
                    <span class="exposed-label">被识破</span>
                    <span class="exposed-count">{{ exposedCount }} / {{ round - 1 }}</span>
                </div>
            </div>

            <!-- 加载中 -->
            <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>{{ loadingText }}</p>
            </div>

            <!-- 游戏主区域 -->
            <template v-else>
                <!-- 阶段1: 显示问题，等待用户作答 -->
                <div v-if="phase === 'answering'" class="answering-phase">
                    <div class="question-card">
                        <div class="question-label">AI 的问题</div>
                        <div class="question-text">{{ question }}</div>
                    </div>
                    <div class="answer-section">
                        <label class="answer-label">你的回答</label>
                        <textarea
                            class="answer-input"
                            v-model="userAnswer"
                            placeholder="像和朋友聊天一样自然地回答（100字以内）"
                            rows="4"
                            maxlength="100"
                            :disabled="submitting"
                        ></textarea>
                        <div class="answer-count" :class="{ over: userAnswer.length >= 100 }">
                            {{ userAnswer.length }} / 100
                        </div>
                        <button
                            class="submit-btn"
                            :class="{ active: userAnswer.trim().length > 0 }"
                            :disabled="!userAnswer.trim() || submitting"
                            @click="submitAnswer"
                        >
                            <span v-if="!submitting">提交回答</span>
                            <span v-else>裁判判断中...</span>
                        </button>
                    </div>
                </div>

                <!-- 阶段2: 显示判断结果 -->
                <div v-if="phase === 'result'" class="result-phase">
                    <div class="question-recap">
                        <div class="recap-label">问题</div>
                        <div class="recap-text">{{ question }}</div>
                    </div>

                    <div class="answers-compare">
                        <div class="compare-label">两个匿名回答</div>
                        <div class="answer-cards">
                            <div
                                v-for="item in shuffled"
                                :key="item.label"
                                class="answer-card"
                                :class="{
                                    'is-ai': revealed && item.isBot,
                                    'is-user': revealed && !item.isBot,
                                    'judge-pick': revealed && item.label === judgeResult.aiChoice
                                }"
                            >
                                <div class="card-label">{{ item.label }}</div>
                                <div class="card-text">{{ item.text }}</div>
                                <div v-if="revealed" class="card-tag">
                                    <span v-if="item.isBot">AI 写的</span>
                                    <span v-else>你写的</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="judge-card">
                        <div class="judge-label">裁判的判断</div>
                        <div class="judge-choice">
                            裁判认为 <strong>{{ judgeResult.aiChoice }}</strong> 是 AI 写的
                        </div>
                        <div class="judge-reason">{{ judgeResult.reason }}</div>
                        <div class="judge-verdict" :class="{ exposed: judgeResult.isUserExposed, safe: !judgeResult.isUserExposed }">
                            <span v-if="judgeResult.isUserExposed">你被识破了</span>
                            <span v-else>你安全过关</span>
                        </div>
                    </div>

                    <div class="next-actions">
                        <button class="next-btn primary" @click="nextRound" :disabled="loading">
                            下一题
                        </button>
                        <button
                            v-if="round >= 3"
                            class="next-btn outline"
                            @click="endGame"
                            :disabled="loading"
                        >
                            结束游戏
                        </button>
                    </div>
                </div>
            </template>

            <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const round = ref(1);
const phase = ref<'answering' | 'result'>('answering');
const loading = ref(false);
const submitting = ref(false);
const revealed = ref(false);
const exposedCount = ref(0);
const errorMsg = ref('');
const loadingText = ref('正在生成问题');

const question = ref('');
const userAnswer = ref('');
const shuffled = ref<Array<{ label: string; text: string; isBot: boolean }>>([]);
const judgeResult = ref<{ aiChoice: string; isUserExposed: boolean; reason: string }>({
    aiChoice: '',
    isUserExposed: false,
    reason: ''
});

const history = ref<Array<{
    round: number;
    question: string;
    userAnswer: string;
    botAnswer: string;
    isUserExposed: boolean;
}>>([]);

async function loadQuestion() {
    loading.value = true;
    loadingText.value = '正在生成问题';
    errorMsg.value = '';
    try {
        const resp = await fetch('/api/game/question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ round: round.value })
        });
        const data = await resp.json();
        if (data.code === 200) {
            question.value = data.data.question;
            phase.value = 'answering';
        } else {
            errorMsg.value = data.error || '生成问题失败';
        }
    } catch (e) {
        errorMsg.value = '网络错误，请稍后重试';
    }
    loading.value = false;
}

async function submitAnswer() {
    if (!userAnswer.value.trim()) return;
    submitting.value = true;
    errorMsg.value = '';
    try {
        const resp = await fetch('/api/game/judge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: question.value,
                userAnswer: userAnswer.value,
                round: round.value
            })
        });
        const data = await resp.json();
        if (data.code === 200) {
            shuffled.value = data.data.shuffled;
            judgeResult.value = data.data.judgeResult;
            if (judgeResult.value.isUserExposed) {
                exposedCount.value++;
            }
            // 记录历史
            history.value.push({
                round: round.value,
                question: question.value,
                userAnswer: userAnswer.value,
                botAnswer: data.data.botAnswer,
                isUserExposed: judgeResult.value.isUserExposed
            });
            phase.value = 'result';
            // 延迟揭晓
            setTimeout(() => { revealed.value = true; }, 1500);
        } else {
            errorMsg.value = data.error || '判断失败';
        }
    } catch (e) {
        errorMsg.value = '网络错误，请稍后重试';
    }
    submitting.value = false;
}

function nextRound() {
    round.value++;
    phase.value = 'answering';
    revealed.value = false;
    userAnswer.value = '';
    question.value = '';
    shuffled.value = [];
    judgeResult.value = { aiChoice: '', isUserExposed: false, reason: '' };
    loadQuestion();
}

function endGame() {
    localStorage.setItem('gameHistory', JSON.stringify({
        rounds: history.value,
        totalRounds: round.value,
        exposedCount: exposedCount.value
    }));
    router.push('/result');
}

onMounted(() => {
    loadQuestion();
});
</script>

<style scoped>
.game-container {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    min-height: calc(100vh - 64px);
    padding: 30px 20px;
    box-sizing: border-box;
}

.game-card {
    width: 100%;
    max-width: 640px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border-radius: 20px;
    padding: 28px;
    box-shadow: 
        0 1px 3px rgba(0, 0, 0, 0.04),
        0 8px 32px rgba(0, 0, 0, 0.06),
        0 0 0 1px rgba(0, 0, 0, 0.03) inset;
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}

.game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 24px;
}

.round-info { display: flex; flex-direction: column; gap: 2px; }
.round-label { font-size: 16px; font-weight: 500; color: #1a1a1a; }
.round-hint { font-size: 12px; color: #aaa; font-weight: 300; }

.exposed-info { display: flex; flex-direction: column; gap: 2px; align-items: flex-end; }
.exposed-label { font-size: 12px; color: #aaa; font-weight: 300; }
.exposed-count { font-size: 16px; font-weight: 500; color: #555; }

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

/* 答题阶段 */
.question-card {
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
}
.question-label { font-size: 12px; color: #999; margin-bottom: 8px; letter-spacing: 1px; }
.question-text { font-size: 17px; color: #1a1a1a; line-height: 1.6; font-weight: 400; }

.answer-section { display: flex; flex-direction: column; gap: 12px; }
.answer-label { font-size: 13px; color: #555; font-weight: 500; }
.answer-input {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    transition: all 0.25s ease;
    box-sizing: border-box;
    background: #fafafa;
    font-family: inherit;
    resize: vertical;
    color: #1a1a1a;
    font-weight: 300;
    line-height: 1.6;
}
.answer-input:focus {
    border-color: #1a1a1a;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
}
.answer-input::placeholder { color: #ccc; }

.answer-count {
    align-self: flex-end;
    font-size: 12px;
    color: #aaa;
    font-weight: 300;
    margin-top: -4px;
    transition: color 0.2s ease;
}
.answer-count.over { color: #888; font-weight: 400; }

.submit-btn {
    align-self: flex-end;
    padding: 12px 28px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
    background: #e5e5e5;
    color: #999;
}
.submit-btn.active { background: #1a1a1a; color: white; }
.submit-btn.active:hover { transform: translateY(-1px); background: #000; }

/* 结果阶段 */
.question-recap {
    padding: 14px 18px;
    background: #fafafa;
    border-radius: 10px;
    margin-bottom: 20px;
    border: 1px solid #f5f5f5;
}
.recap-label { font-size: 11px; color: #aaa; margin-bottom: 4px; }
.recap-text { font-size: 14px; color: #555; line-height: 1.6; font-weight: 300; }

.compare-label { font-size: 13px; color: #555; font-weight: 500; margin-bottom: 12px; }

.answers-compare { margin-bottom: 20px; }
.answer-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.answer-card {
    padding: 16px;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 10px;
    transition: all 0.3s ease;
}
.answer-card.is-ai { border-color: #ddd; background: #f5f5f5; }
.answer-card.is-user { border-color: #1a1a1a; }
.answer-card.judge-pick { box-shadow: 0 0 0 2px #1a1a1a inset; }

.card-label { font-size: 11px; color: #999; margin-bottom: 8px; letter-spacing: 1px; }
.card-text { font-size: 13px; color: #333; line-height: 1.6; font-weight: 300; min-height: 60px; }
.card-tag {
    margin-top: 10px;
    font-size: 11px;
    color: #666;
    padding-top: 8px;
    border-top: 1px solid #eee;
}

.judge-card {
    padding: 18px 20px;
    background: #fafafa;
    border-radius: 12px;
    margin-bottom: 20px;
    border: 1px solid #f0f0f0;
}
.judge-label { font-size: 12px; color: #999; margin-bottom: 10px; letter-spacing: 1px; }
.judge-choice { font-size: 14px; color: #333; margin-bottom: 10px; }
.judge-choice strong { color: #1a1a1a; font-weight: 600; }
.judge-reason { font-size: 13px; color: #666; line-height: 1.7; margin-bottom: 14px; font-weight: 300; }
.judge-verdict {
    text-align: center;
    padding: 10px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
}
.judge-verdict.exposed { color: #666; background: #f0f0f0; }
.judge-verdict.safe { color: #1a1a1a; background: #e8e8e8; }

.next-actions { display: flex; gap: 10px; justify-content: center; }
.next-btn {
    flex: 1;
    padding: 13px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
    letter-spacing: 0.5px;
}
.next-btn.primary { background: #1a1a1a; color: white; }
.next-btn.primary:hover { transform: translateY(-1px); background: #000; }
.next-btn.outline { background: transparent; color: #666; border: 1px solid #ddd; }
.next-btn.outline:hover { color: #333; border-color: #bbb; }
.next-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.error-msg {
    margin-top: 16px;
    text-align: center;
    padding: 10px;
    border-radius: 8px;
    font-size: 13px;
    color: #666;
    background: #f5f5f5;
}

@media (max-width: 600px) {
    .game-card { padding: 20px; border-radius: 16px; }
    .answer-cards { grid-template-columns: 1fr; }
}
</style>
