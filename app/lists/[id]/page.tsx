import { getListWithItems } from "@/app/actions/lists";
import { CustomListDetails } from "@/components/media/CustomListDetails";
import { notFound } from "next/navigation";

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const list = await getListWithItems(id);
  
  if (!list) {
    return {
      title: "List Not Found - Cinematica",
    };
  }

  return {
    title: `${list.name} - Custom List - Cinematica`,
    description: list.description || `View items in your custom list "${list.name}"`,
  };
}

export default async function CustomListDetailPage({ params }: Props) {
  const { id } = await params;
  const list = await getListWithItems(id);

  if (!list) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background pt-20 md:pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        <CustomListDetails list={list as any} />
      </div>
    </main>
  );
}
