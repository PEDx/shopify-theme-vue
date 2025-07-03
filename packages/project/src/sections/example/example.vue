<template>
  <h1>Example</h1>
  <liquid v-pre tag="div" class="text-2xl lg:text-4xl lg:font-bold">
    {% for block in section.blocks %}
    <div>
      {{ block.settings.title | upcase | append: 'test' }}
    </div>
    {% endfor %}
  </liquid>
  <div>
    {{ vue_data.title }}
  </div>
</template>

<script setup lang="ts">
const vue_data = {
  title: 'Vue Data Example',
};
</script>
