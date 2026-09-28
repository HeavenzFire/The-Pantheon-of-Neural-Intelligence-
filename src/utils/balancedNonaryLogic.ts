// src/utils/balancedNonaryLogic.ts

import { BalancedNonary } from '../types/balancedNonary';

export class BalancedNonaryLogic {
    static add(a: BalancedNonary, b: BalancedNonary): BalancedNonary {
        const sum = a + b;
        if (sum < -4) return -4;
        if (sum > 4) return 4;
        return sum as BalancedNonary;
    }

    static multiply(a: BalancedNonary, b: BalancedNonary): BalancedNonary {
        const product = a * b;
        if (product < -4) return -4;
        if (product > 4) return 4;
        return product as BalancedNonary;
    }

    static negate(a: BalancedNonary): BalancedNonary {
        return (-a) as BalancedNonary;
    }

    static abs(a: BalancedNonary): BalancedNonary {
        return Math.abs(a) as BalancedNonary;
    }

    static max(a: BalancedNonary, b: BalancedNonary): BalancedNonary {
        return Math.max(a, b) as BalancedNonary;
    }

    static min(a: BalancedNonary, b: BalancedNonary): BalancedNonary {
        return Math.min(a, b) as BalancedNonary;
    }
}
