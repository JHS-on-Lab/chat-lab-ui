<script setup>
import { ref, onMounted } from 'vue'
import { fetchTop10 } from '@/api/gameApi'

const props = defineProps({
  gameName: {
    type: String,
    required: false
  }
})

const scores = ref([])
const loading = ref(false)

const reload = async (game) => {
  const targetGame = game || props.gameName
  if (!targetGame) return

  loading.value = true
  try {
    scores.value = await fetchTop10(targetGame)
  } finally {
    loading.value = false
  }
}

defineExpose({ reload })

onMounted(() => {
  if (props.gameName) {
    reload(props.gameName)
  }
})
</script>

<template>
  <div class="card">
    <div class="card-header">
      🏆 Top 10 Ranking
    </div>

    <div class="card-body">
      <div v-if="loading">Loading...</div>

      <ul v-else class="ranking-list">
        <li v-for="(item, index) in scores" :key="item.username + index" :class="[
          'rank-item',
          { first: index === 0 },
          { top3: index > 0 && index < 3 }
        ]">
          <div class="left">
            <span class="rank-number">{{ index + 1 }}</span>
            <span class="username">{{ item.username }}</span>
          </div>

          <div class="right">
            <span class="score">{{ item.score }}</span>
            <span class="unit">pts</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  box-sizing: border-box;
}

/* 고정 헤더 */
.card-header {
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
}

/* 남는 영역만 스크롤 */
.card-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.ranking-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 10px;
  margin-bottom: 10px;
  background: #f8f9fa;
  transition: all 0.2s ease;
  font-size: 14px;
}

.rank-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  font-weight: 600;
  color: #333;
}

.right {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.score {
  font-weight: 700;
  font-size: 15px;
  color: #1976d2;
}

.unit {
  font-size: 12px;
  color: #888;
}

/* 1등 전용 */
.first {
  background: linear-gradient(135deg, #ffd700, #ffb300);
  color: #222;
  font-weight: 800;
  box-shadow: 0 6px 16px rgba(255, 193, 7, 0.35);
  transform: scale(1.02);
}

/* 1등 점수 색상 보정 */
.first .score {
  color: #000;
}

/* 기존 top3는 2~3등만 적용 */
.top3 {
  background: #e3f2fd;
}
</style>