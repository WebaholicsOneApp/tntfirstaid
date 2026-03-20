import { type NextRequest, NextResponse } from 'next/server';

/**
 * Contact Form API Route -- proxies to OneApp customer-forms endpoint.
 *
 * This storefront is READ-ONLY on the database. All writes (contacts,
 * conversations, messages, contact contexts) are handled by OneApp.
 * This route validates input then forwards to OneApp's public
 * customer-forms submit endpoint.
 */

// OneApp customer-forms endpoint
const ONEAPP_API_URL = process.env.ONEAPP_API_URL!;
const CUSTOMER_FORM_KEY = process.env.CUSTOMER_FORM_KEY!;

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length >= 5 && email.length <= 254;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email?.trim() || !validateEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!subject?.trim()) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Forward to OneApp customer-forms endpoint
    const oneappUrl = `${ONEAPP_API_URL}/api/v1/customer-forms/${CUSTOMER_FORM_KEY}/submit`;

    const oneappResponse = await fetch(oneappUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: name.trim(),
        email_address: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
      }),
    });

    const data = await oneappResponse.json();

    if (!oneappResponse.ok || !data.success) {
      console.error('[CONTACT_FORM] OneApp error:', data);
      return NextResponse.json(
        { error: data.error || 'Failed to send message. Please try again.' },
        { status: oneappResponse.status >= 400 ? oneappResponse.status : 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Your message has been sent successfully',
    });
  } catch (error) {
    console.error('[CONTACT_FORM] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 },
    );
  }
}
