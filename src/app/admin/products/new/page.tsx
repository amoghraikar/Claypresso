import ProductForm from '../ProductForm';

export const metadata = {
  title: 'New Product | Claypresso Admin',
};

export default function NewProductPage() {
  return <ProductForm isEdit={false} />;
}
