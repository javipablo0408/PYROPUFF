import { Hero } from "@/components/home/Hero";
import { WhyPartner } from "@/components/home/WhyPartner";
import { ShopSection } from "@/components/home/ShopSection";
import { Certifications } from "@/components/home/Certifications";
import { ContactCTA } from "@/components/home/ContactCTA";
import { getProducts } from "@/lib/getProducts";

export default async function Home({
  searchParams,
}: {
  searchParams: { category?: string; subcategory?: string; page?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const offset = (page - 1) * limit;

  const products = await getProducts({
    category: searchParams.category,
    subcategory: searchParams.subcategory,
    limit,
    offset,
  });

  return (
    <div className="min-h-screen">
      <Hero />
      <ShopSection 
        products={products} 
        currentPage={page}
        category={searchParams.category}
        subcategory={searchParams.subcategory}
      />
      <Certifications />
      <WhyPartner />
      <ContactCTA />
    </div>
  );
}
