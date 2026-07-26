<template>
    <div class="profile-container">
        <div class="profile-card">
            <div class="card-header">
                <div class="back-btn" @click="goBack">←</div>
                <h2>完善个人信息</h2>
                <div style="width:40px;"></div>
            </div>

            <div class="avatar-section">
                <div class="avatar-display">
                    <img :src="form.avatar" alt="头像" class="avatar-main" />
                    <div class="avatar-ring"></div>
                </div>
                <p class="avatar-hint">选择你的专属头像</p>
                <div class="avatar-grid">
                    <div
                        v-for="(av, idx) in avatarOptions"
                        :key="idx"
                        class="avatar-item"
                        :class="{ active: form.avatar === av }"
                        @click="form.avatar = av"
                    >
                        <img :src="av" :alt="`头像${idx + 1}`" />
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="form-item">
                    <label class="form-label">昵称</label>
                    <input 
                        type="text" 
                        class="form-input"
                        v-model="form.nickname"
                        placeholder="给自己起个好听的名字"
                    />
                </div>

                <div class="form-item">
                    <label class="form-label">
                        微信号
                        <span class="label-optional">选填</span>
                    </label>
                    <input 
                        type="text" 
                        class="form-input"
                        v-model="form.wechat"
                        placeholder="方便同好联系你"
                    />
                </div>

                <div class="form-item">
                    <label class="form-label">
                        邮箱
                        <span class="label-optional">选填</span>
                    </label>
                    <input 
                        type="email" 
                        class="form-input"
                        v-model="form.email"
                        placeholder="your@email.com"
                    />
                </div>

                <div class="form-item">
                    <label class="form-label">
                        个人简介
                        <span class="label-optional">选填</span>
                    </label>
                    <textarea 
                        class="form-textarea"
                        v-model="form.bio"
                        placeholder="介绍一下你自己吧"
                        rows="3"
                    ></textarea>
                </div>
            </div>

            <div v-if="gameResult" class="score-badge">
                <div class="badge-label">你的图灵测试结果</div>
                <div class="badge-score-row">
                    <span class="badge-score">{{ gameResult.humanScore }} / 100</span>
                    <span class="badge-title">{{ scoreTitle }}</span>
                </div>
                <div class="badge-meta">
                    {{ gameResult.totalRounds }} 轮 · 被识破 {{ gameResult.exposedCount }} 次
                </div>
            </div>

            <button 
                class="save-btn"
                :class="{ active: canSave }"
                :disabled="!canSave"
                @click="saveProfile"
            >
                <span v-if="!saving">保存并公开到交友圈</span>
                <span v-else>保存中...</span>
            </button>

            <div v-if="message" class="message" :class="{ error: isError, success: !isError }">
                {{ message }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { humanScoreText } from '@/flip-defines';

const router = useRouter();

const avatarOptions = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack',
];

const form = reactive({
    nickname: '',
    avatar: avatarOptions[0],
    wechat: '',
    email: '',
    bio: '',
});

const gameResult = ref<{ humanScore: number; totalRounds: number; exposedCount: number; summary: string } | null>(null);
const message = ref('');
const isError = ref(false);
const saving = ref(false);

const canSave = computed(() => form.nickname.trim().length > 0 && !saving.value);
const scoreTitle = computed(() => gameResult.value ? humanScoreText(gameResult.value.humanScore) : '');

function loadResultData() {
    const resultData = localStorage.getItem('gameResult');
    const username = localStorage.getItem('username');

    if (resultData) {
        gameResult.value = JSON.parse(resultData);
    }

    if (username && !form.nickname) {
        form.nickname = username;
    }

    const profileId = localStorage.getItem('profileId');
    if (profileId) {
        loadProfile(profileId);
    }
}

async function loadProfile(id: string) {
    try {
        const resp = await fetch(`/api/profile/${id}`);
        const data = await resp.json();
        if (data.code === 200 && data.data) {
            form.nickname = data.data.nickname;
            form.avatar = data.data.avatar;
            form.wechat = data.data.wechat || '';
            form.email = data.data.email || '';
            form.bio = data.data.bio || '';
            if (data.data.humanScore !== undefined) {
                gameResult.value = {
                    humanScore: data.data.humanScore,
                    totalRounds: data.data.totalRounds || 0,
                    exposedCount: data.data.exposedCount || 0,
                    summary: data.data.summary || ''
                };
            }
        }
    } catch (e) {
        console.error('Load profile failed:', e);
    }
}

async function saveProfile() {
    if (!canSave.value) return;
    saving.value = true;

    const profileId = localStorage.getItem('profileId');

    try {
        const body: any = {
            id: profileId || undefined,
            nickname: form.nickname,
            avatar: form.avatar,
            wechat: form.wechat || undefined,
            email: form.email || undefined,
            bio: form.bio || undefined,
        };
        if (gameResult.value) {
            body.humanScore = gameResult.value.humanScore;
            body.totalRounds = gameResult.value.totalRounds;
            body.exposedCount = gameResult.value.exposedCount;
            body.summary = gameResult.value.summary;
        }

        const resp = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await resp.json();
        if (result.code === 200) {
            localStorage.setItem('profileId', result.data.id);
            message.value = '保存成功，正在跳转...';
            isError.value = false;
            setTimeout(() => { router.push('/circle'); }, 1000);
        } else {
            message.value = result.error || '保存失败';
            isError.value = true;
        }
    } catch (e) {
        console.error('Save profile failed:', e);
        message.value = '保存失败，请稍后重试';
        isError.value = true;
    }
    saving.value = false;
}

function goBack() { router.back(); }

onMounted(() => { loadResultData(); });
</script>

<style scoped>
.profile-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: calc(100vh - 64px);
    padding: 30px 20px;
}

.profile-card {
    width: 100%;
    max-width: 500px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border-radius: 20px;
    padding: 24px;
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

.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.card-header h2 { margin: 0; font-size: 20px; font-weight: 500; color: #1a1a1a; letter-spacing: 0.5px; }
.back-btn {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px; cursor: pointer; transition: all 0.25s ease;
    font-size: 16px; color: #555;
}
.back-btn:hover { background: #f5f5f5; color: #1a1a1a; }

.avatar-section { text-align: center; margin-bottom: 28px; }
.avatar-display { position: relative; display: inline-block; margin-bottom: 12px; }
.avatar-main { width: 80px; height: 80px; border-radius: 50%; position: relative; z-index: 1; filter: grayscale(20%); }
.avatar-ring {
    position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px;
    border-radius: 50%; border: 1.5px solid #ddd;
    animation: pulse 3s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
.avatar-hint { margin: 0 0 16px 0; font-size: 13px; color: #999; font-weight: 300; }
.avatar-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; justify-items: center; }
.avatar-item {
    width: 52px; height: 52px; border-radius: 50%; overflow: hidden;
    cursor: pointer; border: 2px solid transparent; transition: all 0.25s ease;
    background: #fafafa; filter: grayscale(30%);
}
.avatar-item img { width: 100%; height: 100%; object-fit: cover; }
.avatar-item:hover { filter: grayscale(0%); transform: scale(1.05); }
.avatar-item.active { border-color: #1a1a1a; filter: grayscale(0%); }

.form-section { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.form-item { display: flex; flex-direction: column; gap: 6px; }
.form-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: #333; }
.label-optional { font-size: 11px; font-weight: 300; color: #bbb; }

.form-input, .form-textarea {
    width: 100%; padding: 12px 14px;
    border: 1px solid #e8e8e8; border-radius: 8px;
    font-size: 14px; outline: none; transition: all 0.25s ease;
    box-sizing: border-box; background: #fafafa;
    font-family: inherit; resize: vertical; color: #1a1a1a; font-weight: 300;
}
.form-input:focus, .form-textarea:focus {
    border-color: #1a1a1a; background: #fff;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
}
.form-input::placeholder, .form-textarea::placeholder { color: #ccc; }

.score-badge {
    padding: 16px 20px; background: #fafafa; border-radius: 12px;
    margin-bottom: 24px; border: 1px solid #eee;
}
.badge-label { font-size: 12px; color: #888; margin-bottom: 8px; font-weight: 300; }
.badge-score-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 4px; }
.badge-score { font-size: 22px; font-weight: 300; color: #1a1a1a; }
.badge-title { font-size: 14px; font-weight: 400; color: #555; }
.badge-meta { font-size: 12px; color: #999; font-weight: 300; }

.save-btn {
    width: 100%; padding: 15px 32px; border: none; border-radius: 8px;
    font-size: 14px; font-weight: 500; cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    background: #e5e5e5; color: #999; letter-spacing: 0.5px;
}
.save-btn.active { background: #1a1a1a; color: white; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
.save-btn.active:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); background: #000; }

.message {
    margin-top: 14px; text-align: center; padding: 10px;
    border-radius: 8px; font-size: 13px; font-weight: 400;
    animation: fadeIn 0.3s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.message.error { color: #666; background: #f5f5f5; }
.message.success { color: #333; background: #f5f5f5; }

@media (max-width: 600px) {
    .profile-card { padding: 20px; border-radius: 16px; }
    .avatar-grid { grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .avatar-item { width: 44px; height: 44px; }
}
</style>
