<template>
  <section class="teleport-chat">
    <section class="teleport-chat-aside">
      <section class="teleport-chat-users scrolbar">
        <template v-for="user in users">
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
              <div class="teleport-chat-user-nick-name">
                {{ user.LoginName === chatStore.user.LoginName ? '自己' : user.NickName }}
              </div>
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
      <section class="teleport-chat-messages scrolbar">
        <template v-for="msg in messages">
          <div
            :class="[
              'teleport-chat-message',
              { 'teleport-chat-message-self': msg.From === chatStore.user.LoginName },
            ]"
          >
            <div class="teleport-chat-message-time">{{ formatTime(msg.Time) }}</div>
            <template v-if="msg.Type === 'text'">
              <div class="teleport-chat-message-content">
                {{ msg.Content }}
              </div>
            </template>
            <template v-if="msg.Type === 'file'">
              <div class="teleport-chat-message-file">
                <div class="teleport-chat-message-prefix">
                  <md-circular-progress
                    :class="[
                      'teleport-chat-message-progress',
                      { 'teleport-chat-message-progress-hidden': msg.Progress >= 1 },
                    ]"
                    :id="`${msg.Content.Id}-progress`"
                    :value="msg.Progress"
                  />
                  <md-icon
                    :class="[
                      'teleport-chat-message-progress-completed',
                      { 'teleport-chat-message-progress-completed-hidden': msg.Progress < 1 },
                    ]"
                  >
                    check_circle
                  </md-icon>
                </div>
                <a
                  class="teleport-chat-message-content teleport-chat-message-content-file"
                  :href="msg.Content.Url"
                  :download="msg.Content.Name"
                >
                  <img
                    v-if="msg.Content.Type?.includes('image')"
                    class="teleport-chat-message-content-file-image"
                    :src="msg.Content.Url"
                    :title="msg.Content.Name"
                  />
                  <span v-else>{{ msg.Content.Name }}</span>
                </a>
              </div>
            </template>
          </div>
        </template>
      </section>
      <section class="teleport-chat-input">
        <div class="teleport-chat-input-tools">
          <md-icon-button
            class="teleport-chat-input-tool teleport-chat-input-tool-send-file"
            @click="selectFile"
          >
            <md-icon>upload_file</md-icon>
          </md-icon-button>
        </div>
        <md-outlined-text-field
          class="teleport-chat-input-message"
          type="textarea"
          label="请输入"
          v-model="msg"
        ></md-outlined-text-field>
        <md-filled-icon-button class="teleport-chat-input-send-message" @click="send">
          <md-icon>send</md-icon>
        </md-filled-icon-button>
      </section>
    </section>
  </section>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useChatStore, type User } from '@/store/chat';
import '@material/web/textfield/outlined-text-field';
import '@material/web/button/filled-tonal-button';
import '@material/web/icon/icon';
import '@material/web/iconbutton/icon-button';
import '@material/web/iconbutton/filled-icon-button';
import '@material/web/progress/circular-progress';
import { computed, ref } from 'vue';
import { MyFile } from '@/models/file';
import type { ChunkedBuffer } from '@/workers/filesplit';
import type { MdCircularProgress } from '@material/web/progress/circular-progress';
const router = useRouter();
const chatStore = useChatStore();
const users = computed(() => {
  return chatStore.users.sort((a, b) => {
    // 自己排第一
    if (a.LoginName === chatStore.user.LoginName) return -1;
    else if (b.LoginName === chatStore.user.LoginName) return 1;
    // 状态排序
    else if ((a.Status || 0) !== (b.Status || 0)) return (b.Status || 0) - (a.Status || 0);
    // 时间排序
    else if ((a.LastMsg?.Time.getTime() || 0) !== (b.LastMsg?.Time.getTime() || 0))
      return (b.LastMsg?.Time.getTime() || 0) - (a.LastMsg?.Time.getTime() || 0);
    // 名称排序
    else return a.NickName.localeCompare(b.NickName);
  });
});
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
  msg.value = '';
};
const selectFile = async () => {
  if (!to.value) return;
  const _to = to.value;
  const input = document.createElement('input');
  input.type = 'file';
  input.click();
  await new Promise((r) => input.addEventListener('change', r));
  if (input.files && input.files.length) {
    // console.log(input.files);
    for (const file of input.files) {
      const myFile = new MyFile(file);
      // console.log(myFile.name, myFile.id, myFile.isImage);
      chatStore.sendFile(myFile, _to);
      const fileMsg = messages.value.find((i) => i.Type === 'file' && i.Content.Id === myFile.id);
      if (!fileMsg || fileMsg.Type !== 'file') continue;
      fileMsg.Content.Url = URL.createObjectURL(file);
      let cnt = 0;
      await myFile.split((chunk: ChunkedBuffer) => {
        cnt++;
        chatStore.sendFileChunk(chunk, _to);
        fileMsg.Progress = cnt / myFile.count;
      });
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
$block-spacing: 8px;
.scrolbar {
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #8b8b8b;
    &:hover {
      background: #606060;
    }
  }
}
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
    background: #fafafa;
    padding: $block-spacing;
    overflow: hidden;
  }
  &-users {
    flex: auto;
    display: flex;
    flex-direction: column;
    overflow: hidden auto;
    gap: $block-spacing;
  }
  &-user {
    flex: none;
    display: grid;
    grid-template-columns: 32px auto;
    grid-column-gap: $block-spacing;
    padding: $block-spacing;
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
      background-image: url('@/assets/logo.svg');
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
    background: #f0f0f0;
  }
  &-messages {
    flex: auto;
    display: flex;
    flex-direction: column;
    padding: $block-spacing;
    overflow: hidden auto;
    gap: $block-spacing;
  }
  &-message {
    flex: none;
    display: flex;
    flex-direction: column;
    line-break: anywhere;
    white-space: pre-wrap;
    align-items: flex-start;
    &-self {
      align-items: flex-end;
      .#{$prefix-class}-message-file {
        justify-content: flex-end;
      }
    }
    &-time {
      color: #aaa;
      font-size: 14px;
      margin-bottom: 4px;
      line-height: 24px;
    }
    &-content {
      padding: $block-spacing $block-spacing + 4px;
      border-radius: $block-spacing;
      background: #fff;
      &-file {
        display: block;
        &-image {
          height: max(240px, 40vh);
          display: block;
        }
      }
    }
    &-file {
      display: flex;
    }
    &-prefix {
      position: relative;
    }
    &-progress {
      --md-circular-progress-size: 28px;
      margin-top: 6px;
      margin-right: 2px;
      opacity: 1;
      transition: opacity 0.5s linear;
      position: absolute;
      top: 0;
      right: 0;
      &-hidden {
        opacity: 0;
      }
      &-completed {
        --md-icon-size: 24px;
        margin-top: 8px;
        margin-right: 4px;
        color: green;
        opacity: 1;
        transition: opacity 0.5s linear;
        position: absolute;
        top: 0;
        right: 0;
        &-hidden {
          opacity: 0;
        }
      }
    }
  }
  &-input {
    flex: none;
    padding: $block-spacing;
    position: relative;
    &-tools {
      display: flex;
    }
    &-tool {
    }
    &-message {
      width: 100%;
      height: 120px;
      resize: none;
      margin-top: $block-spacing;
    }
    &-send-message {
      position: absolute;
      right: 20px;
      bottom: 20px;
    }
  }
}
</style>
