<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { 
  Search, ShoppingBag, History, ChevronDown, SlidersHorizontal, 
  ArrowLeft, Sparkles, AlertCircle, ShoppingCart, Check, Eye
} from 'lucide-vue-next'
import { useCart } from './composables/useCart'
import ProductCard from './components/ProductCard.vue'
import CartDrawer from './components/CartDrawer.vue'
import CheckoutWizard from './components/CheckoutWizard.vue'

const {
  products,
  cart,
  orders,
  cartItemsCount,
  addToCart
} = useCart()

// UI Toggles
const isCartOpen = ref(false)
const isHistoryOpen = ref(false)
const isCheckoutActive = ref(false)

// Toast State
const toast = reactive({
  message: '',
  type: 'success', // success or info
  visible: false
})

const triggerToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.visible = true
  
  // Clear any existing timer if needed
  if (window.toastTimeout) {
    clearTimeout(window.toastTimeout)
  }
  
  window.toastTimeout = setTimeout(() => {
    toast.visible = false
  }, 3000)
}

// Search and Filter State
const searchInput = ref('')
const selectedCategory = ref('All')
const selectedSort = ref('featured') // featured, price-asc, price-desc, rating

// Derived Categories from products
const categories = computed(() => {
  const cats = new Set(products.map(p => p.category))
  return ['All', ...Array.from(cats)]
})

// Filtered and Sorted Products
const filteredProducts = computed(() => {
  let list = [...products]
  
  // Apply category filter
  if (selectedCategory.value !== 'All') {
    list = list.filter(p => p.category === selectedCategory.value)
  }
  
  // Apply search
  if (searchInput.value.trim()) {
    const q = searchInput.value.toLowerCase()
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    )
  }
  
  // Apply sorting
  if (selectedSort.value === 'price-asc') {
    list.sort((a, b) => a.price - b.price)
  } else if (selectedSort.value === 'price-desc') {
    list.sort((a, b) => b.price - a.price)
  } else if (selectedSort.value === 'rating') {
    list.sort((a, b) => b.rating - a.rating)
  }
  
  return list
})

// Quick Cart Action
const handleAddToCart = (product) => {
  addToCart(product)
  triggerToast(`"${product.name}" added to cart!`, 'success')
}

// Watch cart count to trigger an animation or update
const animatedBadge = ref(false)
watch(cartItemsCount, (newVal, oldVal) => {
  if (newVal > oldVal) {
    animatedBadge.value = true
    setTimeout(() => {
      animatedBadge.value = false
    }, 400)
  }
})

// Complete order transition
const handleOrderComplete = () => {
  triggerToast('Order placed successfully!', 'success')
}
</script>

<template>
  <div class="app-container min-h-screen flex flex-col bg-[#070a13] text-gray-100 selection:bg-emerald-500/30">
    <!-- No sticky header or announcement banner -->

    <!-- Main Container -->
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Curated Header for Catalog -->
      <div v-if="!isCheckoutActive" class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pt-4">
        <!-- Logo Brand -->
        <div class="flex items-center gap-2 cursor-pointer" @click="isCheckoutActive = false">
          <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-gray-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            K
          </div>
          <span class="text-lg font-bold tracking-widest text-white uppercase font-heading">
            Kaizen<span class="text-emerald-400">Desk</span>
          </span>
        </div>

        <!-- Search Bar -->
        <div class="relative max-w-md w-full">
          <Search class="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            v-model="searchInput"
            placeholder="Search custom setups, keycaps, audio..."
            class="glass-input pl-10 pr-4 py-2 w-full text-sm rounded-xl bg-black/40 border-white/5"
          />
        </div>
      </div>

      <!-- CHECKOUT SCREEN VIEW -->
      <div v-if="isCheckoutActive" class="space-y-6">
        <div class="flex items-center justify-between gap-4 mb-6 pt-4">
          <button 
            @click="isCheckoutActive = false"
            class="flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Back to Curated Catalog</span>
          </button>

          <!-- Logo Brand on checkout -->
          <div class="flex items-center gap-2 cursor-pointer" @click="isCheckoutActive = false">
            <div class="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-[13px] text-gray-950 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              K
            </div>
            <span class="text-sm font-bold tracking-widest text-white uppercase font-heading">
              Kaizen<span class="text-emerald-400">Desk</span>
            </span>
          </div>
        </div>

        <CheckoutWizard 
          @close-checkout="isCheckoutActive = false" 
          @order-complete="handleOrderComplete"
        />
      </div>

      <!-- PRODUCT CATALOG CATALOG VIEW -->
      <div v-else class="space-y-8">

        <!-- Catalog Hero Banner -->
        <section class="catalog-hero p-6 md:p-8 rounded-2xl relative overflow-hidden border border-white/5 bg-gradient-to-br from-slate-900/40 via-indigo-950/20 to-emerald-950/10 shadow-2xl flex flex-col justify-center min-h-[180px] animate-fade-in">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-80"></div>
          
          <div class="relative z-10 max-w-lg space-y-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-widest">
              <Sparkles class="w-3.5 h-3.5" /> Est. Workspace Upgrades
            </span>
            <h1 class="text-3xl md:text-5xl font-black font-heading text-white tracking-tight leading-tight uppercase">
              Curate Your <span class="glow-text-emerald">Focus</span> Space
            </h1>
            <p class="text-sm md:text-base text-gray-400 leading-relaxed">
              Explore custom mechanical setups, premium open-back headphones, felt pads, and smart ambient accessories designed to optimize workflow and mental clarity.
            </p>
          </div>
        </section>

        <!-- Filters & Sort Bar -->
        <section class="filters-sort-bar p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <!-- Categories chips -->
          <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button 
              v-for="cat in categories" 
              :key="cat"
              @click="selectedCategory = cat"
              class="px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all uppercase border"
              :class="{
                'bg-emerald-500 text-gray-950 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.25)]': selectedCategory === cat,
                'bg-transparent text-gray-400 border-white/5 hover:text-white hover:border-white/15': selectedCategory !== cat
              }"
            >
              {{ cat }}
            </button>
          </div>

          <!-- Sort dropdown selector -->
          <div class="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
            <SlidersHorizontal class="w-3.5 h-3.5 text-gray-500" />
            <span class="text-xs text-gray-500 font-bold uppercase tracking-wider">Sort by</span>
            <div class="relative">
              <select 
                v-model="selectedSort"
                class="glass-input text-xs font-semibold py-2 pl-3 pr-8 rounded-xl bg-black/40 border-white/5 appearance-none cursor-pointer text-gray-200"
              >
                <option value="featured">Featured Items</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown class="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </section>

        <!-- Products Catalog Grid -->
        <section class="products-grid-section">
          <div v-if="filteredProducts.length === 0" class="text-center py-20 flex flex-col items-center justify-center gap-3">
            <AlertCircle class="w-12 h-12 text-gray-600" />
            <h3 class="text-lg font-bold text-gray-300 font-heading">No items match your curation criteria</h3>
            <p class="text-xs text-gray-500 max-w-xs">Adjust your search criteria or switch categories to explore other options.</p>
            <button @click="searchInput = ''; selectedCategory = 'All'" class="btn-secondary mt-2 text-xs">Reset All Filters</button>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCard 
              v-for="prod in filteredProducts" 
              :key="prod.id" 
              :product="prod"
              @add-to-cart="handleAddToCart"
            />
          </div>
        </section>
      </div>
    </main>

    <!-- Slide Over Order History Panel -->
    <Teleport to="body">
      <!-- History Backdrop -->
      <Transition name="fade">
        <div 
          v-if="isHistoryOpen" 
          class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          @click="isHistoryOpen = false"
        ></div>
      </Transition>

      <!-- History Panel -->
      <Transition name="slide">
        <div 
          v-if="isHistoryOpen" 
          class="fixed top-0 right-0 h-full w-full max-w-lg z-50 glass-panel flex flex-col shadow-2xl"
          style="border-radius: 20px 0 0 20px; border-right-width: 0;"
        >
          <div class="p-5 border-b border-white/5 flex items-center justify-between">
            <div class="flex items-center gap-2 text-emerald-400">
              <History class="w-5 h-5" />
              <h2 class="text-base font-bold font-heading uppercase tracking-wide">Your Order Log</h2>
            </div>
            <button 
              @click="isHistoryOpen = false" 
              class="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft class="w-5 h-5" />
            </button>
          </div>

          <!-- History items -->
          <div class="flex-grow overflow-y-auto p-5 space-y-4">
            <div v-if="orders.length === 0" class="text-center py-20 flex flex-col items-center justify-center gap-3">
              <History class="w-10 h-10 text-gray-600" />
              <p class="text-sm font-medium text-gray-400">No purchase records found.</p>
              <p class="text-xs text-gray-500">Your completed transactions will appear here.</p>
            </div>

            <div 
              v-else 
              v-for="ord in orders" 
              :key="ord.id"
              class="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3"
            >
              <div class="flex justify-between items-start border-b border-white/5 pb-2 text-xs">
                <div>
                  <p class="font-bold text-emerald-400 font-mono">{{ ord.id }}</p>
                  <p class="text-gray-500 mt-0.5">{{ ord.date }}</p>
                </div>
                <span class="badge badge-emerald text-[9px] font-bold">{{ ord.status }}</span>
              </div>

              <!-- Order items summary -->
              <div class="space-y-1">
                <div 
                  v-for="item in ord.items" 
                  :key="item.product.id"
                  class="flex justify-between text-[11px] text-gray-300"
                >
                  <span class="truncate max-w-[280px]">{{ item.product.name }} <span class="text-gray-500 font-bold">x{{ item.quantity }}</span></span>
                  <span>${{ (item.product.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>

              <div class="flex justify-between items-center text-xs font-bold text-gray-200 border-t border-white/5 pt-2">
                <span>Total amount</span>
                <span class="text-emerald-400">${{ ord.total.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Side-drawer Shopping Cart -->
    <CartDrawer 
      :is-open="isCartOpen" 
      @close="isCartOpen = false"
      @proceed-checkout="isCheckoutActive = true"
    />

    <!-- Floating Glass Action Console (Always present in viewport) -->
    <div class="fixed bottom-6 right-6 z-40 glass-panel p-2 flex items-center gap-1.5 shadow-2xl border-white/10 hover:border-emerald-500/20 transition-all">
      <!-- History Action -->
      <button 
        @click="isHistoryOpen = true" 
        class="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer"
        title="Order Log"
      >
        <History class="w-5 h-5" />
      </button>
      
      <div class="w-[1px] h-5 bg-white/10"></div>
      
      <!-- Cart Action -->
      <button 
        @click="isCartOpen = true" 
        class="relative p-2.5 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all flex items-center justify-center cursor-pointer"
        title="Shopping Cart"
      >
        <ShoppingCart class="w-5 h-5" />
        <span 
          class="badge-count absolute -top-1 -right-1 bg-emerald-500 text-gray-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-[#070a13]"
          :class="{ 'badge-bump': animatedBadge }"
        >
          {{ cartItemsCount }}
        </span>
      </button>
    </div>

    <!-- Global Toast Alert (Shifted to bottom-left to avoid overlaps) -->
    <Transition name="toast">
      <div 
        v-if="toast.visible" 
        class="fixed bottom-6 left-6 z-55 glass-panel py-3.5 px-5 flex items-center gap-3 border-emerald-500/20 max-w-sm shadow-2xl"
        :class="{ 'border-rose-500/20': toast.type === 'error' }"
      >
        <div class="flex-shrink-0 p-1 rounded-full bg-emerald-500/10 text-emerald-400" :class="{ 'bg-rose-500/10 text-rose-400': toast.type === 'error' }">
          <Check v-if="toast.type === 'success'" class="w-4 h-4" />
          <AlertCircle v-else class="w-4 h-4" />
        </div>
        <p class="text-xs font-semibold text-gray-200 line-clamp-2 leading-relaxed">
          {{ toast.message }}
        </p>
      </div>
    </Transition>

    <!-- Premium Footer -->
    <footer class="mt-auto border-t border-white/5 py-8 bg-black/20 text-center text-xs text-gray-500 space-y-2">
      <p class="font-heading uppercase tracking-widest text-[10px] text-gray-400">
        KaizenDesk Curators © 2026. Made with Precision.
      </p>
      <p>Clean design system built with custom glassmorphism and local state.</p>
    </footer>
  </div>
</template>

<style>
/* App Layout Container styles */
.app-container {
  overflow-x: hidden;
}

/* Marquee Bar Animations */
.marquee-banner {
  box-sizing: border-box;
}

.marquee-content {
  animation: marquee 30s linear infinite;
  padding-left: 100%;
}

@keyframes marquee {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-100%, 0, 0); }
}

/* Navbar badge animation */
.badge-count {
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.badge-bump {
  transform: scale(1.35);
}

/* Global Select adjustments */
select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-glow);
}

/* Toast Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

/* Slide Transition for History drawer */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
