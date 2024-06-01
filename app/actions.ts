'use server'
import { z } from 'zod'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import prisma from './lib/db'; // adjust the import path as necessary
import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';

export type State = {
    status: 'error' | 'success' | undefined;
    errors?: {
        [key: string]: string[];
    };
    message?: string | null;
}

// Event schema
const eventFormSchema = z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
    description: z.string().min(3, { message: 'Description must be at least 3 characters long' }).max(400, { message: 'Description must be less than 400 characters' }),
    location: z.string().min(3, { message: 'Location must be at least 3 characters long' }).max(400, { message: 'Location must be less than 400 characters' }),
    imageUrl: z.string(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    categoryId: z.string(),
    price: z.string(),
    isFree: z.boolean(),
    url: z.string().url()
})

// User Settings schema   
const userSettingsSchema = z.object({
    firstName: z
        .string()
        .min(1, { message: 'Must contain at least 3 characters' })
        .or(z.literal(''))
        .optional(),
    lastName: z
        .string()
        .min(1, { message: 'Last Name is required' })
        .or(z.literal(''))
        .optional(),
})

export async function SellEvent(prevState: any, formData: FormData) {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
        throw new Error('You must be logged in to create an event')
    }
    const validateFields = eventFormSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        location: formData.get('location'),
        imageUrl: formData.get('imageUrl'),
        startDateTime: new Date(formData.get('startDateTime') as string),
        endDateTime: new Date(formData.get('endDateTime') as string),
        categoryId: formData.get('categoryId'),
        price: formData.get('price'),
        isFree: formData.get('isFree') === 'true',
        url: formData.get('url'),
    });
    if (!validateFields.success) {
        const state: State = {
            status: 'error',
            errors: validateFields.error.flatten().fieldErrors,
            message: 'Oops something went wrong with your inputs'
        };

        return state;
    }
    console.log('Prisma Client:', prisma);

    const data = await prisma.event.create({
        data: {
            title: validateFields.data.title,
            description: validateFields.data.description,
            location: validateFields.data.location,
            imageUrl: validateFields.data.imageUrl,
            startDateTime: validateFields.data.startDateTime,
            endDateTime: validateFields.data.endDateTime,
            categoryId: parseInt(validateFields.data.categoryId),
            price: validateFields.data.price,
            isFree: validateFields.data.isFree,
            url: validateFields.data.url,
            organizerId: user.id,
        }
    });

    return redirect(`/event/${data.id}`);
}

// User settings form

export async function UpdateUserSettings(prevState: any, formData: FormData) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        throw new Error('You must be logged in to update your settings');
    }
    const validateFields = userSettingsSchema.safeParse({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
    });
    if (!validateFields.success) {
        const state: State = {
            status: 'error',
            errors: validateFields.error.flatten().fieldErrors,
            message: 'Oops something went wrong with your inputs'
        };
        return state;
    }
    await prisma.user.update({
        where: { id: user.id },
        data: {
            firstName: validateFields.data.firstName,
            lastName: validateFields.data.lastName,
        }
    });
    const state: State = {
        status: 'success',
        message: 'Your settings have been successfully updated'
    };
    return state;
}

// Stripe payment

export async function BuyEvent(formData: FormData) {
    const id = formData.get('id') as string;
    const data = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        select: {
            title: true,
            description: true,
            price: true,
            imageUrl: true,
            url: true,
        }
    });

    let unitAmount = 0;
    if (typeof data?.price === 'number') {
        unitAmount = Math.round(data.price * 100);
    } else {
        // Handle the case where price is not a number, e.g., set a default value or throw an error
        throw new Error('Price is not a valid number');
    }

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: unitAmount,
                    product_data: {
                        name: data?.title as string,
                        description: data?.description,
                        images: [data?.imageUrl],
                    }
                },
                quantity: 1,
            },
        ],
        success_url: 'http://localhost:3000/payment/success',
        cancel_url: 'http://localhost:3000/payment/cancel',
    });

    return redirect(session.url as string);
}

// Update event
export async function UpdateEvent(prevState: any, formData: FormData) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        throw new Error('You must be logged in to update an event');
    }
    const eventId = formData.get('id') as string;
    const validateFields = eventFormSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        location: formData.get('location'),
        imageUrl: formData.get('imageUrl'),
        startDateTime: new Date(formData.get('startDateTime') as string),
        endDateTime: new Date(formData.get('endDateTime') as string),
        categoryId: formData.get('categoryId'),
        price: formData.get('price'),
        isFree: formData.get('isFree') === 'true',
        url: formData.get('url'),
    });
    if (!validateFields.success) {
        const state: State = {
            status: 'error',
            errors: validateFields.error.flatten().fieldErrors,
            message: 'Oops something went wrong with your inputs'
        };

        return state;
    }

    const event = await prisma.event.findUnique({
        where: { id: parseInt(eventId) }
    });

    if (event?.organizerId !== user.id) {
        throw new Error('You do not have permission to update this event');
    }

    const data = await prisma.event.update({
        where: { id: parseInt(eventId) },
        data: {
            title: validateFields.data.title,
            description: validateFields.data.description,
            location: validateFields.data.location,
            imageUrl: validateFields.data.imageUrl,
            startDateTime: validateFields.data.startDateTime,
            endDateTime: validateFields.data.endDateTime,
            categoryId: parseInt(validateFields.data.categoryId),
            price: validateFields.data.price,
            isFree: validateFields.data.isFree,
            url: validateFields.data.url,
        }
    });

    return redirect(`/event/${data.id}`);
}
