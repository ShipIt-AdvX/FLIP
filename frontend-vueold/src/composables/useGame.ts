import { ref, type Ref } from 'vue'

interface UseGameOptions {
  gameId: Ref<string | undefined>
  playerName: string
}

export function useGame({ gameId, playerName }: UseGameOptions) {
  let messages: string[] = [];
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const sendMessage = async (content: string) => {
    if (!gameId.value || !content.trim()) return
    isLoading.value = true
    error.value = null
    try {
      messages.push(content)
      const res = await fetch(`/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: playerName, messages }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || '发送消息失败')
      }
      res.json().then((data) => {
        messages.push(data.content);
      });
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发送消息失败'
    } finally {
      isLoading.value = false
    }
  }

  return { messages, isLoading, error, sendMessage }
}
