import { query } from "faunadb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { faunaClient } from "../../services/fauna";
import { stripe } from "../../services/stripe";

type faunaUser = {
  ref: {
    id: string
  },
  data: {
    stripeCustomerId: string
  }
}

export default async function subscribe(request: NextApiRequest, response: NextApiResponse) {

  if (request.method === 'POST') {
    const { user } = await getSession({ req: request });

    const faunaUser = await faunaClient.query<faunaUser>(
      query.Get(
        query.Match(
          query.Index('user_by_email'),
          query.Casefold(user.email)
        )
      )
    )

    let stripeCustomerId = faunaUser.data.stripeCustomerId

    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
      })

      await faunaClient.query(
        query.Update(
          query.Ref(query.Collection('users'), faunaUser.ref.id),
          {
            data: {
              stripeCustomerId: stripeCustomer.id
            }
          }
        )
      )
      stripeCustomerId = stripeCustomer.id;
    }


    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      billing_address_collection: "required",
      line_items: [
        {
          price: process.env.STRIPE_SUBSCRIPTION_ID, quantity: 1
        }
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    })

    return response.status(200).json({ sessionId: stripeCheckoutSession.id })
  } else {
    response.setHeader('Allow', 'POST');
    response.status(405).send('Method Not Allowed')
  }
}