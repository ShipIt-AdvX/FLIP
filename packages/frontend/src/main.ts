import { createApp } from 'vue'
import { createRoot } from 'react-dom/client'
import { setVeauryOptions } from 'veaury'
import App from './App.vue'
import router from './router'

const app = createApp(App)

setVeauryOptions({
    react: {
        createRoot
    }
})
app.use(router)
app.mount('#app')
