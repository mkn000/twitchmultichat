import {createApp} from 'vue';
import App from './App.vue';
import {library} from '@fortawesome/fontawesome-svg-core';
import {
  faSyncAlt,
  faWindowClose,
  faPlusSquare,
  faSignOutAlt,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

library.add(
  faSyncAlt,
  faWindowClose,
  faPlusSquare,
  faSignOutAlt,
  faExternalLinkAlt
);

createApp(App).component('font-awesome-icon', FontAwesomeIcon).mount('#app');
