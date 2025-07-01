<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl lg:text-4xl lg:font-bold" v-pre>
      <liquid as="span">{{ title }}</liquid>
    </h1>

    <input v-model="input" class="border border-gray-300 rounded-md p-2" />
    <button @click="handleClick" class="cursor-pointer bg-blue-500 text-white p-2 rounded-md">
      Click me {{ input }}
    </button>

    <liquid class="bg-gray-200 p-2 rounded-md">
      {% for product in collection.products %}
      <div class="bg-gray-100 {% if product.name == \'Product 1\' %} p-2 {% endif %} rounded-md">
        <h1>{{ product.name }}</h1>
        <div>{{ article.created_at | date: '%B %d, %Y' }}</div>
        <p>{{ product.description }}</p>
        <a href="{{ product.url }}">{{ product.url }}</a>
      </div>
      {% endfor %}
    </liquid>

    <div v-pre>
      <div>{{ store.id }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import liquid from './liquid.vue';
import { ref } from 'vue';

const input = ref(1);

const handleClick = () => {
  input.value += 1;
};
</script>

<style>
@import 'tailwindcss';
</style>
