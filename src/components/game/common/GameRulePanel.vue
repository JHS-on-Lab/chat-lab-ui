<template>
  <div class="card">
    <h3 class="title">📘 게임 규칙</h3>
    <div class="rule-content">
      <slot />
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