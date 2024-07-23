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
const client = reactive({
  url: 'ws://127.0.0.1:3000/ws',
  loginName: '',
  nickName: '',
});
const login = async () => {
  const search = new URLSearchParams();
  search.set('LoginName', client.loginName);
  search.set('NickName', client.nickName);
  const url = `${client.url}?${search}`;
  // const res = fetch(url);
  // return;
  const ws = new WebSocket(url);
  ws.addEventListener('open', (e) => {
    console.log('open', e);
    // ws.send(
    //   JSON.stringify({ Type: 'text', Content: 'This is 1111', From: 'Mushr00m', To: 'Mushr00m' })
    // );
  });
  ws.addEventListener('message', (e) => {
    console.log('message', e);
    try {
      const msg = JSON.parse(e.data);
      console.log(msg);
    } catch {}
  });
  ws.addEventListener('close', (e) => {
    console.log('close', e);
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
