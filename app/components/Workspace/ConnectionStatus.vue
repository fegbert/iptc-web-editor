<script setup lang="ts">
const { isConnected } = useWorkspaceSync()
</script>

<template>
  <span v-if="isConnected" class="status connected" />
  <span v-else class="status disconnected" />
</template>

<style scoped>
.status {
  @apply relative inline-block w-[12px] h-[12px] rounded-[50%] m-[6px];

  &.connected, &.connected:before {
    background: var(--color-green-500);
  }

  &.disconnected, &.disconnected:before {
    background: var(--color-red-500);
  }

  &:before {
    @apply block absolute left-[-1px] top-[-1px] w-[14px] h-[14px] rounded-[50%];
    content: '';
    animation: pulse 3s infinite ease-in;
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }

  50% {
    transform: scale(1.5);
    opacity: 0;
  }

  100% {
    transform: scale(0.5);
    opacity: 0;
  }
}
</style>
