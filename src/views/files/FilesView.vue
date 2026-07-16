<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import FolderSidebar from '@/components/files/FolderSidebar.vue'
</script>

<template>
    <DefaultLayout>
        <template #sidebar>
            <FolderSidebar />
        </template>

        <template #content>
            <router-view />
        </template>
    </DefaultLayout>
</template>
