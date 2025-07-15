<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-2xl lg:text-4xl lg:font-bold" liquid="{{ shop.url | upcase }}"></h1>

    <div></div>

    <input v-model="input" class="border border-gray-300 rounded-md p-2" />
    <button @click="handleClick" class="cursor-pointer bg-blue-500 text-white p-2 rounded-md">
      Click me {{ input }}
    </button>

    <liquid class="text-2xl lg:text-4xl lg:font-bold" v-pre>
      <ul class="flex flex-wrap">
        {% for product in collections.all.products limit: 10 %}
        <li class="flex flex-col items-center relative w-1/4">
          {% if product.metafields.custom.url%}
          <a class="flex flex-col items-center" href="{{ product.metafields.custom.url | upcase }}">
            {% endif %}
            <img class="w-full" src="{{ product.metafields.custom.cover_img   }}" alt="" />
            <div class="text-center">{{ product.title | upcase }}</div>
            {% if product.metafields.custom.url%}
          </a>
          {% endif %}
        </li>
        {% endfor %}
      </ul>
    </liquid>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const input = ref(3);

const handleClick = () => {
  input.value += 1;
};
</script>

<style>
@import 'tailwindcss';
</style>
