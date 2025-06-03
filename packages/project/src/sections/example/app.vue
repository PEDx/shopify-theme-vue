<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl lg:text-4xl lg:font-bold">Example</h1>
    <Input v-model="input" />
    <Button @click="handleClick" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input } from 'components';

const input = ref('');

const handleClick = () => {};
</script>

<style>
@import 'tailwindcss';
@source '../../../node_modules/components';
</style>
