import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
export type SendMsg = {
  Type: 'getUsers' | 'rename' | 'text' | 'file';
  Content: string;
  From: string;
  To: string;
};
export type Message =
  | {
      Type: 'login' | 'logoff' | 'rename' | 'text' | 'file';
      Content: string;
      From: string;
      To: string;
      Time: Date;
    }
  | {
      Type: 'users';
      Content: User[];
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
  const user: User = {
    LoginName: '',
    NickName: '',
    Status: 0,
  };
  const ws = ref<WebSocket>();
  const messages = reactive<Message[]>([]);
  const users = reactive<User[]>([]);
  const login = (loginName: string, nickName: string) => {
    const search = new URLSearchParams();
    search.set('LoginName', loginName);
    search.set('NickName', nickName);
    const url = `api/login?${search}`;
    ws.value = new WebSocket(url);
    ws.value.addEventListener('open', () => {
      user.LoginName = loginName;
      user.NickName = nickName;
      getUsers();
    });
    ws.value.addEventListener('message', onMessage);
    ws.value.addEventListener('close', onClose);
  };
  const sendMsg = (content: string, to: string) => {
    if (!ws.value) return false;
    const msg: SendMsg = {
      Type: 'text',
      Content: content,
      From: user.LoginName,
      To: to,
    };
    ws.value.send(JSON.stringify(msg));
    messages.push({
      Type: 'text',
      Content: msg.Content,
      From: msg.From,
      To: msg.To,
      Time: new Date(),
    });
    return true;
  };
  const getUsers = () => {
    if (!ws.value) return false;
    const msg: SendMsg = {
      Type: 'getUsers',
      Content: '',
      From: user.LoginName,
      To: 'server',
    };
    ws.value.send(JSON.stringify(msg));
    return true;
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
          users.push({
            LoginName: msg.From,
            NickName: msg.Content,
            Status: 1,
          });
          break;
        case 'logoff':
          break;
        case 'users':
          users.splice(0);
          users.push(...msg.Content);
          break;
        case 'rename':
          break;
        case 'file':
          messages.push(msg);
        case 'text':
          messages.push(msg);
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
  return { ws, login, sendMsg, messages, user, getUsers, users, on, once };
});
