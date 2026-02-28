<template>
  <v-app>
    <AppHeader />

    <v-main class="main-wrapper">
      <v-container fluid class="fill-height pa-0">
        <v-row no-gutters class="fill-height">

          <!-- Left -->
          <v-col cols="3" class="border-e">
            <slot name="sidebar" />
          </v-col>

          <!-- Right -->
          <v-col cols="9">
            <slot name="content" />
          </v-col>

        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<style scoped>
.border-e {
  border-right: 1px solid #e0e0e0;
}

.main-wrapper {
  height: calc(100vh - 64px);
  /* header 높이만큼 제외 */
  overflow: hidden;
}

.main-wrapper .v-container,
.main-wrapper .v-row,
.main-wrapper .v-col {
  height: 100%;
}
</style>