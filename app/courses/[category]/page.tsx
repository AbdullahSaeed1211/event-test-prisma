import { EventCard } from "@/app/components/EventCard"; // Updated import
import prisma from "@/app/lib/db";
import { CategoryTypes } from "@prisma/client"; // Updated import
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

async function getData(category: string) {
  let input: CategoryTypes | undefined;
  switch (category) {
    case "creativearts": {
      input = "creativearts";
      break;
    }
    case "business": {
      input = "business";
      break;
    }
    case "tech": {
      input = "tech";
      break;
    }
    case "all": {
      input = undefined;
      break;
    }
    default: {
      return notFound();
    }
  }
  const data = await prisma.event.findMany({ // Updated query to fetch events
    where: {
      category: input,
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      price: true,
    },
  });
  return data;
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  noStore();
  const data = await getData(params.category);
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-10 mt-4">
        {data.map((event) => ( // Updated mapping to use EventCard component
          <EventCard
            key={event.id}
            images={[event.imageUrl]} // Assuming EventCard expects images as an array
            price={event.price}
            title={event.title}
            description={event.description}
            id={event.id}
          />
        ))}
      </div>
    </section>
  );
}
