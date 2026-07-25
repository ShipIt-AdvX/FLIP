<template>
    <div class="chat-container">
        <div class="chat-countdown">
            <!--聊天时长倒计时-->
            <Typography
                variant="body2"
                color="text.secondary"
                :sx="{ mr: 1 }">
                剩余时长：{{ remain }} s
            </Typography>
            <LinearProgress variant="determinate" :value="remain" :max="timeTotal" />
        </div>
        <ChatBox
            :adapter="chat_adapter"
            :features="{
                attachments: false
            }"
            :initialConversations="[conversation]"
            :initialActiveConversationId="CONVERSATION_ID"
            :sx="{
                width: 'var(--chatbox-width)',
                height: '80vh',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
            }"
            @messages-change="handleMessageChange">
        </ChatBox>
        <Snackbar
            :open="showError"
            :auto-hide-duration="3000"
            @close="showError = false"
            message="发送消息时发生错误 / An error occured while sending a message"
            />
    </div>
</template>

<script lang="ts" setup>
import { ChatBox as ChatBoxReact } from '@mui/x-chat';
import type { ChatAdapter, ChatConversation, ChatMessage, ChatUser } from '@mui/x-chat/core';
import { applyPureReactInVue } from 'veaury';
import { Snackbar as SnackbarReact, LinearProgress as LinearProgressReact, Typography as TypographyReact } from '@mui/material';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

let message_list: string[] = JSON.parse(localStorage.getItem("history") || "[]");
const username = localStorage.getItem("username") || "HumanUser";
const timeTotal = ref(120);
const CONVERSATION_ID = "flip-chat-session";
const showError = ref(false);
const chatStatus = ref("在线");
const remain = ref(timeTotal.value);

const getMessageText = (message: ChatMessage) => message.parts.map(part => part.type === 'text' ? part.text : '').join('');

const ChatBox = applyPureReactInVue(ChatBoxReact);
const Snackbar = applyPureReactInVue(SnackbarReact);
const LinearProgress = applyPureReactInVue(LinearProgressReact);
const Typography = applyPureReactInVue(TypographyReact);
const handleMessageChange = (msgs: ChatMessage[]) => {
    if (msgs.length % 2 == 1) document.querySelector(".MuiChatConversation-subtitle").innerHTML = "对方正在输入...";
    else document.querySelector(".MuiChatConversation-subtitle").innerHTML = "在线";
}
const chat_adapter: ChatAdapter = {
    async sendMessage({ message, signal }) {
        chatStatus.value = "对方正在输入...";
        const content = getMessageText(message);
        let ai_msg = "";
        let temp_msglist = message_list.slice();
        temp_msglist.push(content);
        const resp = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: temp_msglist,
                username
            })
        })
        if (!resp.ok) {
            showError.value = true;
            ai_msg = "";
        } else { ai_msg = (await resp.json()).content; }
        message_list.push(content);
        message_list.push(ai_msg);
        localStorage.setItem("history", JSON.stringify(message_list));
        return new ReadableStream({
            start(controller) {
                const messageId = crypto.randomUUID();
                const textId = crypto.randomUUID();
                controller.enqueue({
                    type: "start",
                    messageId
                });
                controller.enqueue({
                    type: "text-start",
                    id: textId
                });
                controller.enqueue({
                    type: "text-delta",
                    id: textId,
                    delta: ai_msg
                });
                controller.enqueue({
                    type: "text-end",
                    id: textId
                });
                controller.enqueue({
                    type: "finish",
                    messageId
                });
                chatStatus.value = "在线";
                controller.close();
            },
        })
    },
}

const users = {
    ai: {
        id: "ai",
        role: "assistant",
        displayName: "匿名好友"
    } satisfies ChatUser,
    you: {
        id: "human",
        role: "user",
        displayName: "你"
    } satisfies ChatUser
}

const conversation: ChatConversation = {
    id: CONVERSATION_ID,
    title: "匿名好友",
    subtitle: chatStatus.value,
    participants: [users.you, users.ai],
    readState: 'read',
    unreadCount: 0,
}

// countdown
setInterval(() => {
    remain.value--;
}, 1000);
setTimeout(() => {
    useRouter().push("/result");
}, timeTotal * 1000);
</script>

<style>
:root {
    --chatbox-width: 864px;
}
@media screen and (max-width: 960px) {
    :root {
        --chatbox-width: 90vw;
    }
}

.chat-countdown {
    width: var(--chatbox-width);
}
</style>

<style scoped>
div.chat-container {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
</style>