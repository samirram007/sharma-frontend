import { roleListSchema } from '@/features/modules/role/data/schema';
import { userSchema } from '../../modules/user/data/schema';
import type z from 'zod';


export const userSchemaWithRole = userSchema.extend({
    roles: roleListSchema.optional(),

});

export type UserWithRole = z.infer<typeof userSchemaWithRole>;