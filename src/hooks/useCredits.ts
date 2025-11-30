import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PlanType } from '@prisma/client';

interface PlanDetails {
  name: string;
  price: number;
  currency: string;
  credits: number;
  maxStores: number;
  features: string[];
}

interface CreditState {
  balance: number;
  plan: PlanType;
  planDetails: PlanDetails | null;
  loading: boolean;
  error: string | null;
}

export function useCredits() {
  const { data: session } = useSession();
  const [state, setState] = useState<CreditState>({
    balance: 0,
    plan: 'FREE' as PlanType,
    planDetails: null,
    loading: true,
    error: null,
  });

  const fetchCredits = async () => {
    if (!session?.user) return;

    try {
      const res = await fetch('/api/credits/balance');
      if (!res.ok) throw new Error('Failed to fetch credits');

      const data = await res.json();
      setState({
        balance: data.balance,
        plan: data.plan,
        planDetails: data.planDetails,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching credits:', error);
      setState(prev => ({ ...prev, loading: false, error: 'Failed to load credits' }));
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchCredits();
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [session]);

  return { ...state, refreshCredits: fetchCredits };
}
