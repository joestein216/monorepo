'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Define the exact shape of your form status
export interface FormState {
  success: boolean;
  error: string | null;
}

export async function handleMessageFormSubmit(
    prevState: FormState, 
    formData: FormData
  ): Promise<FormState> {
  const message = formData.get('message') as string;

  // Basic server-side validation
  if (!message || message.trim() === '') {
    return { 
      success: false, 
      error: 'Message cannot be empty.' 
    };
  }

  try {
    // Send the email directly to your inbox
    await resend.emails.send({
      from: 'Freaky Frank Message Form <no-reply@freakyfrank.com>',
      to: process.env.MESSAGE_EMAIL || 'connect@freakyfrank.com',
      subject: 'New freakyfrank.com Message',
      text: message,
    });

    return { 
      success: true, 
      error: null 
    };
  } catch (error) {
    if (error instanceof Error) {
      console.info(prevState);
      console.error(error.message);
    }
    return { 
      success: false, 
      error: 'Failed to deliver message.' 
    };
  }
}
