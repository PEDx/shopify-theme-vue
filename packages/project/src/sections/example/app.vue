<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl lg:text-4xl lg:font-bold">
      <liquid>{{ title }}</liquid>
    </h1>
    <input v-model="input" />
    <button @click="handleClick">Click me {{ input }}</button>

    <liquid v-pre>
      {% for product in collection.products %}
      <div>
        <h1>{{ product.name }}</h1>
        <p>{{ product.description }}</p>
        <a href="{{ product.url }}">{{ product.url }}</a>
      </div>
      {% endfor %}
    </liquid>

    <liquid>
      <div>{{ store.id }}</div>
    </liquid>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const input = ref(1);

const handleClick = () => {
  input.value += 1;
};
</script>

<style>
@import 'tailwindcss';
</style>
