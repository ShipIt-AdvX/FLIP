<template>
    <div class="mbti-container">
        <div class="mbti-header">
            <button class="back-btn" @click="goBack">← 返回</button>
            <h1 class="mbti-title">说话方式版 MBTI</h1>
            <p class="mbti-subtitle">从你的表达，读懂你的思维</p>
        </div>

        <!-- 传统MBTI对照 -->
        <div class="compare-section">
            <h2 class="section-title">与传统 MBTI 的对照</h2>
            <div class="compare-card">
                <div class="compare-grid">
                    <div class="compare-item">
                        <div class="compare-trad">E / I<br><span>外向—内向</span></div>
                        <div class="compare-arrow">↔</div>
                        <div class="compare-new">L / S<br><span>线性—发散</span></div>
                        <div class="compare-note">从「社交能量」转向「思维路径」</div>
                    </div>
                    <div class="compare-item">
                        <div class="compare-trad">T / F<br><span>思考—情感</span></div>
                        <div class="compare-arrow">↔</div>
                        <div class="compare-new">W / C<br><span>热烈—克制</span></div>
                        <div class="compare-note">从「决策依据」转向「情绪浓度」</div>
                    </div>
                    <div class="compare-item">
                        <div class="compare-trad">S / N<br><span>实感—直觉</span></div>
                        <div class="compare-arrow">↔</div>
                        <div class="compare-new">P / V<br><span>精确—模糊</span></div>
                        <div class="compare-note">从「信息获取」转向「表达精度」</div>
                    </div>
                    <div class="compare-item">
                        <div class="compare-trad">J / P<br><span>判断—感知</span></div>
                        <div class="compare-arrow">↔</div>
                        <div class="compare-new">T / O<br><span>模板—原创</span></div>
                        <div class="compare-note">从「生活方式」转向「用词来源」</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 四维度详解 -->
        <div class="dimensions-section">
            <div class="section-header">
                <h2 class="section-title">四维度详解</h2>
                <p class="section-hint">每个维度左极为「AI 倾向」，右极为「人类特质」。判定信号是项目里 AI 识别用户表达的依据。</p>
            </div>

            <!-- L/S 思维路径 -->
            <div class="dimension-card">
                <div class="dim-header">
                    <span class="dim-tag">Path</span>
                    <span class="dim-name">L / S 思维路径</span>
                    <span class="dim-arrow">AI ⟶ 人类</span>
                </div>
                <div class="dim-content">
                    <div class="dim-left">
                        <div class="dim-label">L</div>
                        <div class="dim-full">线性 Linear</div>
                        <div class="dim-desc">先给结论再展开，逻辑像一条直线，结构清晰、可被复刻。</div>
                        <div class="dim-signals">
                            <span class="signal">「总结一下」</span>
                            <span class="signal">「第一…第二…」</span>
                            <span class="signal">「所以核心是」</span>
                        </div>
                        <div class="dim-note">AI 默认输出结构</div>
                    </div>
                    <div class="dim-center">
                        <div class="center-arrow">→</div>
                    </div>
                    <div class="dim-right">
                        <div class="dim-label human">S</div>
                        <div class="dim-full">发散 Scattered</div>
                        <div class="dim-desc">联想跳跃、绕弯子，路径曲折却常藏惊喜，随机性 AI 难模仿。</div>
                        <div class="dim-signals">
                            <span class="signal human">「诶对了」</span>
                            <span class="signal human">「说到这个」</span>
                            <span class="signal human">「跑题一下」</span>
                        </div>
                        <div class="dim-note human">人类思维特权</div>
                    </div>
                </div>
            </div>

            <!-- W/C 情绪浓度 -->
            <div class="dimension-card">
                <div class="dim-header">
                    <span class="dim-tag">Warmth</span>
                    <span class="dim-name">W / C 情绪浓度</span>
                    <span class="dim-arrow">AI ⟶ 人类</span>
                </div>
                <div class="dim-content">
                    <div class="dim-left">
                        <div class="dim-label">C</div>
                        <div class="dim-full">克制 Cool</div>
                        <div class="dim-desc">语气平稳中正、少感叹、理性得体——AI 最擅长的「安全温和」。</div>
                        <div class="dim-signals">
                            <span class="signal">句号收尾</span>
                            <span class="signal">少语气词</span>
                            <span class="signal">「个人认为」</span>
                        </div>
                        <div class="dim-note">AI 最易复刻</div>
                    </div>
                    <div class="dim-center">
                        <div class="center-arrow">→</div>
                    </div>
                    <div class="dim-right">
                        <div class="dim-label human">W</div>
                        <div class="dim-full">热烈 Warm</div>
                        <div class="dim-desc">情绪外显、感叹号密集、语气有起伏，温度可感。</div>
                        <div class="dim-signals">
                            <span class="signal human">「绝了！」</span>
                            <span class="signal human">「天哪」</span>
                            <span class="signal human">「哈哈哈」</span>
                        </div>
                        <div class="dim-note human">情绪是人的指纹</div>
                    </div>
                </div>
            </div>

            <!-- P/V 表达精度 -->
            <div class="dimension-card">
                <div class="dim-header">
                    <span class="dim-tag">Precision</span>
                    <span class="dim-name">P / V 表达精度</span>
                    <span class="dim-arrow">AI ⟶ 人类</span>
                </div>
                <div class="dim-content">
                    <div class="dim-left">
                        <div class="dim-label">P</div>
                        <div class="dim-full">精确 Precise</div>
                        <div class="dim-desc">用词精准，数据、定义、边界清楚，追求无歧义。</div>
                        <div class="dim-signals">
                            <span class="signal">数据</span>
                            <span class="signal">定义</span>
                            <span class="signal">「具体而言」</span>
                        </div>
                        <div class="dim-note">AI 擅长精确</div>
                    </div>
                    <div class="dim-center">
                        <div class="center-arrow">→</div>
                    </div>
                    <div class="dim-right">
                        <div class="dim-label human">V</div>
                        <div class="dim-full">模糊 Vague</div>
                        <div class="dim-desc">依赖默契与语境，留白、暗示、感受先行——模糊是人类沟通的特权。</div>
                        <div class="dim-signals">
                            <span class="signal human">「大概」</span>
                            <span class="signal human">「有点」</span>
                            <span class="signal human">「那种感觉」</span>
                            <span class="signal human">「你懂吧」</span>
                        </div>
                        <div class="dim-note human">默契即人性</div>
                    </div>
                </div>
            </div>

            <!-- T/O 用词来源 -->
            <div class="dimension-card">
                <div class="dim-header">
                    <span class="dim-tag">Originality</span>
                    <span class="dim-name">T / O 用词来源</span>
                    <span class="dim-arrow">AI ⟶ 人类</span>
                </div>
                <div class="dim-content">
                    <div class="dim-left">
                        <div class="dim-label">T</div>
                        <div class="dim-full">模板 Template</div>
                        <div class="dim-desc">现成话术、流行梗、安全表达——AI 友好区，谁都能接上。</div>
                        <div class="dim-signals">
                            <span class="signal">「绝绝子」</span>
                            <span class="signal">「yyds」</span>
                            <span class="signal">网络套话</span>
                        </div>
                        <div class="dim-note">AI 友好区</div>
                    </div>
                    <div class="dim-center">
                        <div class="center-arrow">→</div>
                    </div>
                    <div class="dim-right">
                        <div class="dim-label human">O</div>
                        <div class="dim-full">原创 Original</div>
                        <div class="dim-desc">自造词、个人口癖、独特比喻——「只有你会这么说」。</div>
                        <div class="dim-signals">
                            <span class="signal human">自造词</span>
                            <span class="signal human">独家比喻</span>
                            <span class="signal human">个人口癖</span>
                        </div>
                        <div class="dim-note human">独一无二的你</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部 -->
        <div class="mbti-footer">
            <div class="footer-text">© 2026 SHIPIT Studio</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const router = useRouter();
function goBack() { router.back(); }
</script>

<style scoped>
.mbti-container { max-width: 700px; margin: 0 auto; padding: 40px 20px 60px; }

.mbti-header { text-align: center; margin-bottom: 48px; }
.back-btn { background: none; border: none; color: #666; font-size: 14px; cursor: pointer; padding: 8px 16px; border-radius: 6px; transition: all 0.25s ease; margin-bottom: 16px; }
.back-btn:hover { color: #1a1a1a; background: rgba(0,0,0,0.03); }
.mbti-title { font-size: 32px; font-weight: 300; margin: 0 0 12px 0; color: #1a1a1a; letter-spacing: -0.5px; }
.mbti-subtitle { font-size: 15px; color: #888; margin: 0; font-weight: 300; }

.section-title { font-size: 18px; font-weight: 500; color: #1a1a1a; margin: 0 0 20px 0; letter-spacing: 0.5px; }
.section-header { margin-bottom: 24px; }
.section-hint { font-size: 13px; color: #999; margin: 8px 0 0 0; line-height: 1.6; font-weight: 300; }

/* 对照区域 */
.compare-section { margin-bottom: 56px; }
.compare-card { background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: 20px; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03) inset; }
.compare-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.compare-item { display: flex; flex-direction: column; gap: 8px; padding: 16px; background: rgba(0,0,0,0.02); border-radius: 12px; }
.compare-trad { font-size: 14px; font-weight: 500; color: #666; }
.compare-trad span { font-size: 11px; font-weight: 300; color: #999; display: block; margin-top: 2px; }
.compare-arrow { font-size: 12px; color: #ddd; text-align: center; }
.compare-new { font-size: 14px; font-weight: 600; color: #1a1a1a; }
.compare-new span { font-size: 11px; font-weight: 300; color: #666; display: block; margin-top: 2px; }
.compare-note { font-size: 11px; color: #aaa; font-weight: 300; margin-top: 4px; }

/* 维度详解 */
.dimensions-section { margin-bottom: 48px; }
.dimension-card { background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: 20px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03) inset; }

.dim-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(0,0,0,0.05); }
.dim-tag { font-size: 11px; font-weight: 600; color: #999; background: rgba(0,0,0,0.05); padding: 4px 10px; border-radius: 4px; letter-spacing: 1px; }
.dim-name { font-size: 16px; font-weight: 500; color: #1a1a1a; flex: 1; }
.dim-arrow { font-size: 12px; color: #bbb; font-weight: 300; }

.dim-content { display: flex; gap: 24px; }
.dim-left, .dim-right { flex: 1; }
.dim-center { display: flex; align-items: center; justify-content: center; width: 40px; }
.center-arrow { font-size: 20px; color: #ddd; font-weight: 300; }

.dim-label { font-size: 32px; font-weight: 700; color: #ccc; margin-bottom: 8px; }
.dim-label.human { color: #1a1a1a; }

.dim-full { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 8px; }

.dim-desc { font-size: 13px; color: #666; line-height: 1.7; font-weight: 300; margin-bottom: 12px; }

.dim-signals { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.signal { font-size: 11px; font-weight: 400; color: #888; background: rgba(0,0,0,0.04); padding: 4px 10px; border-radius: 4px; }
.signal.human { color: #333; background: rgba(0,0,0,0.08); }

.dim-note { font-size: 11px; color: #aaa; font-weight: 300; }
.dim-note.human { color: #666; font-weight: 400; }

.mbti-footer { text-align: center; margin-top: 40px; }
.footer-text { font-size: 12px; color: #bbb; font-weight: 300; }

@media (max-width: 600px) {
    .mbti-container { padding: 32px 16px 48px; }
    .mbti-title { font-size: 26px; }
    .compare-grid { grid-template-columns: 1fr; }
    .dim-content { flex-direction: column; gap: 20px; }
    .dim-center { width: 100%; padding: 8px 0; border-top: 1px dashed #eee; border-bottom: 1px dashed #eee; }
    .center-arrow { transform: rotate(90deg); }
}
</style>
