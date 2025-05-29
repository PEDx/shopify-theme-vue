<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1>Example</h1>
    <Input v-model="input" />
    <Button @click="handleClick" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from 'components';

const input = ref('');

const handleClick = () => {};
</script>

<style>
@import 'tailwindcss';
</style>
