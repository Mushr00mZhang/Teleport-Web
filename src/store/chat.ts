import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
export type Message = {
  Type: 'login' | 'logoff' | 'rename' | 'text' | 'file';
  Content: string;
  From: string;
  To: string;
  Time: Date;
};
export type User = {
  LoginName: string;
  NickName: string;
  Status: 0 | 1;
};
export const useChatStore = defineStore('ws', () => {
  const ws = ref<WebSocket>();
  const messages = reactive<Message[]>([]);
  const users = reactive<User[]>([]);
  const init = (n: WebSocket) => {
    ws.value = n;
    ws.value.addEventListener('open', onOpen);
    ws.value.addEventListener('message', onMessage);
    ws.value.addEventListener('close', onClose);
  };
  const onOpen = (e: Event) => {
    console.log('open', e);
  };
  const onMessage = (e: MessageEvent) => {
    console.log('message', e);
    try {
      const msg: Message = JSON.parse(e.data);
      msg.Time = new Date(msg.Time);
      switch (msg.Type) {
        case 'login':
          break;
        case 'logoff':
          break;
        case 'rename':
          break;
        case 'file':
          messages.unshift(msg);
        case 'text':
          messages.unshift(msg);
          break;
        default:
          break;
      }
    } catch {}
  };
  const onClose = (e: CloseEvent) => {
    console.log('close', e);
    // 关闭连接
    if (ws.value) ws.value.close();
    // 重置变量
    ws.value = undefined;
  };
  const on = (type: 'open' | 'message' | 'close', cb: (e: Event) => any) => {
    if (!ws.value) return false;
    ws.value.addEventListener(type, cb);
    return true;
  };
  const once = (type: 'open' | 'message' | 'close', cb: (e: Event) => any) => {
    if (!ws.value) return false;
    const ncb = (e: Event) => {
      cb(e);
      ws.value?.removeEventListener(type, ncb);
    };
    ws.value.addEventListener(type, ncb);
    return true;
  };
  return { init, messages, users, on, once };
});
