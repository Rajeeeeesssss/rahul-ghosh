
import { notFound } from 'next/navigation';
import { getProduct } from '@/services/productService';
import { Separator } from '@/components/ui/separator';
import { RelatedProducts } from '@/components/related-products';
import { RecentlyViewedProducts } from '@/components/recently-viewed-products';
import { ProductDetailContent } from '@/components/product-detail-content';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
       <ProductDetailContent product={product} />
       <Separator className="my-12" />
       <RelatedProducts product={product} />
       <Separator className="my-12" />
       <RecentlyViewedProducts currentProductId={product.id}/>
    </div>
  );
}
