<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'

const router = useRouter()
const route = useRoute()
const { smAndDown } = useDisplay()

const games = [
  { name: 'Dodge', path: '/game/dodge' }
]

const go = (path) => {
  router.push(path)
}
</script>

<template>
  <v-list density="compact">

    <v-list-item v-for="game in games" :key="game.path" :active="route.path === game.path" @click="go(game.path)" link>
      <v-list-item-title class="d-flex align-center justify-center">
        <v-icon start size="x-small">mdi-gamepad-variant</v-icon>
        <span v-if="!smAndDown">{{ game.name }}</span>
      </v-list-item-title>
    </v-list-item>

  </v-list>
</template>