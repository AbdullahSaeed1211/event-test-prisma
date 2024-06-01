'use server'
import { BuyEvent } from "@/app/actions";
import { EventDescription } from "@/app/components/EventDescription";
import { BuyButton } from "@/app/components/SubmitButton";
import prisma from "@/app/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { JSONContent } from "@tiptap/react";
import Image from "next/image";

async function getData(id: string) {
  const data = await prisma.event.findUnique({
    where: {
      id: parseInt(id),
    },
    select: {
      category: true,
      id: true,
      description: true,
      price: true,
      smallDescription: true,
      title: true,
      images: true,
      startDateTime: true,
      User: {
        select: {
          profileImage: true,
          firstName: true,
        },
      },
    },
  });
  return data;
}

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  noStore();
  const data = await getData(params.id);
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-8 lg:grid lg:grid-rows-1 lg:grid-cols-7 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
      <Carousel className="lg:row-end-1 lg:col-span-4">
        <CarouselContent>
          {data?.images.map((item, index) => (
            <CarouselItem key={index}>
              <div className="aspect-w-4 aspect-h-3 rounded-lg bg-gray-100 overflow-hidden">
                <Image
                  src={item as string}
                  alt="Event Images"
                  fill
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-16" />
        <CarouselNext className="mr-16" />
      </Carousel>
      <div className="max-w-2xl mx-auto mt-5 lg:max-w-none lg:mt-0 lg:row-end-2 lg:col-span-3 lg:row-span-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          {data?.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{data?.smallDescription}</p>
        <form action={BuyEvent}>
          <input type="hidden" name="id" value={data?.id} />
          <BuyButton price={data?.price as number} />
        </form>
        <div className="border-t border-gray-200 mt-10 pt-10">
          <div className="grid grid-cols-2 w-full gap-y-3">
            <h3 className="text-sm font-medium text-muted-foreground col-span-1">
              Start Date:
            </h3>
            <h3 className="text-sm text-[#16A085] font-medium col-span-1">
              {new Intl.DateTimeFormat("en-US", {
                dateStyle: "long",
                timeStyle: "short",
              }).format(data?.startDateTime)}
            </h3>
            <h3 className="text-sm font-medium text-muted-foreground col-span-1">
              Category:
            </h3>
            <h3 className="text-sm font-medium text-[#16A085] col-span-1">
              {data?.category}
            </h3>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-10" />
      </div>
      <div className="w-full max-w-2xl mx-auto mt-16 lg:max-w-none lg:mt-0 lg:col-span-4">
        <EventDescription content={data?.description as JSONContent} />
      </div>
    </section>
  );
}