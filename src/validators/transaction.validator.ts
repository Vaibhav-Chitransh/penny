import {z} from 'zod';

export const CreateTransactionSchema = z.object({
    type: z.enum(["income", "expense"]),
    amount: z.number().positive("Amount must be greater than 0"),
    category: z.string(),
    note: z.string().trim().max(200).optional(),
    date: z.coerce.date(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;

export const UpdateTransactionSchema = z.object({
    type: z.enum(["income", "expense"]).optional(),
    amount: z.number().positive().optional(),
    category: z.string().optional(),
    note: z.string().trim().max(200).optional(),
    date: z.coerce.date().optional()
}).strict();

export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;