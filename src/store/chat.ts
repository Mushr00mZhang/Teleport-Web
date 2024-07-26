import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
export type SendMsg = {
  Type: 'getUsers' | 'rename' | 'text' | 'file';
  Content: string;
  From: string;
  To: string;
};
type BaseMsg = {
  From: string;
  To: string;
  Time: Date;
};
type LogMsg = {
  Type: 'login' | 'logoff';
  Content: string;
} & BaseMsg;
type RenameMsg = {
  Type: 'rename';
  Content: string;
} & BaseMsg;
type TextMsg = {
  Type: 'text';
  Content: string;
  Read: boolean;
} & BaseMsg;
type FileMsg = {
  Type: 'file';
  Content: {
    Url: string;
    Name: string;
    Ext: string;
  };
  Read: boolean;
} & BaseMsg;
type UsersMsg = {
  Type: 'users';
  Content: User[];
} & BaseMsg;
export type Message = TextMsg | FileMsg | UsersMsg | LogMsg | RenameMsg;
export type User = {
  LoginName: string;
  NickName: string;
  Status: 0 | 1;
  LastMsg?: TextMsg | FileMsg;
};
export const useChatStore = defineStore('ws', () => {
  const user: User = {
    LoginName: '',
    NickName: '',
    Status: 0,
  };
  const ws = ref<WebSocket>();
  const messages = reactive<(TextMsg | FileMsg)[]>([]);
  const users = reactive<User[]>([]);
  const login = (loginName: string, nickName: string) => {
    const search = new URLSearchParams();
    search.set('LoginName', loginName);
    search.set('NickName', nickName);
    const url = `${document.head.baseURI.replace(/http(s*)/, 'ws').trimEnd()}api/login?${search}`;
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
      Read: true,
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
          {
            let user = users.find((i) => i.LoginName === msg.From);
            if (!user) {
              user = {
                LoginName: msg.From,
                NickName: msg.Content,
                Status: 1,
                LastMsg: [...messages]
                  .sort((a, b) => b.Time.getTime() - a.Time.getTime())
                  .find(
                    (i) =>
                      (i.Type === 'text' || i.Type === 'file') &&
                      (i.From === msg.From || i.To === msg.From)
                  ) as TextMsg | FileMsg,
              };
              users.push(user);
            }
            user.NickName = msg.Content;
            user.Status = 1;
          }
          break;
        case 'logoff':
          {
            let user = users.find((i) => i.LoginName === msg.From);
            if (!user) {
              user = {
                LoginName: msg.From,
                NickName: msg.Content,
                Status: 0,
                LastMsg: [...messages]
                  .sort((a, b) => b.Time.getTime() - a.Time.getTime())
                  .find(
                    (i) =>
                      (i.Type === 'text' || i.Type === 'file') &&
                      (i.From === msg.From || i.To === msg.From)
                  ) as TextMsg | FileMsg,
              };
              users.push(user);
            }
            user.NickName = msg.Content;
            user.Status = 0;
          }
          break;
        case 'users':
          users.splice(0);
          users.push(...msg.Content);
          break;
        case 'rename':
          break;
        case 'file':
        // messages.push(msg);
        // break;
        case 'text':
          // // 发送给自己的消息，标记为未读
          // if (msg.To === user.LoginName) {
          //   msg.Read = false;
          // }
          messages.push(msg);
          // 设置用户最新消息
          for (const user of users) {
            if (msg.From === user.LoginName) {
              user.LastMsg = msg;
            }
          }
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
