
'use server';

/**
 * @fileOverview A skill-matching flow that suggests users based on complementary skills.
 *
 * This file defines the logic for the skill-matching feature, which is powered by a generative AI model.
 *
 * - skillMatching: An asynchronous function that takes the current user's skills and interests as input
 *   and returns a list of potential user matches.
 * - SkillMatchingInput: The Zod schema for the input of the skillMatching function.
 * - SkillMatchingOutput: The Zod schema for the output of the skillMatching function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SkillMatchingInputSchema = z.object({
  userSkills: z.array(z.string()).describe("A list of skills the current user wants to teach."),
  userInterests: z.array(z.string()).describe("A list of skills the current user is interested in learning."),
});
export type SkillMatchingInput = z.infer<typeof SkillMatchingInputSchema>;

const SkillMatchingOutputSchema = z.array(
  z.object({
    userId: z.string().describe("A unique identifier for the matched user."),
    name: z.string().describe("The full name of the matched user."),
    bio: z.string().describe("A short biography for the matched user."),
    location: z.string().describe("The location of the matched user."),
    skills: z.array(z.string()).describe("The skills the matched user can teach."),
    interests: z.array(z.string()).describe("The skills the matched user wants to learn."),
    matchedSkills: z.array(z.string()).describe("The list of skills that created the match."),
  })
);
export type SkillMatchingOutput = z.infer<typeof SkillMatchingOutputSchema>;

export async function skillMatching(input: SkillMatchingInput): Promise<SkillMatchingOutput> {
  return skillMatchingFlow(input);
}

const skillMatchingPrompt = ai.definePrompt({
  name: 'skillMatchingPrompt',
  input: { schema: SkillMatchingInputSchema },
  output: { schema: SkillMatchingOutputSchema },
  prompt: `You are a skill matching expert for the SkillSwap app. Your goal is to find skill-sharing partners for the current user by creating mock user profiles.

A match occurs if at least one of the following conditions is met:
1. The current user's teaching skills (userSkills) overlap with a mock user's learning interests.
2. The current user's learning interests (userInterests) overlap with a mock user's teaching skills.

Current User's Profile:
- Skills to Teach: {{userSkills}}
- Skills to Learn: {{userInterests}}

Based on the current user's profile, generate a list of 5-10 realistic, mock user profiles that would be a good match. For each mock user, you must:
1.  Create a unique userId (e.g., 'mock-user-1', 'mock-user-2').
2.  Generate a plausible name, bio, and location.
3.  Assign a list of skills they can teach and skills they want to learn.
4.  Ensure that there is at least one complementary skill that creates a match with the current user.
5.  Populate the 'matchedSkills' field with the skill(s) that created the match.

Avoid matching a user with themselves. Ensure the output is a valid JSON array of objects that follows the SkillMatchingOutputSchema.
`,
});

const skillMatchingFlow = ai.defineFlow(
  {
    name: 'skillMatchingFlow',
    inputSchema: SkillMatchingInputSchema,
    outputSchema: SkillMatchingOutputSchema,
  },
  async (input) => {
    // If the user has no skills or interests, return an empty array to avoid calling the AI with no context.
    if (input.userSkills.length === 0 && input.userInterests.length === 0) {
      return [];
    }

    const { output } = await skillMatchingPrompt(input);
    
    // The output from the AI should already be in the correct format.
    // We return it directly. The '!' asserts that output will not be null.
    return output!;
  }
);
