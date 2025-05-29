<template>
  <button class="bg-blue-500 text-white p-2 rounded-md cursor-pointer active:bg-blue-500/95" @click="increment">
    Count is: {{ count }}
  </button>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(1);

const increment = () => {
  count.value++;
};
</script>

<style></style>
