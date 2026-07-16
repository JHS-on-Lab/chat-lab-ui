<template>
  <div class="empty-state">
    <v-icon size="48" color="grey">mdi-folder-open-outline</v-icon>
    <p>폴더를 선택하거나 새로 만들어주세요.</p>
  </div>
</template>

<style scoped>
.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: grey;
}
</style>
