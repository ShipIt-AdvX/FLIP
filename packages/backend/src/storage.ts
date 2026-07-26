import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
const CIRCLE_FILE = path.join(DATA_DIR, 'circle.json');
const LOGS_FILE = path.join(DATA_DIR, 'access-logs.json');
const MAX_LOGS = 2000; // 最多保留 2000 条日志

interface Profile {
  id: string;
  nickname: string;
  avatar: string;
  wechat?: string;
  email?: string;
  bio?: string;
  // 图灵测试新字段
  humanScore?: number;
  totalRounds?: number;
  exposedCount?: number;
  summary?: string;
  // 旧字段（向后兼容）
  flipType?: string;
  confidence?: {
    mind: number;
    feeling: number;
    express: number;
    words: number;
  };
  reason?: string;
  createdAt: number;
}

interface CirclePost {
  id: string;
  profileId: string;
  nickname: string;
  avatar: string;
  content: string;
  humanScore?: number;
  flipType?: string;
  createdAt: number;
}

export interface AccessLog {
  id: string;
  method: string;
  url: string;
  ip: string;
  ua: string;
  referer?: string;
  statusCode: number;
  responseTime: number;
  timestamp: number;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROFILES_FILE)) {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify({}, null, 2));
  }
  if (!fs.existsSync(CIRCLE_FILE)) {
    fs.writeFileSync(CIRCLE_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2));
  }
}

function readLogs(): AccessLog[] {
  ensureDataDir();
  try {
    return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeLogs(logs: AccessLog[]) {
  ensureDataDir();
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
}

function readProfiles(): Record<string, Profile> {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'));
}

function writeProfiles(profiles: Record<string, Profile>) {
  ensureDataDir();
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2));
}

function readCircle(): CirclePost[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(CIRCLE_FILE, 'utf-8'));
}

function writeCircle(posts: CirclePost[]) {
  ensureDataDir();
  fs.writeFileSync(CIRCLE_FILE, JSON.stringify(posts, null, 2));
}

export function saveProfile(profile: Omit<Profile, 'id' | 'createdAt'> & { id?: string }): Profile {
  const profiles = readProfiles();
  const id = profile.id || crypto.randomUUID();
  const newProfile: Profile = {
    ...profile,
    id,
    createdAt: profile.id ? profiles[id]?.createdAt || Date.now() : Date.now()
  };
  profiles[id] = newProfile;
  writeProfiles(profiles);
  return newProfile;
}

export function getProfile(id: string): Profile | null {
  const profiles = readProfiles();
  return profiles[id] || null;
}

export function publishToCircle(post: Omit<CirclePost, 'id' | 'createdAt'>): CirclePost {
  const posts = readCircle();
  const newPost: CirclePost = {
    ...post,
    id: crypto.randomUUID(),
    createdAt: Date.now()
  };
  posts.unshift(newPost);
  writeCircle(posts);
  return newPost;
}

export function getCircleList(page = 1, pageSize = 20): { list: CirclePost[]; total: number } {
  const posts = readCircle();
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    list: posts.slice(start, end),
    total: posts.length
  };
}

export function getRecommendations(profileId: string, limit = 10): Profile[] {
  const profiles = readProfiles();
  const currentProfile = profiles[profileId];
  if (!currentProfile) return [];

  const others = Object.values(profiles).filter(p => p.id !== profileId);
  // 优先基于 humanScore 相近度排序；若缺少该字段则回退到 createdAt 降序
  if (currentProfile.humanScore !== undefined) {
    others.sort((a, b) => {
      const da = a.humanScore !== undefined ? Math.abs(a.humanScore - currentProfile.humanScore!) : 999;
      const db = b.humanScore !== undefined ? Math.abs(b.humanScore - currentProfile.humanScore!) : 999;
      return da - db;
    });
  } else {
    others.sort((a, b) => b.createdAt - a.createdAt);
  }
  return others.slice(0, limit);
}

export function getAllProfiles(): Profile[] {
  const profiles = readProfiles();
  return Object.values(profiles).sort((a, b) => b.createdAt - a.createdAt);
}

// ============ 管理员：访问日志 ============
export function appendLog(log: Omit<AccessLog, 'id'>): void {
  const logs = readLogs();
  logs.unshift({ ...log, id: crypto.randomUUID() });
  // 超出上限截断
  if (logs.length > MAX_LOGS) {
    logs.length = MAX_LOGS;
  }
  writeLogs(logs);
}

export function getLogs(page = 1, pageSize = 50, filter?: { url?: string; method?: string }): { list: AccessLog[]; total: number } {
  let logs = readLogs();
  if (filter?.url) {
    logs = logs.filter(l => l.url.includes(filter.url!));
  }
  if (filter?.method) {
    logs = logs.filter(l => l.method === filter.method);
  }
  const total = logs.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return { list: logs.slice(start, end), total };
}

export function clearLogs(): void {
  writeLogs([]);
}

// ============ 管理员：帖子管理 ============
export function getAllCirclePosts(): CirclePost[] {
  return readCircle().sort((a, b) => b.createdAt - a.createdAt);
}

export function deleteCirclePost(id: string): boolean {
  const posts = readCircle();
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return false;
  posts.splice(idx, 1);
  writeCircle(posts);
  return true;
}

// ============ 管理员：统计 ============
export function getStats() {
  const profiles = Object.values(readProfiles());
  const posts = readCircle();
  const logs = readLogs();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();

  return {
    totalProfiles: profiles.length,
    totalPosts: posts.length,
    totalLogs: logs.length,
    todayVisits: logs.filter(l => l.timestamp >= todayStart).length,
    todayProfiles: profiles.filter(p => p.createdAt >= todayStart).length,
    todayPosts: posts.filter(p => p.createdAt >= todayStart).length,
    avgHumanScore: profiles.length > 0
      ? Math.round(profiles.reduce((sum, p) => sum + (p.humanScore || 0), 0) / profiles.length)
      : 0,
  };
}
