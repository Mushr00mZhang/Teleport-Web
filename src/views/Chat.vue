<template>
  <section class="teleport-chat">
    <header class="teleport-chat-header"></header>
    <main class="teleport-chat-main">
      <ul>
        <template v-for="msg in chatStore.messages">
          <li>
            <div>{{ msg.From }}</div>
            <div>{{ msg.Time }}</div>
            <div>{{ msg.Content }}</div>
          </li>
        </template>
      </ul>
    </main>
    <footer class="teleport-chat-footer"></footer>
  </section>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useChatStore } from '@/store/chat';
const router = useRouter();
const chatStore = useChatStore();
const onClose = (e: Event) => {
  alert('服务器已断开');
  router.push('/login');
};
chatStore.once('close', onClose);
</script>
<style lang="scss">
$prefix-class: 'teleport-chat';
.#{$prefix-class} {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  &-header {
    flex: none;
  }
  &-main {
    flex: 1;
    overflow: hidden;
  }
  &-footer {
    flex: none;
  }
}
</style>
