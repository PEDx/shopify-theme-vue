<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl lg:text-4xl lg:font-bold" liquid="{{ section.settings.title | upcase }}"></h1>

    <input v-model="input" class="border border-gray-300 rounded-md p-2" />
    <button @click="handleClick" class="cursor-pointer bg-blue-500 text-white p-2 rounded-md">
      Click me {{ input }}
    </button>

    <liquid class="text-2xl lg:text-4xl lg:font-bold" v-pre>
      {% for block in section.blocks %}
      <div class="diy-creativity__tab-content__item swiper-slide">
        {{
              block.settings.video
              | video_tag:
                autoplay: false,
                muted: true,
                playsinline: true,
                class: 'diy-creativity__tab-content__item-video'
        }}
        <div class="diy-creativity__tab-content__item-content">
          <div class="diy-creativity__tab-content__item-avatar">
            {% if block.settings.avatar != blank %}
            <img
              src="{{ block.settings.avatar | image_url: width: 68 }}"
              alt="{{ block.settings.title }}"
              width="68"
              height="68"
              loading="lazy"
            />
            {% else %}
            <img
              src="https://placehold.co/68x68"
              alt="{{ block.settings.title }}"
              width="68"
              height="68"
              loading="lazy"
            />
            {% endif %}
          </div>
          <div class="diy-creativity__tab-content__item-content-text">
            <h3 class="diy-creativity__tab-content__title">
              {{ block.settings.title | upcase | append: 'test' }}
            </h3>
            <div class="tab-content__description">
              {{ block.settings.description }}
            </div>
          </div>
        </div>
      </div>
      {% endfor %}
    </liquid>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const liquid = (expression: string) => {
  return expression;
};

const input = ref(1);

const handleClick = () => {
  input.value += 1;
  console.log(liquid(`{% if product.name == 'Product 1' %} p-2 {% endif %}`));
};
</script>

<style>
@import 'tailwindcss';
</style>
