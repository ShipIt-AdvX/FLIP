<template>
    <div class="home-container">
        <h1>
            「你是人类吗？」
        </h1>
        <p>如果你想证明你是人类，那请您花费大约两分钟的时间来做「言纹 / FLIP」吧。</p>
        <p>本测验仅供娱乐，不要太过于当真。</p>
        <TextField label="用户名" variant="outlined" @change="updateUsername" />
        <VueHcaptcha sitekey="7f143322-c5be-437e-8ea4-8f1c71c27916" />
        <!--Captcha-->
        <Button variant="contained" :endIcon="createElement(ArrowForward)" @click="handleStart">开始吧</Button>
    </div>
</template>

<style scoped>
.home-container{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
h1, p {margin: 5px;}
</style>

<script lang="ts" setup>
import { Button as ButtonReact, TextField as TextFieldReact } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { applyPureReactInVue } from 'veaury';
import { createElement } from 'react';
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const Button = applyPureReactInVue(ButtonReact);
const TextField = applyPureReactInVue(TextFieldReact);

const router = useRouter();
const username = ref("");

function updateUsername(ev: Event) {
    username.value = ev.target.value;
}
function handleStart() {
    localStorage.setItem("history", "[]"); // 防止有人聊一半又回去重新开始
    localStorage.setItem("username", username.value);
    router.push("/chat");
}
</script>