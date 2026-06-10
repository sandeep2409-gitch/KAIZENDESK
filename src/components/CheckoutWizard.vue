<script setup>
import { ref, reactive, computed } from 'vue'
import { 
  ShoppingBag, User, Mail, MapPin, CreditCard, Calendar, Lock, 
  CheckCircle2, ArrowLeft, ArrowRight, Clock, Truck, ShieldCheck
} from 'lucide-vue-next'
import { useCart } from '../composables/useCart'

const emit = defineEmits(['close-checkout', 'order-complete'])

const {
  cart,
  subtotal,
  discount,
  shipping,
  tax,
  total,
  updateQuantity,
  removeFromCart,
  checkoutOrder
} = useCart()

// Steps configuration: 1 = Review, 2 = Shipping, 3 = Payment, 4 = Success
const currentStep = ref(1)
const orderReceipt = ref(null)

// Step 2: Shipping state
const shippingForm = reactive({
  name: '',
  email: '',
  address: '',
  city: '',
  zipCode: '',
  phone: ''
})
const shippingErrors = reactive({})

// Step 3: Payment state
const paymentForm = reactive({
  cardNumber: '',
  cardHolder: '',
  expiry: '',
  cvv: ''
})
const paymentErrors = reactive({})
const isCardFlipped = ref(false)

// Formatting credit card input
const handleCardNumberInput = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length > 16) value = value.slice(0, 16)
  
  // Format as 4-digit groups
  const matches = value.match(/.{1,4}/g)
  paymentForm.cardNumber = matches ? matches.join(' ') : value
}

// Formatting expiry input (MM/YY)
const handleExpiryInput = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length > 4) value = value.slice(0, 4)
  
  if (value.length > 2) {
    paymentForm.expiry = value.slice(0, 2) + '/' + value.slice(2)
  } else {
    paymentForm.expiry = value
  }
}

// Formatting CVV input (3 or 4 digits)
const handleCvvInput = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length > 4) value = value.slice(0, 4)
  paymentForm.cvv = value
}

// Card brand detection helper
const cardBrand = computed(() => {
  const cleanNum = paymentForm.cardNumber.replace(/\s/g, '')
  if (cleanNum.startsWith('4')) return 'visa'
  if (/^5[1-5]/.test(cleanNum)) return 'mastercard'
  if (/^3[47]/.test(cleanNum)) return 'amex'
  return 'generic'
})

// Validation methods
const validateShipping = () => {
  let isValid = true
  Object.keys(shippingErrors).forEach(key => delete shippingErrors[key])

  if (!shippingForm.name.trim()) {
    shippingErrors.name = 'Full name is required'
    isValid = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!shippingForm.email.trim()) {
    shippingErrors.email = 'Email address is required'
    isValid = false
  } else if (!emailRegex.test(shippingForm.email.trim())) {
    shippingErrors.email = 'Please enter a valid email address'
    isValid = false
  }

  if (!shippingForm.address.trim()) {
    shippingErrors.address = 'Shipping address is required'
    isValid = false
  }

  if (!shippingForm.city.trim()) {
    shippingErrors.city = 'City is required'
    isValid = false
  }

  const zipRegex = /^\d{5}(-\d{4})?$/
  if (!shippingForm.zipCode.trim()) {
    shippingErrors.zipCode = 'ZIP code is required'
    isValid = false
  }

  if (!shippingForm.phone.trim()) {
    shippingErrors.phone = 'Phone number is required'
    isValid = false
  }

  return isValid
}

const validatePayment = () => {
  let isValid = true
  Object.keys(paymentErrors).forEach(key => delete paymentErrors[key])

  const cleanCard = paymentForm.cardNumber.replace(/\s/g, '')
  if (cleanCard.length < 15) {
    paymentErrors.cardNumber = 'Please enter a valid card number'
    isValid = false
  }

  if (!paymentForm.cardHolder.trim()) {
    paymentErrors.cardHolder = 'Cardholder name is required'
    isValid = false
  }

  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
  if (!paymentForm.expiry || !expiryRegex.test(paymentForm.expiry)) {
    paymentErrors.expiry = 'Use MM/YY format'
    isValid = false
  } else {
    // Check if expired
    const [month, year] = paymentForm.expiry.split('/')
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month), 1)
    const today = new Date()
    if (expiryDate < today) {
      paymentErrors.expiry = 'Card is expired'
      isValid = false
    }
  }

  if (paymentForm.cvv.length < 3) {
    paymentErrors.cvv = 'CVV is required'
    isValid = false
  }

  return isValid
}

// Navigation triggers
const nextStep = () => {
  if (currentStep.value === 1) {
    if (cart.value.length === 0) return
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    if (validateShipping()) {
      currentStep.value = 3
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1 && currentStep.value < 4) {
    currentStep.value--
  }
}

const submitOrder = () => {
  if (validatePayment()) {
    // Complete checkout order
    const receipt = checkoutOrder(shippingForm, paymentForm)
    orderReceipt.value = receipt
    currentStep.value = 4
    emit('order-complete')
  }
}
</script>

<template>
  <div class="checkout-wizard glass-panel w-full max-w-4xl mx-auto p-6 md:p-8 animate-fade-in">
    <!-- Stepper Line -->
    <div class="stepper-bar flex items-center justify-between mb-8 max-w-2xl mx-auto">
      <div 
        v-for="step in 4" 
        :key="step" 
        class="flex items-center flex-1 last:flex-none"
      >
        <div class="flex flex-col items-center relative">
          <!-- Step Circle -->
          <div 
            class="step-circle w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border transition-all duration-300"
            :class="{
              'bg-emerald-500 text-gray-950 border-emerald-500 shadow-glow': currentStep === step || currentStep > step,
              'bg-gray-900 text-gray-500 border-white/10': currentStep < step
            }"
          >
            <CheckCircle2 v-if="currentStep > step" class="w-5 h-5 text-gray-950" />
            <span v-else>{{ step }}</span>
          </div>
          <!-- Label -->
          <span 
            class="step-label absolute top-9 text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap"
            :class="currentStep >= step ? 'text-gray-200' : 'text-gray-500'"
          >
            {{ step === 1 ? 'Review' : step === 2 ? 'Shipping' : step === 3 ? 'Payment' : 'Complete' }}
          </span>
        </div>
        <!-- Connection Line -->
        <div 
          v-if="step < 4" 
          class="step-line h-0.5 flex-grow mx-4 rounded transition-all duration-500"
          :class="currentStep > step ? 'bg-emerald-500' : 'bg-white/10'"
        ></div>
      </div>
    </div>

    <!-- Wizard Steps Content -->
    <div class="step-content mt-12">
      <!-- STEP 1: REVIEW ORDER -->
      <div v-if="currentStep === 1" class="space-y-6">
        <h2 class="text-xl md:text-2xl font-bold font-heading text-gray-100 flex items-center gap-2">
          <ShoppingBag class="w-6 h-6 text-emerald-400" />
          Review Your Aesthetic Selection
        </h2>
        
        <div v-if="cart.length === 0" class="p-8 text-center bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3">
          <p class="text-gray-400 font-medium text-base">Your cart is empty.</p>
          <button @click="emit('close-checkout')" class="btn-primary">Return to Shop</button>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Items List -->
          <div class="lg:col-span-2 space-y-3">
            <div 
              v-for="item in cart" 
              :key="item.product.id"
              class="flex gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
            >
              <div class="w-20 h-20 bg-black/20 rounded-lg overflow-hidden flex-shrink-0">
                <img :src="item.product.image" :alt="item.product.name" class="w-full h-full object-cover" />
              </div>
              <div class="flex-grow flex flex-col justify-between py-1">
                <div>
                  <h3 class="text-sm font-semibold text-gray-200 line-clamp-1 font-heading">{{ item.product.name }}</h3>
                  <p class="text-xs text-gray-500 mt-0.5">{{ item.product.category }}</p>
                </div>
                <div class="flex items-center justify-between">
                  <!-- Custom quantity control -->
                  <div class="flex items-center gap-3 bg-black/30 border border-white/5 rounded-md px-2 py-1">
                    <button @click="updateQuantity(item.product.id, -1)" class="text-gray-400 hover:text-emerald-400 transition-colors text-xs">-</button>
                    <span class="text-xs font-semibold text-gray-200">{{ item.quantity }}</span>
                    <button @click="updateQuantity(item.product.id, 1)" class="text-gray-400 hover:text-emerald-400 transition-colors text-xs">+</button>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="text-sm font-bold text-gray-200">${{ (item.product.price * item.quantity).toFixed(2) }}</span>
                    <button @click="removeFromCart(item.product.id)" class="text-xs text-rose-400 hover:underline">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Checkout Summary -->
          <div class="lg:col-span-1 p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div>
              <h3 class="text-sm font-bold tracking-wider uppercase text-gray-400 border-b border-white/5 pb-2 mb-4">Summary</h3>
              <div class="space-y-2.5 text-xs text-gray-400">
                <div class="flex justify-between">
                  <span>Subtotal</span>
                  <span class="text-gray-200">${{ subtotal.toFixed(2) }}</span>
                </div>
                <div v-if="discount > 0" class="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount</span>
                  <span>-${{ discount.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Shipping</span>
                  <span v-if="shipping === 0" class="text-emerald-400 font-bold uppercase">Free</span>
                  <span v-else class="text-gray-200">${{ shipping.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Tax (8%)</span>
                  <span class="text-gray-200">${{ tax.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm font-bold text-gray-100 border-t border-white/5 pt-3">
                  <span>Estimated Total</span>
                  <span class="text-lg text-emerald-400">${{ total.toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <button @click="nextStep" class="btn-primary w-full py-3 mt-6 uppercase text-xs font-bold tracking-wider">
              Continue to Shipping
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 2: SHIPPING DETAILS -->
      <div v-if="currentStep === 2" class="space-y-6">
        <h2 class="text-xl md:text-2xl font-bold font-heading text-gray-100 flex items-center gap-2">
          <MapPin class="w-6 h-6 text-emerald-400" />
          Shipping Information
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold uppercase text-gray-400 tracking-wider">Full Name</label>
            <div class="relative">
              <User class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                v-model="shippingForm.name" 
                placeholder="John Doe" 
                class="glass-input w-full pl-10" 
              />
            </div>
            <span v-if="shippingErrors.name" class="text-rose-400 text-[11px] font-semibold">{{ shippingErrors.name }}</span>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold uppercase text-gray-400 tracking-wider">Email Address</label>
            <div class="relative">
              <Mail class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                v-model="shippingForm.email" 
                placeholder="johndoe@example.com" 
                class="glass-input w-full pl-10" 
              />
            </div>
            <span v-if="shippingErrors.email" class="text-rose-400 text-[11px] font-semibold">{{ shippingErrors.email }}</span>
          </div>

          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="text-xs font-semibold uppercase text-gray-400 tracking-wider">Physical Address</label>
            <div class="relative">
              <MapPin class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                v-model="shippingForm.address" 
                placeholder="120 Aesthetic Ln, Suite 400" 
                class="glass-input w-full pl-10" 
              />
            </div>
            <span v-if="shippingErrors.address" class="text-rose-400 text-[11px] font-semibold">{{ shippingErrors.address }}</span>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold uppercase text-gray-400 tracking-wider">City</label>
            <input 
              type="text" 
              v-model="shippingForm.city" 
              placeholder="San Francisco" 
              class="glass-input" 
            />
            <span v-if="shippingErrors.city" class="text-rose-400 text-[11px] font-semibold">{{ shippingErrors.city }}</span>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold uppercase text-gray-400 tracking-wider">ZIP / Postal Code</label>
            <input 
              type="text" 
              v-model="shippingForm.zipCode" 
              placeholder="94105" 
              class="glass-input" 
            />
            <span v-if="shippingErrors.zipCode" class="text-rose-400 text-[11px] font-semibold">{{ shippingErrors.zipCode }}</span>
          </div>

          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="text-xs font-semibold uppercase text-gray-400 tracking-wider">Phone Number</label>
            <input 
              type="tel" 
              v-model="shippingForm.phone" 
              placeholder="(555) 000-0000" 
              class="glass-input" 
            />
            <span v-if="shippingErrors.phone" class="text-rose-400 text-[11px] font-semibold">{{ shippingErrors.phone }}</span>
          </div>
        </div>

        <div class="flex justify-between items-center border-t border-white/5 pt-6 mt-8">
          <button @click="prevStep" class="btn-secondary">
            <ArrowLeft class="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <button @click="nextStep" class="btn-primary">
            <span>Continue to Payment</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- STEP 3: SECURE PAYMENT -->
      <div v-if="currentStep === 3" class="space-y-8">
        <h2 class="text-xl md:text-2xl font-bold font-heading text-gray-100 flex items-center gap-2">
          <CreditCard class="w-6 h-6 text-emerald-400" />
          Secure Payment Portal
        </h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <!-- Visual Mock Credit Card Container -->
          <div class="card-visual-wrapper perspective-1000 flex justify-center py-4">
            <div 
              class="credit-card-mock relative w-[340px] h-[210px] rounded-2xl transition-transform duration-700 preserve-3d cursor-pointer"
              :class="{ 'rotate-y-180': isCardFlipped }"
              @click="isCardFlipped = !isCardFlipped"
            >
              <!-- Front Side -->
              <div class="card-front absolute inset-0 rounded-2xl p-6 flex flex-col justify-between backface-hidden shadow-2xl overflow-hidden">
                <!-- Glowing holographic overlay -->
                <div class="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-800/85 to-indigo-950/70 z-0"></div>
                <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                
                <div class="relative z-10 flex justify-between items-start">
                  <!-- Holographic Chip -->
                  <div class="w-11 h-8 rounded bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 border border-yellow-300/20"></div>
                  <!-- Card Brand logo -->
                  <div class="brand-logo text-right font-bold uppercase tracking-wider text-xs italic text-gray-400">
                    <span v-if="cardBrand === 'visa'" class="text-blue-400 font-extrabold text-sm">VISA</span>
                    <span v-else-if="cardBrand === 'mastercard'" class="text-amber-500 font-extrabold text-sm">MasterCard</span>
                    <span v-else-if="cardBrand === 'amex'" class="text-cyan-400 font-extrabold text-sm font-sans">AMEX</span>
                    <span v-else>SECURE PAY</span>
                  </div>
                </div>

                <!-- Monospace Card Number -->
                <div class="relative z-10 font-mono text-lg tracking-widest text-gray-100 py-3 text-center bg-black/20 rounded-lg border border-white/5">
                  {{ paymentForm.cardNumber || '•••• •••• •••• ••••' }}
                </div>

                <div class="relative z-10 flex justify-between items-end mt-1">
                  <div class="flex flex-col">
                    <span class="text-[9px] uppercase tracking-wider text-gray-500">Card Holder</span>
                    <span class="text-xs font-semibold text-gray-200 tracking-wide truncate max-w-[180px]">
                      {{ paymentForm.cardHolder || 'AESTHETIC BUILDER' }}
                    </span>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="text-[9px] uppercase tracking-wider text-gray-500">Expires</span>
                    <span class="text-xs font-mono font-semibold text-gray-200">
                      {{ paymentForm.expiry || 'MM/YY' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Back Side -->
              <div class="card-back absolute inset-0 rounded-2xl bg-gradient-to-bl from-slate-900 via-slate-950 to-indigo-950 p-6 flex flex-col justify-between rotate-y-180 backface-hidden shadow-2xl">
                <!-- Magnetic Stripe -->
                <div class="absolute top-6 left-0 right-0 h-10 bg-black/80"></div>
                <div class="mt-12 flex flex-col gap-4">
                  <!-- Signature and CVV box -->
                  <div class="flex justify-between items-center">
                    <div class="flex-grow h-8 bg-gray-600/20 border-t border-b border-white/5 rounded-l mr-2 flex items-center px-3 text-[10px] text-gray-500 italic">
                      Authorised Signature
                    </div>
                    <div class="w-14 h-8 bg-white text-gray-950 rounded-r flex items-center justify-center font-mono font-bold tracking-widest text-xs">
                      {{ paymentForm.cvv || '•••' }}
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-1.5 text-[9px] text-gray-500 uppercase tracking-widest mt-1">
                    <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
                    <span>8192-Bit Encrypted Link</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input Fields -->
          <div class="space-y-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold uppercase text-gray-400 tracking-wider">Cardholder Name</label>
              <input 
                type="text" 
                v-model="paymentForm.cardHolder" 
                placeholder="Aesthetic Builder" 
                class="glass-input" 
                @focus="isCardFlipped = false"
              />
              <span v-if="paymentErrors.cardHolder" class="text-rose-400 text-[11px] font-semibold">{{ paymentErrors.cardHolder }}</span>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold uppercase text-gray-400 tracking-wider">Card Number</label>
              <div class="relative">
                <CreditCard class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  :value="paymentForm.cardNumber"
                  @input="handleCardNumberInput"
                  placeholder="4111 2222 3333 4444" 
                  class="glass-input w-full pl-10 font-mono" 
                  @focus="isCardFlipped = false"
                />
              </div>
              <span v-if="paymentErrors.cardNumber" class="text-rose-400 text-[11px] font-semibold">{{ paymentErrors.cardNumber }}</span>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold uppercase text-gray-400 tracking-wider">Expiry Date</label>
                <div class="relative">
                  <Calendar class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    :value="paymentForm.expiry"
                    @input="handleExpiryInput"
                    placeholder="MM/YY" 
                    class="glass-input w-full pl-10 font-mono" 
                    @focus="isCardFlipped = false"
                  />
                </div>
                <span v-if="paymentErrors.expiry" class="text-rose-400 text-[11px] font-semibold">{{ paymentErrors.expiry }}</span>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold uppercase text-gray-400 tracking-wider">CVV Code</label>
                <div class="relative">
                  <Lock class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="password" 
                    :value="paymentForm.cvv"
                    @input="handleCvvInput"
                    placeholder="•••" 
                    class="glass-input w-full pl-10 font-mono"
                    @focus="isCardFlipped = true"
                    @blur="isCardFlipped = false"
                  />
                </div>
                <span v-if="paymentErrors.cvv" class="text-rose-400 text-[11px] font-semibold">{{ paymentErrors.cvv }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Price breakdowns + navigation -->
        <div class="border-t border-white/5 pt-6 mt-8 flex flex-col gap-6">
          <div class="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <span class="text-xs font-medium text-gray-400">Total charge:</span>
            <span class="text-xl font-bold text-emerald-400">${{ total.toFixed(2) }}</span>
          </div>

          <div class="flex justify-between items-center">
            <button @click="prevStep" class="btn-secondary">
              <ArrowLeft class="w-4 h-4" />
              <span>Back</span>
            </button>
            
            <button @click="submitOrder" class="btn-primary px-8">
              <ShieldCheck class="w-4 h-4" />
              <span>Submit Secured Order</span>
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 4: SUCCESS RECEIPT -->
      <div v-if="currentStep === 4 && orderReceipt" class="space-y-8 text-center max-w-xl mx-auto py-4">
        <div class="success-icon-bar flex justify-center">
          <div class="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
            <CheckCircle2 class="w-9 h-9" />
          </div>
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl md:text-3xl font-bold font-heading text-gray-100">Setup En Route</h2>
          <p class="text-sm text-gray-400">
            Thank you for ordering, <span class="text-gray-200 font-semibold">{{ orderReceipt.shippingInfo.name }}</span>! 
            Your workspace aesthetics upgrade has been booked.
          </p>
        </div>

        <!-- Tracking Bar -->
        <div class="tracking-container p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <div class="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <span>Tracking ID: <span class="text-emerald-400 font-mono font-bold">{{ orderReceipt.id }}</span></span>
            <span class="text-emerald-400 flex items-center gap-1"><Clock class="w-3.5 h-3.5" /> Est: 3-5 Business Days</span>
          </div>

          <!-- Custom progress bar -->
          <div class="progress-track relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-3">
            <div class="absolute top-0 left-0 h-full w-2/5 bg-emerald-500 rounded-full"></div>
          </div>
          
          <div class="grid grid-cols-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-center">
            <span class="text-emerald-400">Confirmed</span>
            <span class="text-emerald-400">Processing</span>
            <span>Shipped</span>
            <span>Delivered</span>
          </div>
        </div>

        <!-- Receipt breakdown details -->
        <div class="receipt-card p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3.5 text-left text-xs">
          <h3 class="text-sm font-bold tracking-wider uppercase text-gray-400 border-b border-white/5 pb-2">Receipt</h3>
          
          <!-- Selected Items -->
          <div class="space-y-2 font-medium">
            <div 
              v-for="item in orderReceipt.items" 
              :key="item.product.id"
              class="flex justify-between text-gray-300"
            >
              <span>{{ item.product.name }} <span class="text-gray-500">x{{ item.quantity }}</span></span>
              <span>${{ (item.product.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Prices breakdown -->
          <div class="space-y-1.5 pt-3.5 border-t border-white/5 text-gray-400">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="text-gray-200">${{ orderReceipt.subtotal.toFixed(2) }}</span>
            </div>
            <div v-if="orderReceipt.discount > 0" class="flex justify-between text-emerald-400 font-medium">
              <span>Discount</span>
              <span>-${{ orderReceipt.discount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Shipping</span>
              <span v-if="orderReceipt.shipping === 0" class="text-emerald-400 font-bold uppercase">Free</span>
              <span v-else class="text-gray-200">${{ orderReceipt.shipping.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Tax (8%)</span>
              <span class="text-gray-200">${{ orderReceipt.tax.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm font-bold text-gray-100 border-t border-white/5 pt-2.5">
              <span>Paid Total</span>
              <span class="text-emerald-400 font-sans">${{ orderReceipt.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <button @click="emit('close-checkout')" class="btn-primary w-full py-3 mt-4">
          Upgrade More Gear
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

.shadow-glow {
  box-shadow: 0 0 14px 0 rgba(16, 185, 129, 0.45);
}

.credit-card-mock {
  width: 320px;
  height: 200px;
  background: transparent;
  border-radius: 1rem;
}

.card-front, .card-back {
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
}

.card-front {
  z-index: 2;
}

.card-back {
  z-index: 1;
}

.step-circle {
  position: relative;
  z-index: 5;
}
</style>
