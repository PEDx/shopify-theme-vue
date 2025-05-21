<template>
  <input type="text" :value="modelValue" @input="handleInput" ref="input" class="border-2 border-gray-300 rounded-md p-2" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value?: string): void;
}>();

const input = ref<HTMLInputElement>();

const handleInput = () => {
  emit('update:modelValue', input.value?.value);
};
</script>

<style>
</style>
