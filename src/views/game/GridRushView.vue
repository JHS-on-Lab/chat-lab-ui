<script setup>
import { ref, onMounted } from 'vue'
import GameRulePanel from '@/components/game/common/GameRulePanel.vue'
import ScoreBoard from '@/components/game/common/ScoreBoard.vue'
import GirdRushCanvas from '@/components/game/grid-rush/GirdRushCanvas.vue'
import { saveScore } from '@/api/gameApi'

const scoreBoardRef = ref(null)
const GAME_NAME = 'grid-rush'

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
      <GirdRushCanvas @game-over="handleGameOver" />
    </div>

    <div class="right">
      <div class="rank">
        <ScoreBoard ref="scoreBoardRef" />
      </div>

      <div class="rule">
        <GameRulePanel>
          <p>
            3x3 그리드에 표시된 <strong>A / S / D / F</strong> 키를
            <strong>위에서 아래 순서대로</strong> 정확히 입력하는 것이 목표입니다.
          </p>
          <br />
          <p>
            올바른 키를 누르면 해당 칸이 제거되며,
            9개를 모두 제거하면 새로운 그리드가 생성됩니다.
          </p>
          <br />
          <p>
            잘못된 키를 입력하면 남은 시간이 <strong>3초 감소</strong>됩니다.
          </p>
          <br />
          <p>
            제한 시간 <strong>30초</strong> 동안
            최대한 많은 칸을 제거하세요.
          </p>
        </GameRulePanel>
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