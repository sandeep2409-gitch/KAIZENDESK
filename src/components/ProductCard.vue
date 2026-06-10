<script setup>
import { ref } from 'vue'
import { Star, ShoppingBag, Check } from 'lucide-vue-next'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-to-cart'])

const isAdded = ref(false)

const handleAddToCart = () => {
  emit('add-to-cart', props.product)
  isAdded.value = true
  setTimeout(() => {
    isAdded.value = false
  }, 1500)
}
</script>

<template>
  <div class="glass-panel glass-panel-hover product-card flex flex-col overflow-hidden">
    <!-- Image Header with relative badges -->
    <div class="image-container relative overflow-hidden group">
      <img 
        :src="product.image" 
        :alt="product.name"
        class="product-image w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
      />
      <!-- Category Badge -->
      <div class="absolute top-4 left-4">
        <span class="badge badge-emerald">{{ product.category }}</span>
      </div>
      <!-- Promo Tag if exists -->
      <div v-if="product.tag" class="absolute top-4 right-4">
        <span class="badge badge-indigo">{{ product.tag }}</span>
      </div>
    </div>

    <!-- Details Body -->
    <div class="card-details flex flex-col justify-between flex-grow p-5 gap-3">
      <div class="flex flex-col gap-1.5">
        <h3 class="product-title text-lg font-semibold tracking-wide text-gray-100">
          {{ product.name }}
        </h3>
        
        <!-- Ratings -->
        <div class="rating-bar flex items-center gap-1">
          <div class="stars flex items-center text-emerald-400">
            <Star v-for="n in 5" :key="n" 
              class="w-4 h-4" 
              :class="{
                'fill-current': n <= Math.floor(product.rating),
                'text-gray-600': n > Math.floor(product.rating)
              }" 
            />
          </div>
          <span class="text-xs text-gray-100 font-semibold ml-1">{{ product.rating }}</span>
          <span class="text-xs text-gray-400">({{ product.ratingCount }} reviews)</span>
        </div>

        <p class="product-desc text-sm text-gray-400 line-clamp-3">
          {{ product.description }}
        </p>
      </div>

      <!-- Action Footer -->
      <div class="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
        <div class="price-container flex flex-col">
          <span class="text-xs text-gray-400 font-medium tracking-wider uppercase">Price</span>
          <span class="text-xl font-bold text-gray-100">${{ product.price.toFixed(2) }}</span>
        </div>

        <button 
          @click="handleAddToCart"
          class="btn-primary add-button"
          :class="{ 'added-state': isAdded }"
          :disabled="isAdded"
        >
          <Transition name="fade-icon" mode="out-in">
            <span v-if="isAdded" class="flex items-center gap-1.5">
              <Check class="w-4.5 h-4.5" />
              <span>Added</span>
            </span>
            <span v-else class="flex items-center gap-1.5">
              <ShoppingBag class="w-4.5 h-4.5" />
              <span>Add to Cart</span>
            </span>
          </Transition>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  height: 100%;
}

.image-container {
  height: 240px;
  background: rgba(0,0,0,0.2);
}

.product-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.product-title {
  font-family: var(--font-heading);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-desc {
  line-height: 1.5;
  min-height: 3rem;
}

.add-button {
  min-width: 130px;
}

.added-state {
  background: #059669 !important;
  box-shadow: 0 0 16px 0 rgba(5, 150, 105, 0.4);
  color: #fff;
  cursor: default;
}

.fade-icon-enter-active,
.fade-icon-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-icon-enter-from {
  opacity: 0;
  transform: scale(0.85);
}

.fade-icon-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
