import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from 'stream';
import Stripe from "stripe";
import { stripe as stripeService } from '../../services/stripe';
import { saveSubscription } from "./_lib/manageSubscription";
async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chunks)
}

export const config = {
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export default async function webhooks(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'POST') {
    const buff = await buffer(request);

    const secret = request.headers['stripe-signature'];

    let event: Stripe.Event;
    try {
      event = stripeService.webhooks.constructEvent(buff, secret, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.log(err.message);
      return response.status(400).send(`Webhook error: ${err.message}`);
    }

    if (relevantEvents.has(event.type)) {

      try {
        switch (event.type) {
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription;
            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            );
            break;
          case 'checkout.session.completed':
            const checkoutSession = event.data.object as Stripe.Checkout.Session;
            await saveSubscription(checkoutSession.subscription.toString(), checkoutSession.customer.toString(), true);
            break;
          default:
            throw new Error('unhandled Event');
        }
      } catch (err) {
        return response.status(400).json({
          message: `Webhook handler Failed: ${err.message}`
        })
      }

    }
    response.json({ received: true })
  } else {
    response.setHeader('Allow', 'POST');
    response.status(405).send('Method Not Allowed')
  }
}