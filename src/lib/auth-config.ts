import { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { supabaseAdmin } from '@/lib/supabase'

// Custom Supabase adapter for NextAuth
const SupabaseAdapter = {
  async createUser(user: any) {
    const { data, error } = await supabaseAdmin
      .from('User')
      .insert({
        email: user.email,
        name: user.name,
        image: user.image,
        username: user.email?.split('@')[0],
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUser(id: string) {
    const { data } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('id', id)
      .single()
    return data
  },

  async getUserByEmail(email: string) {
    const { data } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('email', email)
      .single()
    return data
  },

  async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
    const { data: account } = await supabaseAdmin
      .from('Account')
      .select('user:User(*)')
      .eq('provider', provider)
      .eq('providerAccountId', providerAccountId)
      .single()
    
    return account?.user || null
  },

  async updateUser(user: any) {
    const { data, error } = await supabaseAdmin
      .from('User')
      .update({
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteUser(userId: string) {
    await supabaseAdmin.from('User').delete().eq('id', userId)
  },

  async linkAccount(account: any) {
    await supabaseAdmin.from('Account').insert({
      userId: account.userId,
      type: account.type,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      refresh_token: account.refresh_token,
      access_token: account.access_token,
      expires_at: account.expires_at,
      token_type: account.token_type,
      scope: account.scope,
      id_token: account.id_token,
      session_state: account.session_state,
    })
  },

  async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
    await supabaseAdmin
      .from('Account')
      .delete()
      .eq('provider', provider)
      .eq('providerAccountId', providerAccountId)
  },

  async createSession(session: any) {
    const { data, error } = await supabaseAdmin
      .from('Session')
      .insert({
        userId: session.userId,
        sessionToken: session.sessionToken,
        expires: session.expires,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getSessionAndUser(sessionToken: string) {
    const { data: session } = await supabaseAdmin
      .from('Session')
      .select('*, user:User(*)')
      .eq('sessionToken', sessionToken)
      .single()
    
    if (!session) return null
    return { session, user: session.user }
  },

  async updateSession(session: any) {
    const { data, error } = await supabaseAdmin
      .from('Session')
      .update({ expires: session.expires })
      .eq('sessionToken', session.sessionToken)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteSession(sessionToken: string) {
    await supabaseAdmin.from('Session').delete().eq('sessionToken', sessionToken)
  },
}

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter as any,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        ;(session.user as any).id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}
