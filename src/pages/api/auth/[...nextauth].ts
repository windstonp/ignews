import { query } from "faunadb";
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { faunaClient } from "../../../services/fauna";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {

        await faunaClient.query(
          query.If(
            query.Not(
              query.Exists(
                query.Match(
                  query.Index('user_by_email'),
                  query.Casefold(user.email)
                )
              )
            ),
            /* IF CONDITION */
            query.Create(
              query.Collection('users'),
              { data: { email: user.email } }
            ),
            /* ELSE CONDITION */
            query.Get(
              query.Match(
                query.Index('user_by_email'),
                query.Casefold(user.email)
              )
            )
          )
        )
        return true
      } catch {
        return false
      }
    },
    async session({ session }) {
      try{
        const userActiveSubscription =  await faunaClient.query(
            query.Get(
              query.Intersection([
                query.Match(
                  query.Index("subscriptions_by_user_ref"),
                  query.Select(
                    "ref",
                    query.Get(
                      query.Match(
                        query.Index("user_by_email"),
                        query.Casefold(session.user.email)
                      )
                    )
                  )
                ),
                query.Match(query.Index("subscription_by_status"), "active"),
              ])
            )
          );

        return {
          ...session,
          activeSubscription: userActiveSubscription
        }
      }catch{
        return{
          ...session,
          activeSubscription: null
        }
      }
    }
  }
})