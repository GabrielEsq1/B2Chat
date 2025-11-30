import { intents } from "./intents";

interface Intent {
    tag: string;
    patterns: string[];
    responses: string[];
    context: string;
}

export class OliviaService {
    private intents: Intent[];

    constructor() {
        this.intents = intents;
    }

    public process(message: string): string {
        const normalizedMessage = message.toLowerCase().trim();
        let bestMatch: Intent | null = null;
        let bestScore = 0;

        // Check static intents
        for (const intent of this.intents) {
            for (const pattern of intent.patterns) {
                const score = this.calculateSimilarity(normalizedMessage, pattern.toLowerCase());
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = intent;
                }
            }
        }

        // Threshold for matching (0.4 is a reasonable starting point for fuzzy matching)
        if (bestMatch && bestScore > 0.4) {
            return this.getRandomResponse(bestMatch.responses);
        }

        // Fallback for unknown messages
        return "No estoy segura de entender lo que dices. ¿Puedes reformularlo?";
    }

    private calculateSimilarity(s1: string, s2: string): number {
        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;
        const longerLength = longer.length;

        if (longerLength === 0) {
            return 1.0;
        }

        return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength.toString());
    }

    private editDistance(s1: string, s2: string): number {
        const costs = new Array();
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i == 0) {
                    costs[j] = j;
                } else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1)) {
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        }
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) {
                costs[s2.length] = lastValue;
            }
        }
        return costs[s2.length];
    }

    private getRandomResponse(responses: string[]): string {
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

export const olivia = new OliviaService();
