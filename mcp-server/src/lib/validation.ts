import { z } from 'zod';
export const platformSchema = z.enum(['mobile', 'tablet', 'desktop', 'web']);
export const screenPlanSchema = { screenName: z.string().trim().min(1).max(120), platform: platformSchema, primaryTask: z.string().trim().min(1).max(500) };
export const screenMetadataSchema = { platform: platformSchema, screenName: z.string().trim().min(1).max(120), hasLoadingState: z.boolean().optional(), hasEmptyState: z.boolean().optional(), hasErrorState: z.boolean().optional(), interactiveElementCount: z.number().int().nonnegative().optional(), minTouchTarget: z.number().nonnegative().optional(), hasKeyboardOrder: z.boolean().optional(), hasSemanticLabels: z.boolean().optional(), supportsTextScaling: z.boolean().optional(), contentWidth: z.number().positive().optional() };
export function jsonResult(value: unknown) { return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] }; }
