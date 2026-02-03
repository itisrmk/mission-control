import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  
  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 })
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Calculate MRR from the invoice
  const amount = invoice.amount_paid / 100 // Convert from cents
  
  // Find project by Stripe customer ID
  const { data: project } = await supabaseAdmin
    .from('Project')
    .select('id')
    .eq('stripeAccountId', invoice.customer as string)
    .single()
  
  if (!project) return
  
  // Record the revenue metric
  await supabaseAdmin.from('Metric').insert({
    projectId: project.id,
    type: 'MRR',
    value: amount,
    metadata: {
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
    },
  })
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const { data: project } = await supabaseAdmin
    .from('Project')
    .select('id')
    .eq('stripeAccountId', subscription.customer as string)
    .single()
  
  if (!project) return
  
  // Calculate MRR from subscription items
  const mrr = subscription.items.data.reduce((acc, item) => {
    return acc + (item.plan.amount || 0) * (item.quantity || 1)
  }, 0) / 100
  
  await supabaseAdmin.from('Metric').insert({
    projectId: project.id,
    type: 'MRR',
    value: mrr,
    metadata: {
      subscriptionId: subscription.id,
      status: subscription.status,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { data: project } = await supabaseAdmin
    .from('Project')
    .select('id')
    .eq('stripeAccountId', subscription.customer as string)
    .single()
  
  if (!project) return
  
  // Record churn
  await supabaseAdmin.from('Metric').insert({
    projectId: project.id,
    type: 'CHURN_RATE',
    value: 1,
    metadata: {
      subscriptionId: subscription.id,
      event: 'subscription.deleted',
    },
  })
}
