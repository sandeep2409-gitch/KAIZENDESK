import { ref, reactive, computed, watch } from 'vue'

// Premium mock products data
const productsList = [
  {
    id: 1,
    name: 'CyberBoard R2 Mechanical Keyboard',
    category: 'Keyboards',
    price: 249.99,
    rating: 4.9,
    ratingCount: 124,
    description: 'Custom 75% hot-swappable mechanical keyboard in a thick frosted polycarbonate chassis with sound-dampening gasket mounts.',
    tag: 'Best Seller',
    image: '/src/assets/cyberboard.png'
  },
  {
    id: 2,
    name: 'Aether Flux Planar Headphones',
    category: 'Audio',
    price: 399.99,
    rating: 4.8,
    ratingCount: 89,
    description: 'High-fidelity planar magnetic headphones featuring open-back dark walnut cups, sheepskin pads, and hand-woven silver cable.',
    tag: 'Audiophile Grade',
    image: '/src/assets/aetherflux.png'
  },
  {
    id: 3,
    name: 'Zenith Merino Felt Desk Mat',
    category: 'Desk Mats',
    price: 49.99,
    rating: 4.7,
    ratingCount: 342,
    description: 'Ultra-dense 100% Merino wool felt desk mat in charcoal gray, featuring raw-cut edges and a non-slip natural cork backing.',
    tag: 'Eco-Friendly',
    image: '/src/assets/zenithfelt.png'
  },
  {
    id: 4,
    name: 'Opal Beam Smart monitor Light',
    category: 'Lighting',
    price: 69.99,
    rating: 4.6,
    ratingCount: 156,
    description: 'Asymmetric screen light bar with customizable color temperature, front touchpad controls, and ambient RGB desk glow.',
    tag: 'Essentials',
    image: '/src/assets/monitorlight.png'
  },
  {
    id: 5,
    name: 'Apex Grip Wireless Precision Mouse',
    category: 'Accessories',
    price: 99.99,
    rating: 4.8,
    ratingCount: 204,
    description: 'Ergonomic wireless vertical mouse machined from space-grade magnesium alloy, complete with dual-scrolling tactile wheels.',
    tag: 'Premium Grip',
    image: '/src/assets/zenithfelt.png' // Mouse shown on felt mat
  },
  {
    id: 6,
    name: 'Custom Helix Braided Coil Cable',
    category: 'Cables',
    price: 39.99,
    rating: 4.9,
    ratingCount: 88,
    description: 'Double-sleeved coiled keyboard cable with GX16 aviation connector, matching emerald accent sleeves.',
    tag: 'Custom Built',
    image: '/src/assets/cyberboard.png' // Cable shown with keyboard
  },
  {
    id: 7,
    name: 'Walnut Headphone Stand & Dock',
    category: 'Accessories',
    price: 79.99,
    rating: 4.7,
    ratingCount: 72,
    description: 'A balanced walnut headphone stand mounted on a heavy solid brass tray for holding cables, flash drives, and small desk accessories.',
    tag: 'Limited Edition',
    image: '/src/assets/aetherflux.png' // Stand shown with headphones
  },
  {
    id: 8,
    name: 'Acoustic Wave Studio reference speaker',
    category: 'Audio',
    price: 199.99,
    rating: 4.5,
    ratingCount: 45,
    description: 'Near-field studio monitors featuring custom carbon-fiber woofers and active bi-amplified class D power delivery.',
    tag: 'New Release',
    image: '/src/assets/monitorlight.png' // Speakers shown in setup
  }
]

// Coupons definitions
const VALID_COUPONS = {
  SAVE10: { code: 'SAVE10', type: 'percentage', value: 10, description: '10% off your subtotal' },
  FREESHIP: { code: 'FREESHIP', type: 'shipping', value: 15, description: 'Free shipping on any order' },
  DESKGLOW: { code: 'DESKGLOW', type: 'fixed', value: 20, minSubtotal: 150, description: '$20 off on orders over $150' }
}

// Global state using singletons
const cart = ref([])
const appliedCoupon = ref(null)
const orders = ref([])

// Load cart and order history from localStorage
try {
  const storedCart = localStorage.getItem('aesthetic_cart')
  if (storedCart) {
    cart.value = JSON.parse(storedCart)
  }
  const storedOrders = localStorage.getItem('aesthetic_orders')
  if (storedOrders) {
    orders.value = JSON.parse(storedOrders)
  }
} catch (e) {
  console.error('Error reading localStorage data', e)
}

// Watch cart to save state
watch(cart, (newCart) => {
  localStorage.setItem('aesthetic_cart', JSON.stringify(newCart))
}, { deep: true })

// Watch orders to save state
watch(orders, (newOrders) => {
  localStorage.setItem('aesthetic_orders', JSON.stringify(newOrders))
}, { deep: true })

export function useCart() {
  
  // Computeds for prices
  const cartItemsCount = computed(() => {
    return cart.value.reduce((total, item) => total + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return cart.value.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  })

  const discount = computed(() => {
    if (!appliedCoupon.value || subtotal.value === 0) return 0
    
    const coupon = appliedCoupon.value
    if (coupon.type === 'percentage') {
      return Number((subtotal.value * (coupon.value / 100)).toFixed(2))
    }
    if (coupon.type === 'fixed') {
      if (coupon.minSubtotal && subtotal.value < coupon.minSubtotal) {
        return 0
      }
      return coupon.value
    }
    return 0
  })

  const shipping = computed(() => {
    if (subtotal.value === 0) return 0
    if (appliedCoupon.value?.type === 'shipping') return 0
    if (subtotal.value >= 200) return 0 // Free shipping on orders over $200
    return 15.00 // Standard flat rate
  })

  const tax = computed(() => {
    if (subtotal.value === 0) return 0
    const taxableSubtotal = Math.max(0, subtotal.value - discount.value)
    return Number((taxableSubtotal * 0.08).toFixed(2)) // 8% sales tax
  })

  const total = computed(() => {
    const finalVal = subtotal.value - discount.value + shipping.value + tax.value
    return Number(Math.max(0, finalVal).toFixed(2))
  })

  // Cart operations
  const addToCart = (product) => {
    const existing = cart.value.find(item => item.product.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      cart.value.push({ product, quantity: 1 })
    }
  }

  const removeFromCart = (productId) => {
    const index = cart.value.findIndex(item => item.product.id === productId)
    if (index !== -1) {
      cart.value.splice(index, 1)
    }
  }

  const updateQuantity = (productId, amount) => {
    const item = cart.value.find(item => item.product.id === productId)
    if (item) {
      item.quantity += amount
      if (item.quantity < 1) {
        removeFromCart(productId)
      }
    }
  }

  const clearCart = () => {
    cart.value = []
    appliedCoupon.value = null
  }

  // Promo operations
  const applyPromoCode = (code) => {
    const sanitized = code.trim().toUpperCase()
    const coupon = VALID_COUPONS[sanitized]
    
    if (!coupon) {
      return { success: false, message: 'Invalid promo code. Try SAVE10, FREESHIP, or DESKGLOW.' }
    }
    
    if (coupon.minSubtotal && subtotal.value < coupon.minSubtotal) {
      return { 
        success: false, 
        message: `This promo requires a minimum purchase of $${coupon.minSubtotal}.` 
      }
    }
    
    appliedCoupon.value = coupon
    return { success: true, message: `Promo code applied: ${coupon.description}` }
  }

  const removePromoCode = () => {
    appliedCoupon.value = null
  }

  // Checkout operations
  const checkoutOrder = (shippingInfo, paymentInfo) => {
    const orderId = 'ORD-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
    
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString(undefined, { 
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      }),
      items: [...cart.value],
      subtotal: subtotal.value,
      discount: discount.value,
      shipping: shipping.value,
      tax: tax.value,
      total: total.value,
      shippingInfo: { ...shippingInfo },
      paymentInfo: {
        cardBrand: paymentInfo.cardNumber.startsWith('4') ? 'Visa' : paymentInfo.cardNumber.startsWith('5') ? 'Mastercard' : 'Amex',
        cardLast4: paymentInfo.cardNumber.slice(-4)
      },
      status: 'Processing'
    }

    orders.value.unshift(newOrder)
    clearCart()
    return newOrder
  }

  return {
    products: productsList,
    cart,
    appliedCoupon,
    orders,
    cartItemsCount,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyPromoCode,
    removePromoCode,
    checkoutOrder
  }
}
