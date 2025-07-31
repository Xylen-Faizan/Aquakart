export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  mode: 'payment' | 'subscription';
}

export const products: Product[] = [
  {
    id: 'prod_Shxmy51IwvrVVq',
    priceId: 'price_1RmXqq4FQ72D6RDMUO3zlTZh',
    name: 'Aquafina',
    description: '20 litre water Jar',
    price: 65.00,
    mode: 'payment',
  },
  {
    id: 'prod_ShxkUs0vlAwi2G',
    priceId: 'price_1RmXoq4FQ72D6RDM8KRj7zCj',
    name: 'Bisleri',
    description: '20 litre water jar',
    price: 85.00,
    mode: 'payment',
  },
  {
    id: 'prod_ShtjCNXBnJIcsI',
    priceId: 'price_1RmTwE4FQ72D6RDMPgcsp5Iv',
    name: 'Aquafina',
    description: '1 litre water bottle',
    price: 22.00,
    mode: 'payment',
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string): Product | undefined => {
  return products.find(product => product.priceId === priceId);
};