<template>
  <div id="top">
    <button @click="joinPrompt" title="Join channel">
      <font-awesome-icon icon="plus-square"></font-awesome-icon>
    </button>
    <div id="user">
      <div v-if="username">
        <span>{{ username }}</span>
        <button @click="logOut" title="Log out">
          <font-awesome-icon icon="sign-out-alt"></font-awesome-icon>
        </button>
      </div>
      <div v-else>
        <span>Not logged in</span>
      </div>
    </div>
  </div>

  <splitpanes
    vertical
    @resize="resizeView"
    class="default-theme"
    style="height: 100%"
  >
    <pane v-for="c in channels" :key="c">
      <div class="container">
        <div class="infobar">
          <InfoBar :channel="c" @close_chat="close" />
        </div>
        <div class="chat">
          <iframe
            class="chat_iframe"
            :src="`https://www.twitch.tv/embed/${c}/chat?parent=localhost`"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals allow-storage-access-by-user-activation"
          >
          </iframe>
        </div>
      </div>
    </pane>
  </splitpanes>
  <div id="notice" v-show="!username" @click="login">
    <span>Login to chat</span>
  </div>
  <h2 id="titletext">Twitch MultiChat</h2>
</template>

<script>
import InfoBar from './InfoBar.vue';
import {Splitpanes, Pane} from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

export default {
  name: 'App',
  components: {
    InfoBar,
    Splitpanes,
    Pane,
  },
  mounted() {
    this.getUser();
    window.myApi.receive('joined_channel', (channel) => {
      this.channels.push(channel);
    });
    window.myApi.receive('refresh_user', (e) => {
      this.getUser();
      let iframes = document.getElementsByClassName('chat_iframe');
      for (const ifr of iframes) {
        ifr.src = ifr.src;
      }
    });
  },
  data() {
    return {
      username: null,
      channels: [],
    };
  },
  methods: {
    getUser() {
      console.log('checking user status');
      window.myApi.getUser().then((name) => {
        this.username = name;
      });
    },
    joinPrompt() {
      window.myApi.send('sub_window', 'join');
    },
    logOut() {
      window.myApi.send('log_out');
      this.getUser();
    },
    close(channel) {
      console.log('close this: ', channel);
      const ix = this.channels.findIndex((c) => c === channel);
      this.channels.splice(ix, 1);
      window.myApi.send('close_chat', ix);
    },
    login() {
      console.log('attempting login');
      window.myApi.send('sub_window', 'login');
    },
  },
};
</script>

<style>
html {
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to top left,
    rgba(0, 0, 0, 1) 0%,
    rgba(100, 65, 164, 1) 100%
  );
}

body {
  margin: 1px;
  height: inherit;
}

#top {
  display: flex;
  justify-content: space-between;
}

#user {
  color: rgb(255, 255, 255);
}

.splitpanes.default-theme .splitpanes__pane {
  background-color: rgba(1, 1, 1, 0);
}

#titletext {
  z-index: -1;
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0 auto;
  transform: translate(-50%, -50%);
  color: rgb(255, 255, 255);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: inherit;
}

button {
  width: fit-content;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.infobar {
  display: flex;
  flex-direction: row;
  height: 70px;
  margin: 10px 0px;
  padding: 0;
}

.infobar > * {
  flex: 1 1 0;
}

.chat {
  flex: 1 1 auto;
  display: flex;
}

iframe {
  flex: 1 1 auto;
  border-style: ridge;
  border-width: thin;
  border-color: darkmagenta;
}

#notice {
  position: absolute;
  bottom: 0;
  background-color: rgb(0, 0, 0);
  height: 94px;
  width: 100%;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

#notice > span {
  color: rgb(255, 255, 255);
  font-size: 2rem;
}
</style>
