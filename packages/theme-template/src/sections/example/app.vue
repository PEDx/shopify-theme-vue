<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1>Example</h1>
    <Input v-model="input" />
    <Button @click="handleClick" />
  </div>
</template>

<script setup lang="ts">
import { Button, Input } from 'components';
import { ref } from 'vue';

const input = ref('');

const handleClick = () => {
  console.log(input.value);
};
</script>

<style>
@import 'tailwindcss';
</style>
