export type Category = 'boissons' | 'nourriture'
export type Subcategory = 'chaudes' | 'froides' | 'sandwichs_chauds' | 'sandwichs_froids' | 'salades'
export type OrderStatus = 'nouvelle' | 'confirmée' | 'en_preparation' | 'en_livraison' | 'livrée' | 'annulée'

export interface Product {
  id: string
  name: string
  description: string
  ingredients: string
  price: number
  category: Category
  subcategory: Subcategory
  image_url: string
  stock: number
  active: boolean
  featured?: boolean
  popular?: boolean
}

export interface DeliverySlot {
  id: string
  date: string
  time_start: string
  time_end: string
  capacity: number
  booked: number
  blocked: boolean
  notes?: string
}

export interface Order {
  id: string
  created_at: string
  status: OrderStatus
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_note?: string
  lat?: number
  lng?: number
  geo_address?: string
  slot_id: string
  total: number
  payment_method: string
  delivery_slots?: DeliverySlot
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
}

export interface CartItem {
  product: Product
  quantity: number
}
