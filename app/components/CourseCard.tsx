import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface iAppProps {
  images: string[];
  title: string; // Changed from 'name' to 'title'
  price: string; // Changed to string as per event schema
  description: string; // Changed from 'smallDescription' to 'description'
  id: string;
}

export default function CourseCard({
  images,
  title,
  price,
  description,
  id,
}: iAppProps) {
  return (
    <div className="rounded-lg">
      <Carousel className="w-full mx-auto">
        <CarouselContent>
          {images.map((item, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[230px]">
                <Image
                  src={item}
                  alt="event image" // Updated alt text
                  fill
                  className="object-fit w-full h-full rounded-lg"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-16" />
        <CarouselNext className="mr-16" />
      </Carousel>
      <div className="flex justify-between items-center mt-2">
        <h1 className="font-semibold text-xl">{title}</h1> {/* Changed from 'name' to 'title' */}
        <h3 className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/10">
          ${price}
        </h3>
      </div>
      <p className="text-gray-600 text-sm line-clamp-2 mt-2">
        {description}
      </p> {/* Changed from 'smallDescription' to 'description' */}
      <Button asChild className="mt-5 w-full">
        <Link href={`/event/${id}`}>Learn More!</Link> {/* Changed URL path */}
      </Button>
    </div>
  );
}

export function LoadingCourseCard() {
  return (
    <div className="flex flex-col">
      <Skeleton className="w-full h-[230px]" />
      <div className="flex flex-col mt-2 gap-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-6" />
      </div>
      <Skeleton className="w-full h-10 mt-5" />
    </div>
  );
}
