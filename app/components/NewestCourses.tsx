import Link from "next/link";
import prisma from "../lib/db";
import { ArrowBigLeft, ArrowRight } from "lucide-react";
import { EventCard } from "./EventCard";

async function getData() {
  const data = await prisma.event.findMany({
    select: {
      price: true,
      description: true,
      imageUrl: true,
      category: true,
      id: true,
      title: true,
    },
    take: 4,
    orderBy: {
      startDateTime: "desc",
    },
  });
  return data;
}

export async function NewestCourse() {
  const data = await getData();
  return (
    <section className="mt-12">
      <div className="md:flex md:items-center md:justify-between">
        <h2 className="text-2xl font-extrabold tracking-tighter">
          Newest Events
        </h2>
        <Link
          href="#"
          className="text-sm hidden font-medium text-primary hover:text-primary/90 md:block"
        >
          All Events
          <span className="">&rarr;</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 mt-4 gap-10">
        {data.map((event) => (
          <EventCard
            key={event.id}
            imageUrl={event.imageUrl}
            title={event.title}
            description={event.description}
            price={event.price}
            id={event.id}
          />
        ))}
      </div>
    </section>
  );
}
