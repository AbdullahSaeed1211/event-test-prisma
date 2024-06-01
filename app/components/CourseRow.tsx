import Link from "next/link";
import { CourseCard, LoadingEventCard } from "./EventCard";
import prisma from "../lib/db";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface iAppProps {
  category: "newest" | "music" | "business" | "tech";
}

async function getData({ category }: iAppProps) {
  switch (category) {
    case "newest": {
      const data = await prisma.event.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          startDateTime: true,
          price: true,
        },
        take: 3,
        orderBy: {
          startDateTime: "desc",
        },
      });
      return { data: data, title: "Newest Events", link: "/events/all" };
    }
    case "music": {
      const data = await prisma.event.findMany({
        where: {
          category: "music",
        },
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          startDateTime: true,
          price: true,
        },
        take: 3,
      });
      return {
        data: data,
        title: "Music Events",
        link: "/events/music",
      };
    }
    case "business": {
      const data = await prisma.event.findMany({
        where: {
          category: "business",
        },
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          startDateTime: true,
          price: true,
        },
        take: 3,
      });
      return { data: data, title: "Business Events", link: "/events/business" };
    }
    case "tech": {
      const data = await prisma.event.findMany({
        where: {
          category: "tech",
        },
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          startDateTime: true,
          price: true,
        },
        take: 3,
      });
      return { data: data, title: "Tech Events", link: "/events/tech" };
    }
    default: {
      return notFound();
    }
  }
}

export function CourseRow({ category }: iAppProps) {
  return (
    <section className="mt-12">
      <Suspense fallback={<LoadingState />}>
        <LoadRows category={category} />
      </Suspense>
    </section>
  );
}

async function LoadRows({ category }: iAppProps) {
  const data = await getData({ category: category });

  return (
    <>
      <div className="md:flex md:items-center md:justify-between">
        <h2 className="text-2xl font-extrabold tracking-tighter">
          {data.title}
        </h2>
        <Link
          href={data.link}
          className="text-sm hidden font-medium text-primary hover:text-primary/90 md:block"
        >
          All Events
          <span className="">&rarr;</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 mt-4 gap-10">
        {data.data.map((event) => (
          <CourseCard
            key={event.id}
            imageUrl={event.imageUrl}
            title={event.title}
            description={event.description}
            startDateTime={event.startDateTime}
            price={event.price}
            id={event.id}
          />
        ))}
      </div>
    </>
  );
}

function LoadingState() {
  return (
    <div>
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-10 lg:grid-cols-3">
        <LoadingEventCard />
        <LoadingEventCard />
        <LoadingEventCard />
      </div>
    </div>
  );
}
