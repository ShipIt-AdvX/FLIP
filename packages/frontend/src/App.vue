<template>
    <ThemeProvider :theme="theme">
        <CssBaseline />
        <div class="app-wrapper">
            <div class="bg-decoration">
                <div class="blob blob-1"></div>
                <div class="blob blob-2"></div>
                <div class="blob blob-3"></div>
            </div>
            <AppBar position="sticky" class="app-bar">
                <Toolbar>
                    <div class="logo-section">
                        <span class="logo-icon">◐</span>
                        <Typography variant="h6" component="div" class="logo-text">
                            你是人类吗？
                        </Typography>
                    </div>
                    <div class="nav-links" :sx="{ flexGrow: 1 }">
                        <button class="nav-link" @click="goHome">首页</button>
                        <button class="nav-link" @click="goCircle">交友圈</button>
                    </div>
                </Toolbar>
            </AppBar>
            <div class="main-content">
                <RouterView />
            </div>
        </div>
    </ThemeProvider>
</template>

<style>
.app-wrapper {
    min-height: 100vh;
    background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 50%, #f0f0f0 100%);
    position: relative;
    overflow: hidden;
}

.bg-decoration {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
}

.blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.3;
    animation: float 25s ease-in-out infinite;
}

.blob-1 {
    width: 500px;
    height: 500px;
    background: #e8e8e8;
    top: -150px;
    left: -100px;
    animation-delay: 0s;
}

.blob-2 {
    width: 600px;
    height: 600px;
    background: #dcdcdc;
    bottom: -200px;
    right: -150px;
    animation-delay: -8s;
}

.blob-3 {
    width: 400px;
    height: 400px;
    background: #e0e0e0;
    top: 40%;
    left: 60%;
    transform: translate(-50%, -50%);
    animation-delay: -16s;
}

@keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(40px, -40px) scale(1.08); }
    66% { transform: translate(-30px, 30px) scale(0.95); }
}

.app-bar {
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
    box-shadow: none !important;
    color: #1a1a1a !important;
}

.logo-section {
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo-icon {
    font-size: 24px;
    filter: grayscale(100%);
    opacity: 0.8;
}

.logo-text {
    font-weight: 600 !important;
    color: #1a1a1a !important;
    letter-spacing: 2px;
    font-size: 16px !important;
    -webkit-text-fill-color: #1a1a1a !important;
}

.nav-links {
    display: flex;
    justify-content: flex-end;
    gap: 4px;
}

.nav-link {
    background: none;
    border: none;
    color: #555;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 400;
    transition: all 0.25s ease;
}

.nav-link:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1a1a1a;
}

.main-content {
    position: relative;
    z-index: 1;
    min-height: calc(100vh - 64px);
}
</style>

<style scoped></style>

<script setup lang="ts">
import { AppBar as AppBarReact, Toolbar as ToolbarReact, Typography as TypographyReact, ThemeProvider as ThemeProviderReact, createTheme, CssBaseline as CssBaselineReact } from "@mui/material"
import { applyPureReactInVue } from "veaury";
import { useRouter } from 'vue-router';

const router = useRouter();

const theme = createTheme({
    palette: {
        mode: window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"
    }
})

function goHome() {
    router.push('/');
}

function goCircle() {
    router.push('/circle');
}

const AppBar = applyPureReactInVue(AppBarReact);
const Toolbar = applyPureReactInVue(ToolbarReact);
const Typography = applyPureReactInVue(TypographyReact);
const ThemeProvider = applyPureReactInVue(ThemeProviderReact);
const CssBaseline = applyPureReactInVue(CssBaselineReact);

setInterval(() => {
    document.querySelectorAll("[data-use-vue-component-wrap]").forEach((el) => el.setAttribute("style", el.getAttribute("style").replace("all: unset;", "")));
    document.querySelectorAll("[__use_react_component_wrap]").forEach((el) => el.setAttribute("style", el.getAttribute("style").replace("all: unset;", "")));
}, 10);
</script>