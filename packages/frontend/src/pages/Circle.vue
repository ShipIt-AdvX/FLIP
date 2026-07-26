<template>
    <div class="circle-container">
        <div class="circle-header">
            <h1>交友圈</h1>
            <p>找到和你人类度相近的人</p>
        </div>

        <div v-if="currentProfile && recommendList.length > 0" class="recommend-section">
            <div class="section-header">
                <h3>为你推荐</h3>
                <span class="section-hint">人类度相近</span>
            </div>
            <div class="recommend-scroll">
                <div class="recommend-list">
                    <div v-for="user in recommendList" :key="user.id" class="recommend-card">
                        <img :src="user.avatar" :alt="user.nickname" class="avatar" />
                        <span class="nickname">{{ user.nickname }}</span>
                        <span class="score-tag" v-if="user.humanScore !== undefined">人类度 {{ user.humanScore }}</span>
                        <span class="score-tag" v-else>暂无分数</span>
                        <div v-if="user.wechat" class="wechat-info">
                            {{ user.wechat }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="publish-card">
            <div v-if="currentProfile" class="publish-header">
                <img :src="currentProfile.avatar" class="publish-avatar" />
                <textarea 
                    class="publish-input"
                    v-model="newPostContent"
                    placeholder="说点什么吧"
                    rows="2"
                ></textarea>
            </div>
            <div v-else class="publish-guest">
                <p>请先完成测试并填写个人信息后才能发布动态</p>
                <button class="guest-btn" @click="goTest">去做测试</button>
            </div>
            <div v-if="currentProfile" class="publish-actions">
                <span class="char-count">{{ newPostContent.length }}/200</span>
                <button 
                    class="publish-btn"
                    :class="{ active: canPublish }"
                    :disabled="!canPublish"
                    @click="publishPost"
                >
                    发布
                </button>
            </div>
        </div>

        <div class="posts-section">
            <div class="section-header">
                <h3>全部动态</h3>
                <span class="section-hint">{{ posts.length }} 条</span>
            </div>
            
            <div v-if="loading" class="loading">
                <div class="spinner"></div>
                <p>加载中</p>
            </div>
            
            <div v-else class="posts-list">
                <div v-for="post in posts" :key="post.id" class="post-card">
                    <div class="post-header">
                        <img :src="post.avatar" :alt="post.nickname" class="post-avatar" />
                        <div class="post-user-info">
                            <span class="post-nickname">{{ post.nickname }}</span>
                            <span class="post-score" v-if="post.humanScore !== undefined">人类度 {{ post.humanScore }}</span>
                        </div>
                        <span class="post-time">{{ formatTime(post.createdAt) }}</span>
                    </div>
                    <div class="post-content">{{ post.content }}</div>
                </div>
            </div>
            
            <div v-if="!loading && posts.length === 0" class="empty-state">
                <div class="empty-icon">—</div>
                <p>还没有动态</p>
                <p class="empty-hint">快来发布第一条吧</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const posts = ref<any[]>([]);
const recommendList = ref<any[]>([]);
const loading = ref(false);
const newPostContent = ref('');

interface Profile {
    id: string;
    nickname: string;
    avatar: string;
    wechat?: string;
    email?: string;
    bio?: string;
    humanScore?: number;
    totalRounds?: number;
    exposedCount?: number;
    summary?: string;
}

const currentProfile = ref<Profile | null>(null);

const canPublish = computed(() => {
    return currentProfile.value && newPostContent.value.trim().length > 0 && newPostContent.value.length <= 200;
});

function formatTime(timestamp: number) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
}

async function loadPosts() {
    loading.value = true;
    try {
        const resp = await fetch('/api/circle/list');
        const data = await resp.json();
        if (data.code === 200) {
            // 关联 profile 的 humanScore
            const profilesResp = await fetch('/api/profiles');
            const profilesData = await profilesResp.json();
            const profileMap: Record<string, any> = {};
            if (profilesData.code === 200) {
                profilesData.data.forEach((p: any) => { profileMap[p.id] = p; });
            }
            posts.value = data.data.list.map((post: any) => ({
                ...post,
                humanScore: profileMap[post.profileId]?.humanScore
            }));
        }
    } catch (e) {
        console.error('Load posts failed:', e);
    }
    loading.value = false;
}

async function loadRecommendations() {
    const profileId = localStorage.getItem('profileId');
    if (!profileId) return;
    try {
        const resp = await fetch(`/api/circle/recommend/${profileId}`);
        const data = await resp.json();
        if (data.code === 200) {
            recommendList.value = data.data;
        }
    } catch (e) {
        console.error('Load recommendations failed:', e);
    }
}

async function loadCurrentProfile() {
    const profileId = localStorage.getItem('profileId');
    if (!profileId) return;
    try {
        const resp = await fetch(`/api/profile/${profileId}`);
        const data = await resp.json();
        if (data.code === 200) {
            currentProfile.value = data.data;
        }
    } catch (e) {
        console.error('Load profile failed:', e);
    }
}

async function publishPost() {
    if (!currentProfile.value || !newPostContent.value.trim()) return;
    try {
        const resp = await fetch('/api/circle/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                profileId: currentProfile.value.id,
                nickname: currentProfile.value.nickname,
                avatar: currentProfile.value.avatar,
                humanScore: currentProfile.value.humanScore,
                content: newPostContent.value.trim()
            })
        });
        const data = await resp.json();
        if (data.code === 200) {
            newPostContent.value = '';
            await loadPosts();
        }
    } catch (e) {
        console.error('Publish failed:', e);
    }
}

function goTest() { router.push('/'); }

onMounted(() => {
    loadCurrentProfile();
    loadPosts();
    loadRecommendations();
});
</script>

<style scoped>
.circle-container {
    max-width: 640px;
    margin: 0 auto;
    padding: 30px 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: calc(100vh - 64px);
    box-sizing: border-box;
}

.circle-header { text-align: center; color: #1a1a1a; animation: fadeInDown 0.6s ease; margin-bottom: 4px; }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
.circle-header h1 { margin: 0 0 4px 0; font-size: 28px; font-weight: 300; letter-spacing: 1px; }
.circle-header p { margin: 0; font-size: 14px; color: #888; font-weight: 300; }

.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.section-header h3 { margin: 0; font-size: 15px; font-weight: 500; color: #1a1a1a; letter-spacing: 0.5px; }
.section-hint { font-size: 12px; color: #aaa; font-weight: 300; }

.recommend-section {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-radius: 16px; padding: 18px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.03) inset;
    animation: fadeInUp 0.6s ease 0.1s both;
}
@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.recommend-scroll { margin: 0 -18px; padding: 0 18px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.recommend-scroll::-webkit-scrollbar { display: none; }
.recommend-list { display: flex; gap: 12px; padding-bottom: 2px; }

.recommend-card {
    min-width: 120px; padding: 18px 14px;
    background: #fafafa; border-radius: 12px;
    text-align: center; display: flex; flex-direction: column;
    align-items: center; gap: 6px; transition: all 0.25s ease;
    border: 1px solid #f0f0f0;
}
.recommend-card:hover { transform: translateY(-2px); background: #f5f5f5; }

.avatar { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; filter: grayscale(20%); }
.recommend-card .nickname { font-weight: 500; font-size: 13px; color: #333; }
.score-tag {
    font-size: 11px; color: #666; background: #fff;
    padding: 3px 10px; border-radius: 10px; font-weight: 400; border: 1px solid #eee;
}
.wechat-info { font-size: 11px; color: #999; margin-top: 1px; font-weight: 300; }

.publish-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-radius: 16px; padding: 18px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.03) inset;
    animation: fadeInUp 0.6s ease 0.2s both;
}
.publish-header { display: flex; gap: 12px; margin-bottom: 10px; }
.publish-avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; filter: grayscale(20%); }
.publish-input {
    flex: 1; border: none; background: #fafafa; border-radius: 8px;
    padding: 10px 14px; font-size: 14px; resize: none; outline: none;
    transition: all 0.25s ease; font-family: inherit; color: #333; font-weight: 300;
}
.publish-input:focus { background: #fff; box-shadow: 0 0 0 1.5px rgba(0,0,0,0.1); }
.publish-input::placeholder { color: #ccc; }

.publish-guest { text-align: center; padding: 16px; }
.publish-guest p { margin: 0 0 10px 0; color: #888; font-size: 13px; font-weight: 300; }
.guest-btn {
    background: #1a1a1a; color: white; border: none;
    padding: 8px 20px; border-radius: 6px; font-size: 13px; font-weight: 400;
    cursor: pointer; transition: all 0.25s ease;
}
.guest-btn:hover { transform: translateY(-1px); background: #000; }

.publish-actions { display: flex; align-items: center; justify-content: space-between; }
.char-count { font-size: 12px; color: #ccc; font-weight: 300; }
.publish-btn {
    padding: 8px 20px; border: none; border-radius: 6px;
    font-size: 13px; font-weight: 400; cursor: pointer;
    transition: all 0.25s ease; background: #e5e5e5; color: #999;
}
.publish-btn.active { background: #1a1a1a; color: white; }
.publish-btn.active:hover { transform: translateY(-1px); background: #000; }

.posts-section {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-radius: 16px; padding: 18px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.03) inset;
    animation: fadeInUp 0.6s ease 0.3s both; flex: 1;
}
.posts-list { display: flex; flex-direction: column; gap: 12px; }
.post-card {
    padding: 14px; background: #fafafa; border-radius: 10px;
    transition: all 0.25s ease; border: 1px solid #f5f5f5;
}
.post-card:hover { background: #f5f5f5; }
.post-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.post-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; filter: grayscale(20%); }
.post-user-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.post-nickname { font-weight: 500; font-size: 14px; color: #333; }
.post-score { font-size: 11px; color: #888; font-weight: 300; }
.post-time { font-size: 12px; color: #ccc; font-weight: 300; }
.post-content { line-height: 1.7; color: #444; font-size: 14px; font-weight: 300; }

.loading { text-align: center; padding: 30px 20px; color: #aaa; }
.spinner {
    width: 32px; height: 32px; border: 2px solid #eee;
    border-top-color: #666; border-radius: 50%;
    margin: 0 auto 10px; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 40px 20px; }
.empty-icon { font-size: 32px; margin-bottom: 10px; color: #ddd; font-weight: 200; }
.empty-state p { margin: 0 0 4px 0; color: #888; font-size: 14px; font-weight: 400; }
.empty-hint { color: #ccc !important; font-size: 12px !important; font-weight: 300 !important; }

@media (max-width: 600px) {
    .circle-header h1 { font-size: 24px; }
    .recommend-section, .publish-card, .posts-section { padding: 14px; border-radius: 12px; }
}
</style>
