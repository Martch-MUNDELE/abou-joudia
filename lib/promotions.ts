import type {
  PromotionAppliedBenefit,
  PromotionApplicationResult,
  PromotionBenefit,
  PromotionCartLine,
  PromotionEngineInputRule,
  PromotionProductCandidate,
  PromotionRejected,
  PromotionRule,
} from './types/promotion'

type SiteCapabilities = {
  vipEnabled?: boolean
}

type ProductRecord = PromotionProductCandidate & Record<string, unknown>

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function getLineRecord(line: PromotionCartLine): Record<string, unknown> {
  return line as unknown as Record<string, unknown>
}

function getProductRecord(product: unknown): ProductRecord {
  return asRecord(product) as ProductRecord
}

function getProductId(product: ProductRecord): string {
  const id = product.id ?? product.product_id
  return typeof id === 'string' ? id : ''
}

function getProductName(product: ProductRecord): string {
  const name = product.name ?? product.product_name ?? product.title
  return typeof name === 'string' ? name : 'Produit offert'
}

function getProductPrice(product: ProductRecord): number {
  return toNumber(product.price ?? product.unit_price ?? product.sale_price, 0)
}

function isVipLine(line: PromotionCartLine): boolean {
  const lineRecord = getLineRecord(line)
  const product = getProductRecord(line.product)

  return Boolean(
    lineRecord.is_vip ??
      lineRecord.isVip ??
      product.is_vip ??
      product.isVip ??
      line.line_type === 'vip',
  )
}

function isPromotionGiftLine(line: PromotionCartLine): boolean {
  return Boolean(line.is_promotion_gift || line.line_type === 'promotion_gift')
}

function canLineTriggerPromotion(line: PromotionCartLine): boolean {
  if (isPromotionGiftLine(line)) return false
  if (line.can_trigger_promotion === false) return false
  return true
}

function isProductSelectable(product: ProductRecord): boolean {
  if (product.active === false) return false
  if (product.visible === false) return false
  if (product.is_visible === false) return false
  if (product.hidden === true) return false
  if (product.disabled === true) return false
  if (product.available === false) return false
  if (product.is_available === false) return false
  if (product.status === 'inactive') return false
  if (product.status === 'disabled') return false
  if (product.status === 'hidden') return false
  return true
}

function getSubtotal(items: PromotionCartLine[]): number {
  return roundMoney(
    items
      .filter((line) => !isPromotionGiftLine(line))
      .reduce((sum, line) => sum + toNumber(line.unit_price) * toNumber(line.quantity), 0),
  )
}

function getQuantity(items: PromotionCartLine[]): number {
  return items
    .filter((line) => !isPromotionGiftLine(line))
    .reduce((sum, line) => sum + toNumber(line.quantity), 0)
}

function hasClassic(items: PromotionCartLine[]): boolean {
  return items.some((line) => canLineTriggerPromotion(line) && !isVipLine(line))
}

function hasVip(items: PromotionCartLine[]): boolean {
  return items.some((line) => canLineTriggerPromotion(line) && isVipLine(line))
}

function ruleScopeMatches(
  rule: PromotionEngineInputRule,
  items: PromotionCartLine[],
  siteCapabilities: SiteCapabilities,
): boolean {
  if (rule.scope === 'all') return true

  if (rule.scope === 'classic') return hasClassic(items)

  if (rule.scope === 'vip') {
    if (siteCapabilities.vipEnabled === false) return false
    return hasVip(items)
  }

  if (rule.scope === 'mixed') {
    if (siteCapabilities.vipEnabled === false) return false
    return hasClassic(items) && hasVip(items)
  }

  return true
}

function lineMatchesProduct(line: PromotionCartLine, productIds: string[]): boolean {
  if (productIds.length === 0) return false
  return productIds.includes(line.product_id)
}

function lineMatchesCategory(line: PromotionCartLine, categoryIds: string[]): boolean {
  if (categoryIds.length === 0) return false

  const product = getProductRecord(line.product)
  const values = [
    product.category_id,
    product.categoryId,
    product.category,
    product.category_slug,
    product.subcategory_id,
    product.subcategoryId,
    product.subcategory,
    product.sub_category,
    product.subSubcategory,
    product.sub_subcategory,
  ]

  return values.some((value) => typeof value === 'string' && categoryIds.includes(value))
}

function ruleTriggerMatches(rule: PromotionEngineInputRule, items: PromotionCartLine[]): boolean {
  const triggerableItems = items.filter(canLineTriggerPromotion)

  if (rule.trigger_type === 'cart_amount') {
    const minimum = rule.minimum_order_amount ?? 0
    return getSubtotal(triggerableItems) >= minimum
  }

  if (rule.trigger_type === 'cart_quantity') {
    const minimum = rule.minimum_quantity ?? 0
    return getQuantity(triggerableItems) >= minimum
  }

  if (rule.trigger_type === 'classic_purchase') return hasClassic(triggerableItems)

  if (rule.trigger_type === 'vip_purchase') return hasVip(triggerableItems)

  if (rule.trigger_type === 'mixed_purchase') {
    return hasClassic(triggerableItems) && hasVip(triggerableItems)
  }

  if (rule.trigger_type === 'product') {
    return triggerableItems.some((line) => lineMatchesProduct(line, rule.trigger_product_ids ?? []))
  }

  if (rule.trigger_type === 'category') {
    return triggerableItems.some((line) => lineMatchesCategory(line, rule.trigger_category_ids ?? []))
  }

  if (rule.trigger_type === 'promo_code') {
    return Boolean(rule.code)
  }

  return true
}

function normalizePromotionBenefits(rule: PromotionEngineInputRule): PromotionBenefit[] {
  if (Array.isArray(rule.benefits) && rule.benefits.length > 0) {
    return [...rule.benefits].sort((a, b) => (a.sort_order ?? 100) - (b.sort_order ?? 100))
  }

  if (rule.benefit_type === 'gift_product') {
    return (rule.gift_product_ids ?? []).map((productId, index) => ({
      id: null,
      promotion_rule_id: rule.id,
      benefit_type: 'gift_product',
      product_id: productId,
      quantity: 1,
      discount_percent: null,
      fixed_discount_amount: null,
      free_delivery: false,
      sort_order: 100 + index,
      customer_message: rule.customer_message ?? null,
      admin_note: rule.admin_note ?? null,
    }))
  }

  if (rule.benefit_type === 'percent_discount') {
    return [
      {
        id: null,
        promotion_rule_id: rule.id,
        benefit_type: 'percent_discount',
        product_id: null,
        quantity: null,
        discount_percent: rule.discount_percent ?? null,
        fixed_discount_amount: null,
        free_delivery: false,
        sort_order: 100,
        customer_message: rule.customer_message ?? null,
        admin_note: rule.admin_note ?? null,
      },
    ]
  }

  if (rule.benefit_type === 'free_delivery') {
    return [
      {
        id: null,
        promotion_rule_id: rule.id,
        benefit_type: 'free_delivery',
        product_id: null,
        quantity: null,
        discount_percent: null,
        fixed_discount_amount: null,
        free_delivery: true,
        sort_order: 100,
        customer_message: rule.customer_message ?? null,
        admin_note: rule.admin_note ?? null,
      },
    ]
  }

  return []
}

function makeAppliedBenefit(
  rule: PromotionEngineInputRule,
  benefit: PromotionBenefit,
  amount: number,
  giftProductIds: string[] = [],
  affectedProductIds: string[] = [],
): PromotionAppliedBenefit {
  return {
    promotion_id: rule.id,
    promotion_name: rule.name,
    benefit_type: benefit.benefit_type,
    amount: roundMoney(amount),
    gift_product_ids: giftProductIds,
    affected_product_ids: affectedProductIds,
    promotion_benefit_id: benefit.id ?? null,
    promo_code: rule.code ?? null,
    free_delivery_applied: benefit.benefit_type === 'free_delivery',
    delivery_discount_amount: benefit.benefit_type === 'free_delivery' ? roundMoney(amount) : 0,
  }
}

function applyGiftProductBenefit(
  items: PromotionCartLine[],
  productCatalog: PromotionProductCandidate[],
  rule: PromotionEngineInputRule,
  benefit: PromotionBenefit,
): {
  items: PromotionCartLine[]
  applied?: PromotionAppliedBenefit
  rejected?: PromotionRejected
  giftValue: number
} {
  const productId = benefit.product_id

  if (!productId) {
    return { items, giftValue: 0 }
  }

  const product = productCatalog.map(getProductRecord).find((candidate) => getProductId(candidate) === productId)

  if (!product || !isProductSelectable(product)) {
    return { items, giftValue: 0 }
  }

  const quantity = Math.max(1, Math.floor(toNumber(benefit.quantity, 1)))
  const giftValue = roundMoney(getProductPrice(product) * quantity)

  const giftLine: PromotionCartLine = {
    product_id: getProductId(product),
    product_name: getProductName(product),
    quantity,
    unit_price: 0,
    original_unit_price: getProductPrice(product),
    product,
    line_type: 'promotion_gift',
    is_promotion_gift: true,
    promotion_rule_id: rule.id,
    promotion_label: rule.name,
    can_trigger_promotion: false,
    is_vip: false,
  }

  return {
    items: [...items, giftLine],
    applied: makeAppliedBenefit(rule, benefit, giftValue, [productId], []),
    giftValue,
  }
}

function lineCanReceivePercentDiscount(line: PromotionCartLine, rule: PromotionEngineInputRule): boolean {
  if (isPromotionGiftLine(line)) return false
  if (rule.exclude_discounted_products === false) return true
  if ((line.discount_percent ?? 0) > 0) return false
  if ((line.discount_amount ?? 0) > 0) return false
  return true
}

function applyPercentDiscountBenefit(
  items: PromotionCartLine[],
  rule: PromotionEngineInputRule,
  benefit: PromotionBenefit,
): {
  items: PromotionCartLine[]
  applied?: PromotionAppliedBenefit
  discountValue: number
} {
  const percent = toNumber(benefit.discount_percent ?? rule.discount_percent, 0)

  if (percent <= 0) {
    return { items, discountValue: 0 }
  }

  const affectedProductIds: string[] = []
  let discountValue = 0

  const nextItems = items.map((line) => {
    if (!lineCanReceivePercentDiscount(line, rule)) return line

    const currentUnitPrice = toNumber(line.unit_price, 0)
    const quantity = toNumber(line.quantity, 0)
    const unitDiscount = roundMoney(currentUnitPrice * (percent / 100))
    const newUnitPrice = Math.max(0, roundMoney(currentUnitPrice - unitDiscount))
    const lineDiscount = roundMoney(unitDiscount * quantity)

    if (lineDiscount <= 0) return line

    affectedProductIds.push(line.product_id)
    discountValue += lineDiscount

    return {
      ...line,
      original_unit_price: line.original_unit_price ?? currentUnitPrice,
      unit_price: newUnitPrice,
      discount_percent: percent,
      discount_amount: roundMoney((line.discount_amount ?? 0) + lineDiscount),
      promotion_rule_id: rule.id,
      promotion_label: rule.name,
    }
  })

  discountValue = roundMoney(discountValue)

  return {
    items: nextItems,
    applied: discountValue > 0 ? makeAppliedBenefit(rule, benefit, discountValue, [], affectedProductIds) : undefined,
    discountValue,
  }
}

function applyFreeDeliveryBenefit(
  rule: PromotionEngineInputRule,
  benefit: PromotionBenefit,
): PromotionAppliedBenefit {
  return makeAppliedBenefit(rule, benefit, 0, [], [])
}

function applyPromotionBenefits(
  items: PromotionCartLine[],
  productCatalog: PromotionProductCandidate[],
  rule: PromotionEngineInputRule,
  benefits: PromotionBenefit[],
): {
  items: PromotionCartLine[]
  applied: PromotionAppliedBenefit[]
  discountTotal: number
  giftTotalValue: number
  freeDeliveryApplied: boolean
} {
  let currentItems = items
  const applied: PromotionAppliedBenefit[] = []
  let discountTotal = 0
  let giftTotalValue = 0
  let freeDeliveryApplied = false
  let percentDiscountApplied = false

  benefits.forEach((benefit) => {
    if (benefit.benefit_type === 'gift_product') {
      const result = applyGiftProductBenefit(currentItems, productCatalog, rule, benefit)
      currentItems = result.items
      giftTotalValue += result.giftValue
      if (result.applied) applied.push(result.applied)
      return
    }

    if (benefit.benefit_type === 'percent_discount') {
      if (percentDiscountApplied) return

      const result = applyPercentDiscountBenefit(currentItems, rule, benefit)
      currentItems = result.items
      discountTotal += result.discountValue
      if (result.applied) {
        applied.push(result.applied)
        percentDiscountApplied = true
      }
      return
    }

    if (benefit.benefit_type === 'free_delivery') {
      applied.push(applyFreeDeliveryBenefit(rule, benefit))
      freeDeliveryApplied = true
    }
  })

  return {
    items: currentItems,
    applied,
    discountTotal: roundMoney(discountTotal),
    giftTotalValue: roundMoney(giftTotalValue),
    freeDeliveryApplied,
  }
}

export function applyGiftProducts(
  items: PromotionCartLine[],
  productCatalog: PromotionProductCandidate[],
  rule: PromotionRule,
): PromotionCartLine[] {
  const benefits = normalizePromotionBenefits(rule as PromotionEngineInputRule).filter(
    (benefit) => benefit.benefit_type === 'gift_product',
  )

  return benefits.reduce(
    (currentItems, benefit) => applyGiftProductBenefit(currentItems, productCatalog, rule, benefit).items,
    items,
  )
}

export function applyPercentDiscount(
  items: PromotionCartLine[],
  rule: PromotionRule,
): PromotionCartLine[] {
  const benefits = normalizePromotionBenefits(rule as PromotionEngineInputRule).filter(
    (benefit) => benefit.benefit_type === 'percent_discount',
  )

  return benefits.reduce(
    (currentItems, benefit) => applyPercentDiscountBenefit(currentItems, rule, benefit).items,
    items,
  )
}

export function applyPromotions(
  items: PromotionCartLine[],
  productCatalog: PromotionProductCandidate[],
  rules: PromotionEngineInputRule[],
  siteCapabilities: SiteCapabilities = {},
): PromotionApplicationResult {
  let currentItems = items
  const applied: PromotionAppliedBenefit[] = []
  const rejected: PromotionRejected[] = []
  let discountTotal = 0
  let giftTotalValue = 0
  let freeDeliveryApplied = false
  let appliedPromoCode: string | null = null

  rules.forEach((rule) => {
    if (rule.status !== 'active') return
    if (!ruleScopeMatches(rule, currentItems, siteCapabilities)) return
    if (!ruleTriggerMatches(rule, currentItems)) return

    const benefits = normalizePromotionBenefits(rule)

    if (benefits.length === 0) return

    const result = applyPromotionBenefits(currentItems, productCatalog, rule, benefits)

    currentItems = result.items
    applied.push(...result.applied)
    discountTotal += result.discountTotal
    giftTotalValue += result.giftTotalValue

    if (result.freeDeliveryApplied) {
      freeDeliveryApplied = true
    }

    if (rule.code) {
      appliedPromoCode = rule.code
    }
  })

  return {
    items: currentItems,
    applied,
    rejected,
    discount_total: roundMoney(discountTotal),
    gift_total_value: roundMoney(giftTotalValue),
    free_delivery_applied: freeDeliveryApplied,
    delivery_discount_amount: 0,
    applied_promo_code: appliedPromoCode,
  }
}
