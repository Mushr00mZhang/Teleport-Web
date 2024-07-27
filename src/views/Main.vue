<template>
  <section class="teleport-chat">
    <section class="teleport-chat-aside">
      <section class="teleport-chat-users">
        <template v-for="user in chatStore.users">
          <div
            :class="[
              'teleport-chat-user',
              { 'teleport-chat-user-selected': to === user.LoginName },
            ]"
            @click="selectUser(user)"
          >
            <div
              :class="[
                'teleport-chat-user-avatar',
                { 'teleport-chat-user-avatar-offline': !user.Status },
              ]"
            ></div>
            <div class="teleport-chat-user-info">
              <div class="teleport-chat-user-nick-name">{{ user.NickName }}</div>
              <div
                :class="[
                  'teleport-chat-user-last-msg',
                  { 'teleport-chat-user-last-msg-unread': !user.LastMsg?.Read },
                ]"
              >
                {{
                  (user.LastMsg?.Type === 'text' && user.LastMsg?.Content) ||
                  (user.LastMsg?.Type === 'file' && user.LastMsg?.Content.Name) ||
                  ''
                }}
              </div>
            </div>
          </div>
        </template>
      </section>
    </section>
    <section class="teleport-chat-main">
      <section class="teleport-chat-messages">
        <template v-for="msg in messages">
          <div
            :class="[
              'teleport-chat-message',
              { 'teleport-chat-message-self': msg.From === chatStore.user.LoginName },
            ]"
          >
            <!-- <div>{{ msg.From }}</div> -->
            <div class="teleport-chat-message-time">{{ formatTime(msg.Time) }}</div>
            <div class="teleport-chat-message-content" v-if="msg.Type === 'text'">
              {{ msg.Content }}
            </div>
            <div class="teleport-chat-message-file" v-if="msg.Type === 'file'">
              {{ msg.Content.Name }}
            </div>
          </div>
        </template>
      </section>
      <section class="teleport-chat-input">
        <md-outlined-text-field
          type="textarea"
          label="请输入"
          v-model="msg"
        ></md-outlined-text-field>
        <md-filled-tonal-button @click="send">
          发送
          <svg slot="icon" viewBox="0 0 48 48">
            <path d="M6 40V8l38 16Zm3-4.65L36.2 24 9 12.5v8.4L21.1 24 9 27Zm0 0V12.5 27Z" />
          </svg>
        </md-filled-tonal-button>
        <md-filled-tonal-button @click="selectFile">
          文件
          <svg slot="icon" viewBox="0 0 48 48">
            <path d="M6 40V8l38 16Zm3-4.65L36.2 24 9 12.5v8.4L21.1 24 9 27Zm0 0V12.5 27Z" />
          </svg>
        </md-filled-tonal-button>
      </section>
    </section>
  </section>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useChatStore, type User } from '@/store/chat';
import '@material/web/textfield/outlined-text-field';
import '@material/web/button/filled-tonal-button';
import { computed, ref } from 'vue';
import { MyFile } from '@/models/file';
const router = useRouter();
const chatStore = useChatStore();
const messages = computed(() => {
  return chatStore.messages
    .sort((a, b) => a.Time.getTime() - b.Time.getTime())
    .filter(
      (i) =>
        (to.value === chatStore.user.LoginName && i.From === to.value && i.To === to.value) ||
        (to.value !== chatStore.user.LoginName && (i.From === to.value || i.To === to.value))
    );
});
const msg = ref('');
const to = ref('');
const selectUser = (user: User) => {
  to.value = user.LoginName;
  for (const msg of messages.value) {
    msg.Read = true;
  }
};
const send = () => {
  if (!msg.value || !to.value) return;
  chatStore.sendMsg(msg.value, to.value);
};
const selectFile = async () => {
  if (!to.value) return;
  const _to = to.value;
  const input = document.createElement('input');
  input.type = 'file';
  input.click();
  await new Promise((r) => input.addEventListener('change', r));
  if (input.files && input.files.length) {
    console.log(input.files);
    for (const file of input.files) {
      const myFile = new MyFile(file);
      await myFile.split();
      console.log(myFile);
      chatStore.sendFile(myFile, _to);
    }
  }
  input.remove();
};
const formatTime = (time: Date) => {
  return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${String(
    time.getHours()
  ).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(
    time.getSeconds()
  ).padStart(2, '0')}`;
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
  --chat-aside-width: 200px;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: var(--chat-aside-width, 200px) auto;
  overflow: hidden;
  &-aside {
    display: flex;
    flex-direction: column;
  }
  &-users {
    flex: auto;
    display: flex;
    flex-direction: column;
    overflow: hidden auto;
  }
  &-user {
    display: grid;
    grid-template-columns: 32px auto;
    grid-column-gap: 8px;
    padding: 8px;
    border-radius: 4px;
    &:hover {
      background-color: #eee;
    }
    &-selected {
      background-color: #ddd;
    }
    &-avatar {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      background-image: url('src/assets/logo.svg');
      background-size: contain;
      background-repeat: no-repeat;
      &-offline {
        filter: grayscale(1);
      }
    }
    &-info {
      line-height: 1;
      text-wrap: nowrap;
      overflow: hidden;
    }
    &-nick-name {
      width: 100%;
      font-size: 16px;
      font-weight: bold;
      line-height: 18px;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    &-last-msg {
      width: 100%;
      font-size: 14px;
      color: #aaa;
      text-overflow: ellipsis;
      overflow: hidden;
      &-unread {
        color: orange;
      }
    }
  }
  &-main {
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  &-messages {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 8px;
  }
  &-message {
    &-self {
      text-align: right;
    }
    &-time {
      color: #aaa;
      font-size: 14px;
    }
    &-content {
    }
  }
}
</style>
