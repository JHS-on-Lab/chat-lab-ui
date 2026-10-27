<script setup>
import GamePage from '@/components/game/common/GamePage.vue'
import DodgeCanvas from '@/components/game/dodge/DodgeCanvas.vue'
</script>

<template>
  <GamePage game-name="dodge">
    <template #canvas="{ onGameOver }">
      <DodgeCanvas @game-over="onGameOver" />
    </template>

    <template #rules>
      <p>
        사방에서 날아오는 장애물을 피하며 <strong>최대한 오래 버티는 것</strong>이 목표입니다.
      </p>
      <br />
      <p>
        점수 500점마다 <strong>Clear</strong> 스킬이 1개씩 지급됩니다.<br />
        <strong>Space</strong> 키를 눌러 Clear를 사용하면
        플레이어를 중심으로 파장이 퍼지며 모든 장애물이 제거됩니다.
      </p>
      <br />
      <p>
        시간이 지날수록 장애물의 속도와 생성 밀도가 증가하여 점점 더 어려워집니다.
      </p>
    </template>
  </GamePage>
</template>
