<script setup>
import { ref } from 'vue'
import GameRulePanel from '@/components/game/common/GameRulePanel.vue'
import ScoreBoard from '@/components/game/common/ScoreBoard.vue'
import { saveScore } from '@/api/gameApi'

/**
 * 게임 화면 공통 레이아웃: 왼쪽 캔버스 + 오른쪽(랭킹 / 규칙)
 * - #canvas 슬롯은 onGameOver 핸들러를 받아 캔버스의 game-over 이벤트에 연결한다.
 */
const props = defineProps({
  gameName: { type: String, required: true }
})

const scoreBoardRef = ref(null)

// 게임 종료 시 점수 저장 후 랭킹 갱신
const handleGameOver = async ({ score }) => {
  try {
    await saveScore(props.gameName, score)
  } catch (e) {
    console.error('점수 저장 실패', e)
  }
  await scoreBoardRef.value?.reload()
}
</script>

<template>
  <div class="game-layout">
    <div class="left">
      <slot name="canvas" :onGameOver="handleGameOver" />
    </div>

    <div class="right">
      <div class="rank">
        <ScoreBoard ref="scoreBoardRef" :game-name="gameName" />
      </div>

      <div class="rule">
        <GameRulePanel>
          <slot name="rules" />
        </GameRulePanel>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-layout {
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
