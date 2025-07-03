<script lang="ts">
import {  h } from 'vue';

export default {
  setup(props: { liquid: string; wrap?: string }, { slots, attrs }) {
    console.log('props', props);
    console.log('slots', slots);
    console.log('attrs', attrs);
    if (props.wrap) {
      return () => h(props.wrap as string, slots.default?.());
    }
    return slots.default?.();
  },
};
</script>
