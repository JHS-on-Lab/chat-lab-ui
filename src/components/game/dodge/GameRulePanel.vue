<template>
  <div class="card">
    <h3 class="title">📘 게임 규칙</h3>

    <div class="rule-content">
      <p>
        사방에서 날아오는 장애물을 피하며 <strong>최대한 오래 버티는 것</strong>이 목표입니다.
      </p>

      <p>
        점수 500점마다 <strong>Clear</strong> 스킬이 1개씩 지급됩니다. <br />
        <strong>Space</strong> 키를 눌러 Clear를 사용하면
        플레이어를 중심으로 파장이 퍼지며 모든 장애물이 제거됩니다.
      </p>

      <p>
        시간이 지날수록 장애물의 속도와 생성 밀도가 증가하여 점점 더 어려워집니다.
      </p>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.title {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

.rule-content {
  font-size: 14px;
  line-height: 1.6;
  color: #444;
}

.rule-content p {
  margin-bottom: 12px;
}
</style>