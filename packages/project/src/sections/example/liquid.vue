<script lang="ts">
import { ref, h } from 'vue';

export default {
  setup(props, { slots }) {
    return () => h('div', slots.default?.());
  },
};
</script>
