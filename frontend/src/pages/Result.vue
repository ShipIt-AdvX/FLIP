<template>
    <div class="result-container">
            <Card variant="outlined">
                <div v-if="judging">
                    <!--展示判断界面-->
                    <CardContent class="result-card generating-result">
                        <!--懒得copy样式了（-->
                        <CircularProgress />
                        <h2>稍安勿躁...</h2>
                        <p>我们正在为你准备报告，请稍等...</p>
                    </CardContent>
                </div>
                <div v-else>
                    <CardContent class="result-card">
                        <!--好耶！是结果！-->
                        <h4>你的「言纹 / FLIP」人格是：</h4>
                        <h1>{{ flip }}</h1>
                        <p>{{ flipDesc }}</p>
                        <p>判断理由：{{ flipReason }}</p>
                        <p>本测验仅供娱乐，不要太过于当真。</p>
                        <Button variant="contained" :endIcon="createElement(Replay)" @click="retest">再测一次！</Button>
                    </CardContent>
                </div>
            </Card>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Card as CardReact, CardContent as CardContentReact, CircularProgress as CircularProgressReact, Button as ButtonReact } from '@mui/material';
import { Replay } from '@mui/icons-material';
import { applyPureReactInVue } from 'veaury';
import { useRouter } from 'vue-router';
import { createElement } from 'react';
import FLIPDefines from '@/flip-defines';

const judging = ref(true);
const flip = ref("");
const flipDesc = ref("");
const flipReason = ref("");
const router = useRouter();

const Button = applyPureReactInVue(ButtonReact);
const Card = applyPureReactInVue(CardReact);
const CardContent = applyPureReactInVue(CardContentReact);
const CircularProgress = applyPureReactInVue(CircularProgressReact);

// judge it
const messages = JSON.parse(localStorage.getItem("history"));
fetch("/api/judge", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        messages
    })
}).then(async (resp) => {
    // process core
    if (!resp.ok) {
        // TODO: Error handler
    }
    const data = (await resp.json()).data;
    let whatFlip = "";
    const confidence = data.confidence;
    if (confidence.mind >= 0.5) whatFlip += "S"; else whatFlip += "L";
    if (confidence.feeling >= 0.5) whatFlip += "C"; else whatFlip += "W";
    if (confidence.express >= 0.5) whatFlip += "P"; else whatFlip += "V";
    if (confidence.words >= 0.5) whatFlip += "T"; else whatFlip += "L";
    flip.value = `${whatFlip}`;
    flipDesc.value = FLIPDefines[whatFlip].desc;
    judging.value = false;
})

function retest() {
    router.push("/");
}
</script>

<style scoped>
.result-container{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
h1, h2, h4, p {margin: 5px;}
h2 {margin-top: 20px;}
</style>

<style>
.result-card{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
}
.generating-result {
    margin: 30px 5px 6px 5px;
}
</style>