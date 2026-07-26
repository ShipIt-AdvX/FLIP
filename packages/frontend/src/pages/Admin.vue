<template>
    <div class="admin-container">
        <!-- 登录页 -->
        <div v-if="!authed" class="login-card">
            <div class="login-header">
                <div class="login-icon">◐</div>
                <h2>管理控制台</h2>
                <p>请输入管理员密钥</p>
            </div>
            <input
                type="password"
                class="login-input"
                v-model="tokenInput"
                placeholder="Admin Token"
                @keyup.enter="login"
            />
            <button class="login-btn" :class="{ active: tokenInput.trim() }" :disabled="!tokenInput.trim()" @click="login">
                进入
            </button>
            <div v-if="loginError" class="login-error">{{ loginError }}</div>
        </div>

        <!-- 控制台 -->
        <div v-else class="console">
            <!-- 顶部统计 -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">总访问</div>
                    <div class="stat-value">{{ stats.totalLogs || 0 }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">今日访问</div>
                    <div class="stat-value">{{ stats.todayVisits || 0 }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">总用户</div>
                    <div class="stat-value">{{ stats.totalProfiles || 0 }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">今日新增</div>
                    <div class="stat-value">{{ stats.todayProfiles || 0 }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">总帖子</div>
                    <div class="stat-value">{{ stats.totalPosts || 0 }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">平均人类度</div>
                    <div class="stat-value">{{ stats.avgHumanScore || 0 }}</div>
                </div>
            </div>

            <!-- Tab 切换 -->
            <div class="tabs">
                <button class="tab" :class="{ active: tab === 'logs' }" @click="tab = 'logs'">
                    访问日志
                    <span class="tab-count">{{ logsTotal }}</span>
                </button>
                <button class="tab" :class="{ active: tab === 'posts' }" @click="tab = 'posts'">
                    帖子管理
                    <span class="tab-count">{{ posts.length }}</span>
                </button>
                <button class="tab" :class="{ active: tab === 'profiles' }" @click="tab = 'profiles'">
                    用户资料
                    <span class="tab-count">{{ profiles.length }}</span>
                </button>
            </div>

            <!-- 日志面板 -->
            <div v-if="tab === 'logs'" class="panel">
                <div class="panel-toolbar">
                    <div class="filter-group">
                        <select class="filter-select" v-model="logFilter.method">
                            <option value="">所有方法</option>
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                        <input class="filter-input" v-model="logFilter.url" placeholder="URL 过滤" />
                        <button class="filter-btn" @click="loadLogs">筛选</button>
                    </div>
                    <div class="action-group">
                        <label class="auto-refresh">
                            <input type="checkbox" v-model="autoRefresh" />
                            <span>自动刷新</span>
                        </label>
                        <button class="danger-btn" @click="clearLogs">清空日志</button>
                    </div>
                </div>

                <div class="log-table">
                    <div class="log-row log-header-row">
                        <div class="log-col time">时间</div>
                        <div class="log-col method">方法</div>
                        <div class="log-col url">URL</div>
                        <div class="log-col ip">IP</div>
                        <div class="log-col status">状态</div>
                        <div class="log-col rt">耗时</div>
                    </div>
                    <div v-if="logsLoading" class="log-empty">加载中...</div>
                    <div v-else-if="logs.length === 0" class="log-empty">暂无日志</div>
                    <div
                        v-for="log in logs"
                        :key="log.id"
                        class="log-row"
                        :class="{ 'is-error': log.statusCode >= 400 }"
                    >
                        <div class="log-col time">{{ formatLogTime(log.timestamp) }}</div>
                        <div class="log-col method"><span class="method-tag" :class="log.method.toLowerCase()">{{ log.method }}</span></div>
                        <div class="log-col url" :title="log.url">{{ log.url }}</div>
                        <div class="log-col ip">{{ log.ip }}</div>
                        <div class="log-col status"><span class="status-tag" :class="statusClass(log.statusCode)">{{ log.statusCode }}</span></div>
                        <div class="log-col rt">{{ log.responseTime }}ms</div>
                    </div>
                </div>
            </div>

            <!-- 帖子管理面板 -->
            <div v-if="tab === 'posts'" class="panel">
                <div v-if="posts.length === 0" class="log-empty">暂无帖子</div>
                <div v-for="post in posts" :key="post.id" class="post-manage-card">
                    <div class="post-manage-header">
                        <img :src="post.avatar" class="post-manage-avatar" />
                        <div class="post-manage-info">
                            <span class="post-manage-name">{{ post.nickname }}</span>
                            <span class="post-manage-meta">{{ formatLogTime(post.createdAt) }}</span>
                        </div>
                        <span v-if="post.humanScore !== undefined" class="post-manage-score">人类度 {{ post.humanScore }}</span>
                        <button class="delete-btn" @click="deletePost(post.id)">删除</button>
                    </div>
                    <div class="post-manage-content">{{ post.content }}</div>
                </div>
            </div>

            <!-- 用户资料面板 -->
            <div v-if="tab === 'profiles'" class="panel">
                <div v-if="profiles.length === 0" class="log-empty">暂无用户</div>
                <div v-for="p in profiles" :key="p.id" class="profile-manage-card">
                    <img :src="p.avatar" class="profile-manage-avatar" />
                    <div class="profile-manage-detail">
                        <div class="profile-manage-name">{{ p.nickname }}</div>
                        <div class="profile-manage-sub">
                            <span v-if="p.wechat">微信: {{ p.wechat }}</span>
                            <span v-if="p.email">邮箱: {{ p.email }}</span>
                        </div>
                        <div v-if="p.bio" class="profile-manage-bio">{{ p.bio }}</div>
                    </div>
                    <div class="profile-manage-stats">
                        <div v-if="p.humanScore !== undefined" class="pm-score">人类度 {{ p.humanScore }}</div>
                        <div class="pm-time">{{ formatLogTime(p.createdAt) }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';

const authed = ref(false);
const tokenInput = ref('');
const token = ref('');
const loginError = ref('');

const tab = ref<'logs' | 'posts' | 'profiles'>('logs');

const stats = ref<any>({});
const logs = ref<any[]>([]);
const logsTotal = ref(0);
const logsLoading = ref(false);
const posts = ref<any[]>([]);
const profiles = ref<any[]>([]);

const logFilter = reactive({ method: '', url: '' });
const autoRefresh = ref(false);
let refreshTimer: any = null;

function authHeaders() {
    return { 'x-admin-token': token.value };
}

async function login() {
    if (!tokenInput.value.trim()) return;
    token.value = tokenInput.value.trim();
    try {
        const resp = await fetch('/api/admin/stats', { headers: authHeaders() });
        if (resp.status === 401) {
            loginError.value = '密钥错误';
            return;
        }
        if (resp.ok) {
            authed.value = true;
            localStorage.setItem('adminToken', token.value);
            loadAll();
        } else {
            loginError.value = '连接失败';
        }
    } catch (e) {
        loginError.value = '网络错误';
    }
}

async function loadStats() {
    try {
        const resp = await fetch('/api/admin/stats', { headers: authHeaders() });
        const data = await resp.json();
        if (data.code === 200) stats.value = data.data;
    } catch (e) {}
}

async function loadLogs() {
    logsLoading.value = true;
    try {
        const params = new URLSearchParams({ page: '1', pageSize: '100' });
        if (logFilter.method) params.set('method', logFilter.method);
        if (logFilter.url) params.set('url', logFilter.url);
        const resp = await fetch(`/api/admin/logs?${params}`, { headers: authHeaders() });
        const data = await resp.json();
        if (data.code === 200) {
            logs.value = data.data.list;
            logsTotal.value = data.data.total;
        }
    } catch (e) {}
    logsLoading.value = false;
}

async function loadPosts() {
    try {
        const resp = await fetch('/api/admin/posts', { headers: authHeaders() });
        const data = await resp.json();
        if (data.code === 200) posts.value = data.data;
    } catch (e) {}
}

async function loadProfiles() {
    try {
        const resp = await fetch('/api/admin/profiles', { headers: authHeaders() });
        const data = await resp.json();
        if (data.code === 200) profiles.value = data.data;
    } catch (e) {}
}

async function loadAll() {
    await Promise.all([loadStats(), loadLogs(), loadPosts(), loadProfiles()]);
}

async function clearLogs() {
    if (!confirm('确认清空所有日志？')) return;
    try {
        await fetch('/api/admin/logs', { method: 'DELETE', headers: authHeaders() });
        await loadLogs();
        await loadStats();
    } catch (e) {}
}

async function deletePost(id: string) {
    if (!confirm('确认删除该帖子？')) return;
    try {
        await fetch(`/api/admin/posts/${id}`, { method: 'DELETE', headers: authHeaders() });
        await loadPosts();
        await loadStats();
    } catch (e) {}
}

function statusClass(code: number) {
    if (code >= 500) return 's5xx';
    if (code >= 400) return 's4xx';
    if (code >= 300) return 's3xx';
    return 's2xx';
}

function formatLogTime(ts: number) {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

watch(autoRefresh, (v) => {
    if (v) {
        refreshTimer = setInterval(() => { loadLogs(); loadStats(); }, 5000);
    } else {
        if (refreshTimer) clearInterval(refreshTimer);
        refreshTimer = null;
    }
});

onMounted(() => {
    const saved = localStorage.getItem('adminToken');
    if (saved) {
        token.value = saved;
        tokenInput.value = saved;
        fetch('/api/admin/stats', { headers: authHeaders() }).then(r => {
            if (r.ok) {
                authed.value = true;
                loadAll();
            }
        }).catch(() => {});
    }
});

onUnmounted(() => {
    if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<style scoped>
.admin-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px 20px;
    min-height: calc(100vh - 64px);
    box-sizing: border-box;
}

.login-card {
    max-width: 380px;
    margin: 80px auto 0;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(30px);
    border-radius: 20px;
    padding: 48px 36px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03) inset;
    text-align: center;
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.login-icon { font-size: 36px; color: #1a1a1a; margin-bottom: 16px; opacity: 0.7; }
.login-header h2 { margin: 0 0 4px 0; font-size: 20px; font-weight: 400; color: #1a1a1a; letter-spacing: 1px; }
.login-header p { margin: 0 0 24px 0; font-size: 13px; color: #999; font-weight: 300; }
.login-input {
    width: 100%; padding: 14px 16px;
    border: 1px solid #e5e5e5; border-radius: 8px;
    font-size: 14px; outline: none; box-sizing: border-box;
    background: #fafafa; color: #1a1a1a; font-weight: 300;
    transition: all 0.25s ease; margin-bottom: 16px;
}
.login-input:focus { border-color: #1a1a1a; background: #fff; box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
.login-btn {
    width: 100%; padding: 13px; border: none; border-radius: 8px;
    font-size: 14px; font-weight: 500; cursor: pointer;
    background: #e5e5e5; color: #999; transition: all 0.25s ease;
}
.login-btn.active { background: #1a1a1a; color: white; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
.login-btn.active:hover { transform: translateY(-1px); background: #000; }
.login-error { margin-top: 12px; font-size: 12px; color: #999; }

.stats-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
    margin-bottom: 24px;
}
.stat-card {
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(20px);
    border-radius: 12px;
    padding: 16px 14px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.03) inset;
}
.stat-label { font-size: 11px; color: #999; font-weight: 300; margin-bottom: 6px; letter-spacing: 0.5px; }
.stat-value { font-size: 26px; font-weight: 300; color: #1a1a1a; line-height: 1; }

.tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    border-bottom: 1px solid #eee;
}
.tab {
    background: none; border: none; cursor: pointer;
    padding: 12px 20px; font-size: 14px; font-weight: 400;
    color: #888; transition: all 0.25s ease;
    display: flex; align-items: center; gap: 6px;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
}
.tab:hover { color: #555; }
.tab.active { color: #1a1a1a; border-bottom-color: #1a1a1a; font-weight: 500; }
.tab-count {
    font-size: 11px; color: #aaa;
    background: #f5f5f5; padding: 2px 8px; border-radius: 10px;
    font-weight: 300;
}
.tab.active .tab-count { background: #1a1a1a; color: white; }

.panel {
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.03) inset;
}

.panel-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
.filter-group { display: flex; gap: 8px; align-items: center; }
.filter-select, .filter-input {
    padding: 8px 12px; border: 1px solid #e5e5e5; border-radius: 6px;
    font-size: 12px; background: #fafafa; color: #333; outline: none;
    font-family: inherit; font-weight: 300;
}
.filter-input { min-width: 180px; }
.filter-select:focus, .filter-input:focus { border-color: #1a1a1a; background: #fff; }
.filter-btn {
    padding: 8px 16px; border: none; border-radius: 6px;
    background: #1a1a1a; color: white; font-size: 12px;
    cursor: pointer; font-weight: 400;
}
.filter-btn:hover { background: #000; }
.action-group { display: flex; gap: 12px; align-items: center; }
.auto-refresh { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #666; cursor: pointer; }
.auto-refresh input { cursor: pointer; }
.danger-btn {
    padding: 8px 16px; border: 1px solid #ddd; border-radius: 6px;
    background: transparent; color: #666; font-size: 12px;
    cursor: pointer; font-weight: 400; transition: all 0.25s ease;
}
.danger-btn:hover { color: #1a1a1a; border-color: #1a1a1a; }

.log-table {
    max-height: 600px;
    overflow-y: auto;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
}
.log-table::-webkit-scrollbar { width: 6px; }
.log-table::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
.log-row {
    display: grid;
    grid-template-columns: 110px 70px 1fr 130px 70px 70px;
    gap: 8px;
    padding: 10px 14px;
    border-bottom: 1px solid #f5f5f5;
    font-size: 12px;
    align-items: center;
    font-weight: 300;
}
.log-row:last-child { border-bottom: none; }
.log-row:hover { background: #fafafa; }
.log-header-row {
    background: #f5f5f5;
    font-weight: 500;
    color: #555;
    position: sticky;
    top: 0;
    z-index: 1;
    font-size: 11px;
    letter-spacing: 0.5px;
}
.log-row.is-error { background: #faf8f8; }
.log-row.is-error:hover { background: #f5f0f0; }
.log-col { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.log-col.url { color: #333; font-family: monospace; }
.log-col.ip { color: #999; font-family: monospace; }
.log-col.rt { color: #999; text-align: right; }

.method-tag {
    display: inline-block; padding: 2px 6px; border-radius: 3px;
    font-size: 10px; font-weight: 500; font-family: monospace;
}
.method-tag.get { background: #e8e8e8; color: #555; }
.method-tag.post { background: #1a1a1a; color: white; }
.method-tag.delete { background: #666; color: white; }

.status-tag {
    display: inline-block; padding: 2px 8px; border-radius: 10px;
    font-size: 10px; font-weight: 500; font-family: monospace;
}
.status-tag.s2xx { background: #f0f0f0; color: #666; }
.status-tag.s3xx { background: #e8e8e8; color: #555; }
.status-tag.s4xx { background: #333; color: white; }
.status-tag.s5xx { background: #1a1a1a; color: white; }

.log-empty { padding: 40px 20px; text-align: center; color: #aaa; font-size: 13px; font-weight: 300; }

.post-manage-card {
    padding: 14px; background: #fafafa; border-radius: 10px;
    border: 1px solid #f0f0f0; margin-bottom: 10px;
}
.post-manage-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.post-manage-avatar { width: 36px; height: 36px; border-radius: 50%; filter: grayscale(20%); }
.post-manage-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.post-manage-name { font-size: 13px; font-weight: 500; color: #333; }
.post-manage-meta { font-size: 11px; color: #aaa; font-weight: 300; }
.post-manage-score { font-size: 11px; color: #666; background: #fff; padding: 3px 10px; border-radius: 10px; border: 1px solid #eee; }
.delete-btn {
    padding: 6px 14px; border: 1px solid #ddd; border-radius: 6px;
    background: transparent; color: #666; font-size: 12px;
    cursor: pointer; transition: all 0.25s ease;
}
.delete-btn:hover { color: #1a1a1a; border-color: #1a1a1a; background: #1a1a1a; color: white; }
.post-manage-content { font-size: 13px; color: #444; line-height: 1.6; font-weight: 300; }

.profile-manage-card {
    display: flex; align-items: center; gap: 14px;
    padding: 14px; background: #fafafa; border-radius: 10px;
    border: 1px solid #f0f0f0; margin-bottom: 10px;
}
.profile-manage-avatar { width: 48px; height: 48px; border-radius: 50%; filter: grayscale(20%); flex-shrink: 0; }
.profile-manage-detail { flex: 1; }
.profile-manage-name { font-size: 14px; font-weight: 500; color: #333; margin-bottom: 2px; }
.profile-manage-sub { font-size: 11px; color: #888; display: flex; gap: 12px; font-weight: 300; }
.profile-manage-bio { font-size: 12px; color: #666; margin-top: 4px; font-weight: 300; }
.profile-manage-stats { text-align: right; }
.pm-score { font-size: 12px; color: #1a1a1a; font-weight: 500; margin-bottom: 2px; }
.pm-time { font-size: 11px; color: #aaa; font-weight: 300; }

@media (max-width: 900px) {
    .stats-grid { grid-template-columns: repeat(3, 1fr); }
    .log-row { grid-template-columns: 90px 60px 1fr 60px; font-size: 11px; }
    .log-col.ip, .log-col.rt { display: none; }
}
@media (max-width: 600px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .panel-toolbar { flex-direction: column; align-items: stretch; }
    .filter-group { flex-wrap: wrap; }
    .filter-input { min-width: 0; flex: 1; }
}
</style>
