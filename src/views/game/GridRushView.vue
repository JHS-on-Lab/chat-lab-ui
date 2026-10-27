<script setup>
import GamePage from '@/components/game/common/GamePage.vue'
import GridRushCanvas from '@/components/game/grid-rush/GridRushCanvas.vue'
</script>

<template>
  <GamePage game-name="grid-rush">
    <template #canvas="{ onGameOver }">
      <GridRushCanvas @game-over="onGameOver" />
    </template>

    <template #rules>
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
    </template>
  </GamePage>
</template>
