import { z } from 'zod';

export type ProductFormValues = {
  categoryId: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  brand?: string;
  price: string;
  compareAtPrice?: string;
  stockQuantity: string;
  isFeatured?: boolean;
  imageUrls: string;
  specifications: string;
};

export const productFormSchema = z.object({
  categoryId: z.string().min(1, 'دسته‌بندی محصول الزامی است.'),
  name: z.string().min(2, 'نام محصول الزامی است.'),
  slug: z.string().min(2, 'اسلاگ محصول الزامی است.'),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  price: z.coerce.number().min(1, 'قیمت باید بزرگ‌تر از صفر باشد.'),
  compareAtPrice: z.union([z.literal(''), z.coerce.number().min(0)]).optional(),
  stockQuantity: z.coerce.number().min(0, 'موجودی نمی‌تواند منفی باشد.'),
  isFeatured: z.boolean().optional(),
  imageUrls: z.string().optional(),
  specifications: z.string().optional(),
});
