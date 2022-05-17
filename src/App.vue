<template>
  <div id="top">
    <form id="join" @submit.prevent="joinChannel">
      <input type="text" id="joinField" v-model="joinField" />
      <button title="Join channel" id="joinButton" type="submit">
        <font-awesome-icon icon="plus-square"></font-awesome-icon>
      </button>
    </form>
    <div id="user">
      <div v-if="username">
        <span>{{ username }}</span>
        <button @click="logOut" title="Sign out">
          <font-awesome-icon icon="sign-out-alt"></font-awesome-icon>
        </button>
      </div>
      <div v-else @click="signIn">
        <span>Sign in</span>
      </div>
    </div>
  </div>
  <div class="my-splitter" v-if="this.channels.length"></div>
  <splitpanes
    vertical
    @resize="disableMouse"
    @resized="enableMouse"
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
            :class="{
              disableMouse: disableMouseEvents,
              enableMouse: !disableMouseEvents,
            }"
            :src="`https://www.twitch.tv/embed/${c}/chat?parent=localhost`"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals allow-storage-access-by-user-activation"
          >
          </iframe>
        </div>
      </div>
    </pane>
  </splitpanes>
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
  data() {
    return {
      disableMouseEvents: false,
      joinField: '',
      username: null,
      channels: [],
    };
  },
  mounted() {
    document.title = 'Twitch Multi Chat';
    this.getUser();
    window.myApi.receive('refresh_user', (e) => {
      this.getUser();
      let iframes = document.getElementsByClassName('chat_iframe');
      for (const ifr of iframes) {
        ifr.src = ifr.src;
      }
    });
  },
  methods: {
    getUser() {
      console.log('checking user status');
      window.myApi.request('user_info').then((name) => {
        this.username = name;
      });
    },
    joinChannel() {
      if (this.joinField) {
        console.log('joining: ' + this.joinField);
        this.channels.push(this.joinField);
        this.joinField = '';
      }
    },
    signOut() {
      window.myApi.send('sign_out');
      this.getUser();
    },
    close(channel) {
      console.log('close this: ', channel);
      const ix = this.channels.findIndex((c) => c === channel);
      this.channels.splice(ix, 1);
    },
    signIn() {
      console.log('attempting login');
      window.myApi.send('sign_in');
    },
    disableMouse() {
      this.disableMouseEvents = true;
    },
    enableMouse() {
      this.disableMouseEvents = false;
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

#joinField {
  width: 100px;
  border: 1px solid black;
}

#user {
  color: rgb(255, 255, 255);
}

#user:hover {
  cursor: pointer;
}

.my-splitter {
  width: 100%;
  height: 7px;
  margin: 0;
  background: linear-gradient(180deg, black, #a800ff, black);
}

.splitpanes.default-theme .splitpanes__pane {
  background-color: rgba(1, 1, 1, 0);
  min-width: 290px;
}

.default-theme .splitpanes--vertical > .splitpanes__splitter,
.default-theme.splitpanes--vertical > .splitpanes__splitter {
  width: 7px;
  /* border-left: 1px solid #eee; */
  margin: 0;
  background: linear-gradient(90deg, black, #a800ff, black);
}

.default-theme .splitpanes--vertical > .splitpanes__splitter,
.default-theme.splitpanes--vertical > .splitpanes__splitter {
  border: none;
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
  background-color: white;
}

button:hover {
  cursor: pointer;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.infobar {
  display: flex;
  flex-direction: row;
  margin: 10px 0px;
  padding: 0;
}

.infobar > * {
  flex: 1 1 0;
}

.chat {
  flex: 1 1 auto;
  display: flex;
  margin: 1px 0;
  width: 100%;
}

iframe {
  flex: 1 1 auto;
  border-style: ridge;
  border-width: thin;
  border-color: darkmagenta;
  width: 100;
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

.disableMouse {
  pointer-events: none;
}
.enableMouse {
  pointer-events: auto;
}
</style>
