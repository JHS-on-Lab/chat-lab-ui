<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { defineEmits } from 'vue'

const emit = defineEmits(['game-over'])

const endGame = () => {
  if (gameOver) return
  gameOver = true
  emit('game-over', {
    score: score + 1 // 점수 보정
  })
}
const canvas = ref(null)

let ctx
let animationId
let spawnInterval
let difficultyTimer

const WIDTH = 500
const HEIGHT = 500

// ===== 난이도 변수 =====
let spawnDelay = 500
const minSpawnDelay = 50
const difficultyStep = 10

let spawnCount = 2
const maxSpawnCount = 6

let baseSpeed = 3
const maxSpeed = 10

const maxObstacles = 500

// ===== 게임 상태 =====
let player
let obstacles
let score
let gameOver
let skillCount
let lastSkillScore
let shockwave
const keys = {}

const init = () => {
  player = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    r: 10,
    speed: 8
  }

  obstacles = []
  score = 0
  gameOver = false

  skillCount = 0
  lastSkillScore = 0
  shockwave = null

  spawnDelay = 500
  spawnCount = 2
  baseSpeed = 3

  startSpawning()
}

// ===== 입력 =====
const keydown = e => {
  keys[e.key] = true

  if (gameOver && e.key === 'Enter') restart()

  if (e.code === 'Space' && skillCount > 0 && !shockwave) {
    activateSkill()
  }
}
const keyup = e => keys[e.key] = false

// ===== 충돌 =====
const isColliding = (a, b) => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy) < a.r + b.r
}

// ===== 스킬 =====
const activateSkill = () => {
  skillCount--
  shockwave = {
    x: player.x,
    y: player.y,
    r: 0,
    maxR: 600,
    speed: 20
  }
}

// ===== 장애물 생성 =====
const spawnObstacle = () => {
  if (obstacles.length > maxObstacles) return

  const radius = 6 + Math.random() * 10
  const speed = baseSpeed + Math.random() * 3
  const curve = (Math.random() - 0.5) * 0.08
  const side = Math.floor(Math.random() * 4)

  let obj = { r: radius }

  if (side === 0) {
    obj.x = Math.random() * WIDTH
    obj.y = -radius
    obj.vx = (Math.random() - 0.5) * 3
    obj.vy = speed
    obj.ax = curve
    obj.ay = 0
  } else if (side === 1) {
    obj.x = Math.random() * WIDTH
    obj.y = HEIGHT + radius
    obj.vx = (Math.random() - 0.5) * 3
    obj.vy = -speed
    obj.ax = curve
    obj.ay = 0
  } else if (side === 2) {
    obj.x = -radius
    obj.y = Math.random() * HEIGHT
    obj.vx = speed
    obj.vy = (Math.random() - 0.5) * 3
    obj.ax = 0
    obj.ay = curve
  } else {
    obj.x = WIDTH + radius
    obj.y = Math.random() * HEIGHT
    obj.vx = -speed
    obj.vy = (Math.random() - 0.5) * 3
    obj.ax = 0
    obj.ay = curve
  }

  obstacles.push(obj)
}

const spawnBatch = () => {
  for (let i = 0; i < spawnCount; i++) {
    spawnObstacle()
  }
}

// ===== 난이도 증가 =====
const startSpawning = () => {
  clearInterval(spawnInterval)
  spawnInterval = setInterval(spawnBatch, spawnDelay)
}

const increaseDifficulty = () => {
  if (spawnDelay > minSpawnDelay) spawnDelay -= difficultyStep
  if (spawnCount < maxSpawnCount) spawnCount++
  if (baseSpeed < maxSpeed) baseSpeed += 0.5
  startSpawning()
}

// ===== 업데이트 =====
const update = () => {
  if (gameOver) return

  // 이동
  if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed
  if (keys['ArrowRight'] || keys['d']) player.x += player.speed
  if (keys['ArrowUp'] || keys['w']) player.y -= player.speed
  if (keys['ArrowDown'] || keys['s']) player.y += player.speed

  player.x = Math.max(player.r, Math.min(WIDTH - player.r, player.x))
  player.y = Math.max(player.r, Math.min(HEIGHT - player.r, player.y))

  // 장애물 이동
  obstacles.forEach(o => {
    o.vx += o.ax
    o.vy += o.ay
    o.x += o.vx
    o.y += o.vy

    if (!gameOver && isColliding(player, o)) {
      endGame()
    }
  })

  // 파장 처리
  if (shockwave) {
    shockwave.r += shockwave.speed

    obstacles = obstacles.filter(o => {
      const dx = o.x - shockwave.x
      const dy = o.y - shockwave.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      return dist > shockwave.r + o.r
    })

    if (shockwave.r > shockwave.maxR) shockwave = null
  }

  obstacles = obstacles.filter(o =>
    o.x > -100 && o.x < WIDTH + 100 &&
    o.y > -100 && o.y < HEIGHT + 100
  )

  // 점수 및 스킬 획득
  score++
  if (score - lastSkillScore >= 500) {
    skillCount++
    lastSkillScore = score
  }
}

// ===== 렌더 =====
const draw = () => {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // 플레이어
  ctx.fillStyle = '#1976d2'
  ctx.beginPath()
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2)
  ctx.fill()

  // 장애물
  ctx.fillStyle = '#111'
  obstacles.forEach(o => {
    ctx.beginPath()
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2)
    ctx.fill()
  })

  // 파장
  if (shockwave) {
    ctx.strokeStyle = 'rgba(0,0,255,0.4)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(shockwave.x, shockwave.y, shockwave.r, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.fillStyle = '#000'
  ctx.font = '16px Arial'
  ctx.fillText(`Score: ${score}`, 10, 20)
  ctx.fillText(`Skill: ${skillCount}`, 10, 40)

  if (gameOver) {
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

const restart = () => init()

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  init()

  window.addEventListener('keydown', keydown)
  window.addEventListener('keyup', keyup)

  difficultyTimer = setInterval(increaseDifficulty, 5000)
  loop()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  clearInterval(spawnInterval)
  clearInterval(difficultyTimer)
  window.removeEventListener('keydown', keydown)
  window.removeEventListener('keyup', keyup)
})
</script>

<template>
  <div style="display:flex;justify-content:center;align-items:center;height:100%;">
    <canvas ref="canvas" :width="WIDTH" :height="HEIGHT" style="border:1px solid #ddd"></canvas>
  </div>
</template>