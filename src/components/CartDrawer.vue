<script setup>
import { ref } from 'vue'
import { X, Minus, Plus, Trash2, Tag, ShoppingBag, ArrowRight } from 'lucide-vue-next'
import { useCart } from '../composables/useCart'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'proceed-checkout'])

const {
  cart,
  appliedCoupon,
  cartItemsCount,
  subtotal,
  discount,
  shipping,
  tax,
  total,
  updateQuantity,
  removeFromCart,
  applyPromoCode,
  removePromoCode
} = useCart()

const promoInput = ref('')
const promoFeedback = ref({ success: false, message: '' })

const handleApplyPromo = () => {
  if (!promoInput.value) return
  const result = applyPromoCode(promoInput.value)
  promoFeedback.value = result
  if (result.success) {
    promoInput.value = ''
  }
  // Clear message after 4s
  setTimeout(() => {
    promoFeedback.value.message = ''
  }, 4000)
}

const handleRemovePromo = () => {
  removePromoCode()
  promoFeedback.value = { success: true, message: 'Promo code removed.' }
  setTimeout(() => {
    promoFeedback.value.message = ''
  }, 3000)
}

const checkout = () => {
  emit('close')
  emit('proceed-checkout')
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="cart-backdrop fixed inset-0 z-50 backdrop-blur-sm bg-black/60"
        @click="emit('close')"
      ></div>
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="slide">
      <div 
        v-if="isOpen" 
        class="cart-drawer fixed top-0 right-0 h-full w-full max-w-md z-50 glass-panel flex flex-col shadow-2xl"
      >
        <!-- Header -->
        <div class="drawer-header flex items-center justify-between p-5 border-b border-white/5">
          <div class="flex items-center gap-2">
            <ShoppingBag class="w-5 h-5 text-emerald-400" />
            <h2 class="text-lg font-semibold tracking-wide text-gray-100 uppercase font-heading">
              Your Space Cart
            </h2>
            <span class="badge badge-emerald ml-1">{{ cartItemsCount }}</span>
          </div>
          <button 
            @click="emit('close')" 
            class="close-btn p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Cart Items List (Scrollable) -->
        <div class="drawer-body flex-grow overflow-y-auto p-5 space-y-4">
          <div v-if="cart.length === 0" class="empty-cart-state flex flex-col items-center justify-center h-full gap-4 text-center">
            <div class="empty-icon-wrapper p-4 bg-white/5 border border-white/10 rounded-full">
              <ShoppingBag class="w-10 h-10 text-gray-500" />
            </div>
            <div>
              <p class="text-base font-medium text-gray-300">Your cart is currently empty</p>
              <p class="text-xs text-gray-500 mt-1">Upgrade your desk aesthetic with our select workspace collections.</p>
            </div>
            <button @click="emit('close')" class="btn-primary mt-2">
              Start Shopping
            </button>
          </div>

          <!-- Items loop -->
          <div 
            v-else 
            v-for="item in cart" 
            :key="item.product.id" 
            class="cart-item p-3 rounded-xl bg-white/[0.02] border border-white/5 flex gap-4 transition-all hover:border-white/10"
          >
            <div class="item-img-container h-16 w-16 rounded-lg overflow-hidden bg-black/20 flex-shrink-0">
              <img :src="item.product.image" :alt="item.product.name" class="w-full h-full object-cover" />
            </div>
            
            <div class="flex-grow flex flex-col justify-between py-0.5">
              <div class="flex justify-between items-start gap-2">
                <h4 class="item-name text-sm font-medium text-gray-200 line-clamp-1 leading-snug">
                  {{ item.product.name }}
                </h4>
                <button 
                  @click="removeFromCart(item.product.id)" 
                  class="text-gray-500 hover:text-rose-400 p-0.5 transition-colors"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>

              <div class="flex items-center justify-between mt-1">
                <div class="qty-adjuster flex items-center bg-black/40 border border-white/5 rounded-md p-1 gap-2.5">
                  <button 
                    @click="updateQuantity(item.product.id, -1)" 
                    class="qty-btn text-gray-400 hover:text-emerald-400 p-0.5 rounded transition-colors"
                  >
                    <Minus class="w-3.5 h-3.5" />
                  </button>
                  <span class="qty-val text-xs font-semibold text-gray-200 min-w-4 text-center">
                    {{ item.quantity }}
                  </span>
                  <button 
                    @click="updateQuantity(item.product.id, 1)" 
                    class="qty-btn text-gray-400 hover:text-emerald-400 p-0.5 rounded transition-colors"
                  >
                    <Plus class="w-3.5 h-3.5" />
                  </button>
                </div>
                <span class="text-sm font-bold text-gray-200">
                  ${{ (item.product.price * item.quantity).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Promo Code & Price Breakdown -->
        <div v-if="cart.length > 0" class="drawer-footer p-5 border-t border-white/5 bg-black/20 flex flex-col gap-4">
          <!-- Promo Input -->
          <div class="promo-section flex flex-col gap-1.5">
            <div v-if="!appliedCoupon" class="flex gap-2">
              <div class="relative flex-grow">
                <Tag class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  v-model="promoInput" 
                  placeholder="Enter promo code (e.g. SAVE10)" 
                  class="glass-input w-full pl-9 text-xs" 
                  @keydown.enter="handleApplyPromo"
                />
              </div>
              <button 
                @click="handleApplyPromo" 
                class="btn-secondary py-2 px-4 text-xs font-semibold"
              >
                Apply
              </button>
            </div>

            <!-- Active Promo details -->
            <div v-else class="active-promo flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div class="flex items-center gap-2">
                <Tag class="w-4 h-4 text-emerald-400" />
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-emerald-400 tracking-wide">{{ appliedCoupon.code }}</span>
                  <span class="text-[10px] text-gray-400">{{ appliedCoupon.description }}</span>
                </div>
              </div>
              <button 
                @click="handleRemovePromo" 
                class="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
              >
                Remove
              </button>
            </div>

            <!-- Feedback -->
            <Transition name="fade">
              <p 
                v-if="promoFeedback.message" 
                class="text-[11px] font-medium"
                :class="promoFeedback.success ? 'text-emerald-400' : 'text-rose-400'"
              >
                {{ promoFeedback.message }}
              </p>
            </Transition>
          </div>

          <!-- Detailed Summary -->
          <div class="price-breakdown text-xs space-y-2 border-t border-white/5 pt-3">
            <div class="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span class="text-gray-200">${{ subtotal.toFixed(2) }}</span>
            </div>
            
            <div v-if="discount > 0" class="flex justify-between text-emerald-400 font-medium">
              <span>Discount</span>
              <span>-${{ discount.toFixed(2) }}</span>
            </div>
            
            <div class="flex justify-between text-gray-400">
              <span>Shipping</span>
              <span v-if="shipping === 0" class="text-emerald-400 font-semibold uppercase">Free</span>
              <span v-else class="text-gray-200">${{ shipping.toFixed(2) }}</span>
            </div>
            
            <div class="flex justify-between text-gray-400">
              <span>Tax (8%)</span>
              <span class="text-gray-200">${{ tax.toFixed(2) }}</span>
            </div>

            <div class="flex justify-between text-sm font-bold text-gray-100 border-t border-white/5 pt-3">
              <span>Total</span>
              <span class="text-lg text-emerald-400 glow-total">${{ total.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Checkout trigger -->
          <button 
            @click="checkout" 
            class="btn-primary w-full py-3 mt-1 flex items-center justify-center gap-2 font-heading tracking-wide uppercase text-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight class="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cart-drawer {
  border-radius: 20px 0 0 20px;
  border-top-width: 0;
  border-right-width: 0;
  border-bottom-width: 0;
}

.glow-total {
  text-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
