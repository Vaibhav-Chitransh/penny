import {z} from 'zod';

export const CreateCategorySchema = z.object({
    name: z.string().trim().min(1, "Category name is required").max(30, "Category name cannot exceed 30 characters"),
    type: z.enum(["income", "expense"]),
    icon: z.string().trim().min(1, "Icon is required")
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;