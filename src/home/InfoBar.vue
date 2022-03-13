<template>
  <div id="header">
    <div class="info" v-if="live === true">
      <div class="info-top">{{ streamer }} | {{ category }}</div>
      <div class="info-bottom">{{ title }}</div>
    </div>
    <div class="info" v-else>
      <div class="info-top">{{ channel }}</div>
      <div class="info-bottom">Offline</div>
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
    };
  },
  methods: {
    fetchInfo: function () {
      window.myApi.getStream(this.channel, (error, resp, stderr) => {
        if (error) {
          //if command not found
          console.log(error.message);
          this.live = false;
          return;
        }

        if (stderr) {
          console.log(stderr);
          return;
        }

        const data = JSON.parse(resp);

        if (data.metadata) {
          //live or hosting
          if (
            data.metadata.author.toLowerCase() != this.channel.toLowerCase()
          ) {
            this.streamer = `${this.channel} is hosting ${data.metadata.author}`;
          } else {
            this.streamer = data.metadata.author;
          }
          this.category = data.metadata.category;
          this.title = data.metadata.title;
          this.live = true;
        } else {
          //when offline
          this.live = false;
        }
      });
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
