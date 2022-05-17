<template>
  <div id="header">
    <div class="info" v-if="live" :title="title">
      <div class="info-host" v-if="host">{{ channel }} is hosting</div>
      <div class="info-top">
        {{ streamer }}<br />
        <span v-if="category">{{ category }}</span>
      </div>
    </div>
    <div class="info" v-else>
      <div class="info-top">{{ channel }}</div>
      <span v-if="category">{{ category }}</span>
    </div>

    <div class="buttons">
      <button @click="openBrowser" title="Open in browser">
        <font-awesome-icon icon="external-link-alt" />
      </button>
      <button @click="fetchInfo" title="Refresh information">
        <font-awesome-icon icon="sync-alt" />
      </button>
      <button @click="$emit('close_chat', channel)" title="Close chat">
        <font-awesome-icon icon="window-close" />
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
      category: null,
      live: null,
      host: null,
    };
  },
  created() {
    this.fetchInfo();
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
};
</script>

<style scoped>
#header {
  display: flex;
  flex-direction: row;
  height: inherit;
}

.info {
  display: flex;
  flex-direction: column;
  width: 100%;
  color: white;
  height: 2.5rem;
}

.info-top {
  font-size: 1rem;
  text-overflow: ellipsis;
}

.info-host {
  font-size: 0.9rem;
}

.buttons {
  display: flex;
  flex-direction: row;
}

button {
  height: fit-content;
}
</style>
