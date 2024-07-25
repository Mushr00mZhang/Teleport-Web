<template>
  <section class="teleport-chat">
    <header class="teleport-chat-header"></header>
    <main class="teleport-chat-main">
      <ul class="teleport-chat-main-users">
        <template v-for="user in chatStore.users">
          <li class="teleport-chat-main-user" @click="to = user.LoginName">
            <div>{{ user.NickName }}</div>
          </li>
        </template>
      </ul>
      <ul class="teleport-chat-main-messages">
        <template v-for="msg in messages">
          <li class="teleport-chat-main-message">
            <div>{{ msg.From }}</div>
            <div>{{ msg.Time }}</div>
            <div>{{ msg.Content }}</div>
          </li>
        </template>
      </ul>
    </main>
    <footer class="teleport-chat-footer">
      <md-outlined-text-field type="textarea" label="请输入" v-model="msg"></md-outlined-text-field>
      <md-filled-tonal-button @click="send">
        发送
        <svg slot="icon" viewBox="0 0 48 48">
          <path d="M6 40V8l38 16Zm3-4.65L36.2 24 9 12.5v8.4L21.1 24 9 27Zm0 0V12.5 27Z" />
        </svg>
      </md-filled-tonal-button>
    </footer>
  </section>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useChatStore } from '@/store/chat';
import '@material/web/textfield/outlined-text-field';
import '@material/web/button/filled-tonal-button';
import { computed, ref } from 'vue';
const router = useRouter();
const chatStore = useChatStore();
const messages = computed(() => {
  return chatStore.messages.filter(
    (i) =>
      (to.value === chatStore.user.LoginName && i.From === to.value && i.To === to.value) ||
      (to.value !== chatStore.user.LoginName && (i.From === to.value || i.To === to.value))
  );
});
const msg = ref('');
const to = ref('');
const send = () => {
  if (!msg.value || !to.value) return;
  chatStore.sendMsg(msg.value, to.value);
};
// const onMessage = (e: MessageEvent) => {
//   e.data;
// };
// chatStore.on('message', onMessage);
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
    display: flex;
    &-users {
      flex: none;
      min-width: 200px;
      display: flex;
      flex-direction: column;
    }
    &-user {
    }
    &-messages {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    &-message {
    }
  }
  &-footer {
    flex: none;
  }
}
</style>
