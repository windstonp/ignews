import { signIn, useSession } from 'next-auth/react';
import { redirect } from 'next/dist/server/api-utils';
import { useRouter } from 'next/router';
import { api } from '../../services/axios';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss';

interface SubscribeButtonProps {
  priceId: string
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const { status, data } = useSession();
  
  const router = useRouter();

  async function handleSubscribe() {
    if (status === 'unauthenticated') {
      signIn('github');
      return;
    }

    if (data.activeSubscription){
      return router.push('/posts')
    }

    try {
      const response = await api.post('/subscribe');

      const { sessionId } = response.data;
      const stripeJs = await getStripeJs();

      await stripeJs.redirectToCheckout({
        sessionId: sessionId
      })
    } catch (err) {
      alert(err.message)
    }
  }
  return (
    <button type="button" onClick={handleSubscribe} className={styles.subscribeButton}>
      Subscribe now
    </button>
  )
}