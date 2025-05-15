<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-3xl font-bold">Hello World</h1>
    <button @click="increment" class="bg-blue-500 text-white p-2 rounded-md cursor-pointer active:bg-blue-500/95">Count is: {{ count }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(1);

const increment = () => {
  count.value++;
};
</script>
