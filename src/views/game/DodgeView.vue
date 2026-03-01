<script setup>
import { ref, onMounted } from 'vue'
import DodgeCanvas from '@/components/game/dodge/DodgeCanvas.vue'
import GameRulePanel from '@/components/game/dodge/GameRulePanel.vue'
import ScoreBoard from '@/components/game/common/ScoreBoard.vue'
import { saveScore } from '@/api/gameApi'

const scoreBoardRef = ref(null)
const GAME_NAME = 'dodge'

onMounted(() => {
  scoreBoardRef.value.reload(GAME_NAME) // 게임 이름
})

const handleGameOver = async ({ score }) => {
  await saveScore(GAME_NAME, score)
  await scoreBoardRef.value.reload(GAME_NAME)
}
</script>

<template>
  <div class="dodge-layout">
    <div class="left">
      <DodgeCanvas @game-over="handleGameOver" />
    </div>

    <div class="right">
      <div class="rank">
        <ScoreBoard ref="scoreBoardRef" />
      </div>

      <div class="rule">
        <GameRulePanel />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dodge-layout {
  display: flex;
  height: 100%;
}

.left {
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.right {
  flex: 1;
  border-left: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.rank,
.rule {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.rank {
  border-bottom: 1px solid #ddd;
}
</style>