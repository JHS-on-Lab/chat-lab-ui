<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import GameSidebar from '@/components/game/GameSidebar.vue'
</script>

<template>
    <DefaultLayout>
        <template #sidebar>
            <GameSidebar />
        </template>

        <template #content>
            <router-view />
        </template>
    </DefaultLayout>
</template>
