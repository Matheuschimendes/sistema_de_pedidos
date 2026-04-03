export function getCartStorageKey(slug: string) {
  return `mesa-cart:${slug}`;
}

export function getCustomerStorageKey(slug: string) {
  return `customer-data:${slug}`;
}
