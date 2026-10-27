<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['game-over'])
const canvas = ref(null)

let ctx
let animationId
let timerInterval

const WIDTH = 500
const HEIGHT = 500
const PENALTY_TIME = 3

// ===== 상태 =====
let waiting = true
let gameOver = false
let score = 0
let timeLeft = 30

let grid = []
let currentIndex = 0
let gridCount = 0
let flash = 0

// ===== 초기화 =====
const init = () => {
  score = 0
  timeLeft = 30
  gameOver = false
  gridCount = 0
  generateGrid()

  timerInterval = setInterval(() => {
    timeLeft--
    if (timeLeft <= 0) {
      timeLeft = 0
      endGame()
    }
  }, 1000)
}

// ===== 종료 =====
const endGame = () => {
  if (gameOver) return
  gameOver = true
  clearInterval(timerInterval)

  emit('game-over', { score })
}

// ===== 그리드 생성 =====
const generateGrid = () => {
  grid = []
  gridCount++

  const activeKeys = gridCount >= 5
    ? ['A', 'S', 'D', 'F']
    : ['A', 'S', 'D']

  // 균등 확률
  for (let i = 0; i < 9; i++) {
    const index = Math.floor(Math.random() * activeKeys.length)
    grid.push(activeKeys[index])
  }

  currentIndex = 0
}

// ===== 입력 =====
const keydown = (e) => {
  if (waiting && e.key === 'Enter') {
    waiting = false
    init()
    loop()
    return
  }

  if (gameOver && e.key === 'Enter') {
    waiting = false
    init()
    return
  }

  if (gameOver) return

  const input = e.key.toUpperCase()

  const activeKeys = gridCount >= 5
    ? ['A', 'S', 'D', 'F']
    : ['A', 'S', 'D']

  if (input === grid[currentIndex]) {
    score++
    currentIndex++

    if (currentIndex >= 9) {
      generateGrid()
    }
  }
  else if (activeKeys.includes(input)) {
    timeLeft -= PENALTY_TIME
    flash = 10

    if (timeLeft <= 0) {
      timeLeft = 0
      endGame()
    }
  }
}

// ===== 업데이트 =====
const update = () => {
  if (waiting || gameOver) return
}

// ===== 렌더 =====
const draw = () => {
  if (waiting) {
    ctx.font = '28px Arial'
    ctx.fillText('Press Enter to Start', WIDTH / 2 - 120, HEIGHT / 2)
    return
  }

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // 오입력 플래시
  if (flash > 0) {
    ctx.fillStyle = 'rgba(255,0,0,0.2)'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    flash--
  }

  ctx.fillStyle = '#000'
  ctx.font = '16px Arial'
  ctx.fillText(`Score: ${score}`, 10, 20)
  ctx.fillText(`Time: ${timeLeft}`, 420, 20)


  const CELL = 120
  const GRID_SIZE = 3
  const GAP = 10

  const totalGridWidth = GRID_SIZE * CELL - GAP
  const totalGridHeight = GRID_SIZE * CELL - GAP

  const OFFSET_X = (WIDTH - totalGridWidth) / 2
  const OFFSET_Y = (HEIGHT - totalGridHeight) / 2

  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3)
    const col = i % 3
    const x = OFFSET_X + col * CELL
    const y = OFFSET_Y + row * CELL
    const key = grid[i]

    if (i < currentIndex) {
      ctx.fillStyle = '#eeeeee'
    }
    else if (i === currentIndex) {
      ctx.fillStyle = '#4caf50'
    }
    else {
      ctx.fillStyle = '#e0e0e0'
    }

    ctx.fillRect(x, y, CELL - 10, CELL - 10)

    if (i >= currentIndex) {
      ctx.fillStyle = '#000'
      ctx.font = '36px Arial'
      ctx.fillText(key, x + 40, y + 70)
    }
  }

  if (gameOver) {
    ctx.fillStyle = '#000'
    ctx.font = '28px Arial'
    ctx.fillText('GAME OVER', WIDTH / 2 - 90, HEIGHT / 2)
    ctx.font = '16px Arial'
    ctx.fillText('Press Enter to Restart', WIDTH / 2 - 95, HEIGHT / 2 + 40)
  }
}

// ===== 루프 =====
const loop = () => {
  update()
  draw()
  animationId = requestAnimationFrame(loop)
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  window.addEventListener('keydown', keydown)
  draw()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  clearInterval(timerInterval)
  window.removeEventListener('keydown', keydown)
})
</script>

<template>
  <div style="display:flex;justify-content:center;align-items:center;height:100%;">
    <canvas ref="canvas" :width="WIDTH" :height="HEIGHT" style="border:1px solid #ddd" />
  </div>
</template>