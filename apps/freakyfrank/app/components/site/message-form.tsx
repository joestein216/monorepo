'use client';

import { useActionState } from 'react';
import { handleMessageFormSubmit, FormState } from '../../actions/form-actions';

export default function MessageForm() {
  // Define the initial state matching the FormState contract
  const initialFormState: FormState = {
    success: false,
    error: null,
  };

  const [state, formAction, isPending] = useActionState(handleMessageFormSubmit, initialFormState);

  if (state.success) {
    return (
      <div className="py-4 text-green-600">
        Message Received!
      </div>
    );
  }

  return (
    // Next.js maps formAction straight to your secure server-side file
    <form action={formAction} className="grid grid-cols-1 shadow-sm shadow-black">
      <textarea
        name="message" // <-- This matches formData.get('message') on the server
        required
        rows={3}
        placeholder="type message then click send..."
        className="self-end p-2 text-base border border-[var(--line-dark)] focus:outline-none"
      />
      
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="bg-[var(--button-hover)] text-base shadow-sm shadow-black uppercase p-1"
      >
        {isPending ? '...' : 'Send Message'}
      </button>
    </form>
  );
}
