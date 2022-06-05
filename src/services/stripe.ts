import Stripe from 'stripe';
import projectPackage from '../../package.json'

export const stripe = new Stripe(String(process.env.STRIPE_API_KEY), {
  apiVersion: '2020-08-27',
  appInfo: {
    name: 'ignews',
    version: projectPackage.version
  }
});