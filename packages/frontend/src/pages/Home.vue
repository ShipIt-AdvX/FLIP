<template>
    <div class="home-container">
        <div class="hero-card">
            <div class="hero-icon">◐</div>
            <h1 class="hero-title">你是人类吗？</h1>
            <p class="hero-subtitle">一场识破与被识破的图灵测试</p>
            <p class="hero-desc">AI 出题，你和另一个 AI 各自回答。裁判 AI 判断谁才是真正的人类。</p>
            
            <div class="feature-tags">
                <span class="tag">三轮起测</span>
                <span class="tag">匿名审判</span>
                <span class="tag">遇见同类</span>
            </div>

            <div class="input-section">
                <input type="text" class="username-input" placeholder="你的昵称" v-model="username" @keyup.enter="verified && handleStart()" />
            </div>

            <div class="captcha-wrapper">
                <VueHcaptcha sitekey="7f143322-c5be-437e-8ea4-8f1c71c27916" @verify="doCaptcha" />
            </div>

            <button class="start-btn" :class="{ active: verified && username.trim() }" :disabled="!verified || !username.trim()" @click="handleStart">
                <span>开始测试</span>
                <span class="btn-arrow">→</span>
            </button>

            <button class="circle-entry" @click="goToCircle">
                <span>逛逛交友圈</span>
                <span class="entry-arrow">→</span>
            </button>

            <button class="mbti-entry" @click="goToMbti">
                <span>说话方式 MBTI</span>
                <span class="entry-arrow">→</span>
            </button>

            <div class="flow-guide">
                <div class="flow-step">
                    <div class="flow-num">1</div>
                    <div class="flow-desc">通过人机验证</div>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">
                    <div class="flow-num">2</div>
                    <div class="flow-desc">回答 AI 问题</div>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">
                    <div class="flow-num">3</div>
                    <div class="flow-desc">裁判匿名判断</div>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">
                    <div class="flow-num">4</div>
                    <div class="flow-desc">生成人类度报告</div>
                </div>
            </div>
        </div>

        <!-- 游戏流程说明 -->
        <div class="flow-section">
            <div class="flow-header">
                <h3>游戏流程</h3>
                <span class="flow-hint">三步完成图灵测试</span>
            </div>
            <div class="flow-steps">
                <div class="flow-step">
                    <div class="step-num">1</div>
                    <div class="step-line"></div>
                    <div class="step-content">
                        <div class="step-title">人机验证</div>
                        <div class="step-desc">通过验证，证明你不是机器人</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="step-num">2</div>
                    <div class="step-line"></div>
                    <div class="step-content">
                        <div class="step-title">回答问题</div>
                        <div class="step-desc">AI 出题，你和伪装 AI 同时回答</div>
                    </div>
                </div>
                <div class="flow-step last">
                    <div class="step-num">3</div>
                    <div class="step-content">
                        <div class="step-title">揭晓结果</div>
                        <div class="step-desc">裁判 AI 判断谁才是人类</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 数据展示 -->
        <div class="stats-section">
            <div class="stat-card">
                <div class="stat-num">{{ totalUsers }}</div>
                <div class="stat-label">测试用户</div>
            </div>
            <div class="stat-card">
                <div class="stat-num">{{ totalPosts }}</div>
                <div class="stat-label">交友圈帖子</div>
            </div>
            <div class="stat-card">
                <div class="stat-num">{{ avgScore }}%</div>
                <div class="stat-label">平均人类度</div>
            </div>
        </div>

        <!-- 底部工作室信息 -->
        <div class="footer-section">
            <div class="studio-card">
                <div class="studio-logo-wrap">
                    <div class="studio-logo">S</div>
                </div>
                <div class="studio-info">
                    <div class="studio-name">SHIPIT Studio</div>
                    <div class="studio-desc">打造有趣的数字体验</div>
                </div>
                <a href="https://shipit.rrvenn.cn" target="_blank" class="studio-link">
                    <span>工作室官网</span>
                    <span class="studio-arrow">→</span>
                </a>
            </div>
            <div class="footer-links">
                <span class="footer-text">© 2026 SHIPIT Studio</span>
                <span class="footer-dot">·</span>
                <a href="/admin" class="footer-link">管理控制台</a>
            </div>
        </div>

        <div class="deco-lines">
            <div class="line line-1"></div>
            <div class="line line-2"></div>
            <div class="line line-3"></div>
            <div class="line line-4"></div>
            <div class="line line-5"></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const username = ref("");
const verified = ref(false);
const totalUsers = ref(0);
const totalPosts = ref(0);
const avgScore = ref(0);

async function fetchStats() {
    try {
        const res = await axios.get('/api/game/stats');
        if (res.data && res.data.data) {
            totalUsers.value = res.data.data.totalProfiles || 0;
            totalPosts.value = res.data.data.totalPosts || 0;
            avgScore.value = res.data.data.avgHumanScore || 0;
        }
    } catch {}
}

onMounted(() => {
    fetchStats();
});

function doCaptcha(token: string, ekey: string) { verified.value = true; }
function handleStart() {
    if (!verified.value || !username.value.trim()) return;
    localStorage.setItem("history", "[]");
    localStorage.setItem("username", username.value);
    router.push("/chat");
}
function goToCircle() { router.push("/circle"); }
function goToMbti() { router.push("/mbti"); }
</script>

<style scoped>
.home-container { display: flex; flex-direction: column; align-items: center; min-height: calc(100vh - 64px); padding: 40px 20px 60px; position: relative; }

.hero-card {
    background: rgba(255,255,255,0.85); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
    border-radius: 24px; padding: 56px 48px; max-width: 460px; width: 100%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03) inset;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    animation: slideUp 0.8s cubic-bezier(0.16,1,0.3,1); position: relative; z-index: 10;
    margin-bottom: 48px;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.hero-icon { font-size: 48px; font-weight: 300; color: #1a1a1a; margin-bottom: 24px; letter-spacing: -2px; animation: float 4s ease-in-out infinite; opacity: 0.8; }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.hero-title { font-size: 32px; font-weight: 300; margin: 0 0 12px 0; color: #1a1a1a; letter-spacing: -0.5px; }
.hero-subtitle { font-size: 16px; font-weight: 500; color: #333; margin: 0 0 8px 0; }
.hero-desc { font-size: 14px; color: #888; margin: 0 0 28px 0; line-height: 1.7; font-weight: 300; }

.feature-tags { display: flex; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; justify-content: center; }
.tag { background: #f5f5f5; color: #666; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 400; letter-spacing: 0.5px; }

.input-section { width: 100%; margin-bottom: 16px; }
.username-input { width: 100%; padding: 14px 18px; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 15px; outline: none; transition: all 0.25s ease; box-sizing: border-box; background: #fafafa; color: #1a1a1a; font-weight: 300; }
.username-input:focus { border-color: #1a1a1a; background: #fff; box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
.username-input::placeholder { color: #bbb; }

.captcha-wrapper { margin-bottom: 24px; display: flex; justify-content: center; }

.start-btn { width: 100%; padding: 16px 32px; border: none; border-radius: 8px; font-size: 15px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); background: #e5e5e5; color: #999; letter-spacing: 1px; }
.start-btn.active { background: #1a1a1a; color: white; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
.start-btn.active:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); background: #000; }
.btn-arrow { transition: transform 0.3s ease; font-weight: 300; }
.start-btn.active:hover .btn-arrow { transform: translateX(4px); }

.circle-entry, .mbti-entry { margin-top: 12px; background: none; border: none; color: #666; font-size: 14px; font-weight: 400; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-radius: 6px; transition: all 0.25s ease; }
.circle-entry:hover, .mbti-entry:hover { color: #1a1a1a; }
.entry-arrow { transition: transform 0.3s ease; font-size: 12px; font-weight: 300; }
.circle-entry:hover .entry-arrow, .mbti-entry:hover .entry-arrow { transform: translateX(3px); }

/* 流程说明 */
.flow-section { max-width: 600px; width: 100%; margin-bottom: 48px; animation: fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.flow-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding: 0 20px; }
.flow-header h3 { margin: 0; font-size: 16px; font-weight: 500; color: #1a1a1a; letter-spacing: 0.5px; }
.flow-hint { font-size: 12px; color: #aaa; font-weight: 300; }

.flow-steps { display: flex; justify-content: space-between; padding: 0 20px; }
.flow-step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; }
.step-num { width: 40px; height: 40px; border-radius: 50%; background: #1a1a1a; color: white; font-size: 16px; font-weight: 500; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; z-index: 1; }
.step-line { position: absolute; top: 20px; left: calc(50% + 20px); right: calc(-50% + 20px); height: 1px; background: #ddd; }
.flow-step.last .step-line { display: none; }
.step-content { text-align: center; padding: 0 8px; }
.step-title { font-size: 14px; font-weight: 500; color: #333; margin-bottom: 4px; }
.step-desc { font-size: 12px; color: #999; font-weight: 300; line-height: 1.5; }

/* 底部工作室信息 */
.footer-section { width: 100%; max-width: 460px; animation: fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
.studio-card {
    background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-radius: 16px; padding: 18px; display: flex; align-items: center; gap: 14px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.03) inset;
    margin-bottom: 16px;
}
.studio-logo-wrap { width: 36px; height: 36px; border-radius: 10px; background: #1a1a1a; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.studio-logo { font-size: 18px; font-weight: 700; color: white; letter-spacing: 0; }
.studio-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.studio-name { font-size: 13px; font-weight: 500; color: #333; }
.studio-desc { font-size: 11px; color: #999; font-weight: 300; }
.studio-link { display: flex; align-items: center; gap: 4px; color: #666; font-size: 12px; font-weight: 400; text-decoration: none; transition: all 0.25s ease; padding: 8px 12px; border-radius: 6px; }
.studio-link:hover { color: #1a1a1a; background: rgba(0,0,0,0.03); }
.studio-arrow { font-size: 11px; font-weight: 300; }
.studio-link:hover .studio-arrow { transform: translateX(3px); transition: transform 0.25s ease; }

.footer-links { display: flex; align-items: center; justify-content: center; gap: 8px; }
.footer-text { font-size: 12px; color: #bbb; font-weight: 300; }
.footer-dot { color: #ddd; }
.footer-link { font-size: 12px; color: #999; font-weight: 300; text-decoration: none; transition: color 0.25s ease; }
.footer-link:hover { color: #666; }

/* 数据展示 */
.stats-section { display: flex; gap: 16px; margin-bottom: 48px; animation: fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
.stat-card { background: rgba(255,255,255,0.6); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border-radius: 12px; padding: 20px 24px; min-width: 100px; text-align: center; border: 1px solid rgba(0,0,0,0.03); }
.stat-num { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; }
.stat-label { font-size: 12px; color: #999; font-weight: 300; }

/* 装饰线条 */
.deco-lines { position: absolute; width: 100%; max-width: 800px; height: 100%; pointer-events: none; opacity: 0.2; }
.line { position: absolute; background: #ccc; border-radius: 1px; }
.line-1 { width: 1px; height: 100px; top: 10%; left: 8%; animation: lineMove 8s ease-in-out infinite; }
.line-2 { width: 80px; height: 1px; top: 35%; right: 6%; animation: lineMove 10s ease-in-out infinite; animation-delay: -2s; }
.line-3 { width: 1px; height: 60px; bottom: 25%; left: 12%; animation: lineMove 12s ease-in-out infinite; animation-delay: -4s; }
.line-4 { width: 1px; height: 40px; top: 60%; right: 15%; animation: lineMove 9s ease-in-out infinite; animation-delay: -3s; }
.line-5 { width: 50px; height: 1px; bottom: 40%; left: 8%; animation: lineMove 11s ease-in-out infinite; animation-delay: -5s; }
@keyframes lineMove { 0%,100% { opacity: 0.2; } 50% { opacity: 0.6; } }

@media (max-width: 600px) {
    .hero-card { padding: 40px 28px; border-radius: 20px; margin-bottom: 36px; }
    .hero-title { font-size: 26px; }
    .hero-subtitle { font-size: 15px; }
    .flow-section { margin-bottom: 36px; }
    .flow-steps { flex-direction: column; gap: 20px; }
    .step-line { display: none; }
    .flow-step { flex-direction: row; align-items: flex-start; gap: 12px; }
    .step-num { width: 32px; height: 32px; font-size: 14px; flex-shrink: 0; margin-bottom: 0; }
    .step-content { text-align: left; padding: 0; }
    .step-title { margin-bottom: 2px; }
    .studio-card { padding: 14px; }
    .studio-logo { font-size: 18px; }
    .deco-lines { display: none; }
}
</style>
