<template>
  <div id="app">
    <h2>Join channel</h2>
    <form action="" @submit="joinChannel">
      <input
        type="text"
        name="channel"
        v-model="channel"
        placeholder="channel"
        autofocus
      />
      <input type="submit" value="Submit" />
    </form>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      channel: '',
    };
  },
  methods: {
    joinChannel: function (e) {
      e.preventDefault();
      console.log(this.channel);
      window.myApi.send('join_channel', this.channel);
      window.close();
    },
  },
};
</script>

<style>
:root {
  width: 300px;
  padding: 0;
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0 auto;
}
</style>
