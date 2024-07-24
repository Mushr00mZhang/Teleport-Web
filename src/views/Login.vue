<template>
  <section class="teleport-login">
    <header class="teleport-login-header"></header>
    <main class="teleport-login-main">
      <form @submit.prevent="login">
        <md-outlined-text-field label="登录名" v-model="client.loginName"></md-outlined-text-field>
        <md-outlined-text-field label="昵称" v-model="client.nickName"></md-outlined-text-field>
        <md-filled-button type="submit">登录</md-filled-button>
      </form>
    </main>
    <footer class="teleport-login-footer"></footer>
  </section>
</template>
<script setup lang="ts">
import '@material/web/textfield/outlined-text-field';
import '@material/web/button/filled-button';
import { reactive } from 'vue';
import { useChatStore } from '@/store/chat';
import { useRouter } from 'vue-router';
const router = useRouter();
const chatStore = useChatStore();
const client = reactive({
  url: 'ws://127.0.0.1:8889/login',
  loginName: '',
  nickName: '',
});
const login = async () => {
  const search = new URLSearchParams();
  search.set('LoginName', client.loginName);
  search.set('NickName', client.nickName);
  const url = `${client.url}?${search}`;
  const ws = new WebSocket(url);
  chatStore.init(ws);
  router.push({
    name: 'chat',
  });
};
</script>
<style lang="scss">
$prefix-class: 'teleport-login';
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
