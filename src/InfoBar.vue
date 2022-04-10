<template>
  <div id="header" title="Open in browser" @click="openBrowser">
    <div class="info" v-if="live">
      <div class="info-bottom" v-if="host">{{ channel }} is hosting</div>
      <div class="info-top">{{ channelCategory }}</div>
      <div class="info-bottom">{{ title }}</div>
    </div>
    <div class="info" v-else>
      <div class="info-top">{{ channel }}</div>
    </div>

    <div class="buttons">
      <button @click="$emit('close_chat', channel)">
        <font-awesome-icon icon="window-close" />
      </button>
      <button @click="fetchInfo">
        <font-awesome-icon icon="sync-alt"></font-awesome-icon>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InfoBar',
  props: {
    channel: '',
  },
  data() {
    return {
      fetcher: null,
      streamer: '',
      title: '',
      category: '',
      live: null,
      host: null,
    };
  },
  computed: {
    channelCategory() {
      if (this.category) {
        return `${this.streamer} | ${this.category}`;
      } else {
        return this.streamer;
      }
    },
  },
  methods: {
    fetchInfo: function () {
      window.myApi.request('channel_info', this.channel).then((info) => {
        console.log(info);
        if (info.streamer.toLowerCase() != this.channel.toLowerCase()) {
          this.host = true;
        } else {
          this.host = false;
        }
        this.live = info.live;
        this.streamer = info.streamer;
        this.category = info.category;
        this.title = info.title;
      });
    },
    openBrowser() {
      window.myApi.send('open_browser', this.channel);
    },
  },
  created() {
    this.fetchInfo();
  },
};
</script>

<style scoped>
#header {
  display: flex;
  flex-direction: row;
  height: inherit;
}
#header:hover {
  cursor: pointer;
}

.info {
  display: flex;
  flex-direction: column;
  width: 100%;
  color: white;
}

.info-top {
  font-size: 1.15rem;
}

.info-bottom {
  font-size: 0.9rem;
}

button {
  height: 50%;
}
</style>
