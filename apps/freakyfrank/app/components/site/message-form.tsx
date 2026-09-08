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
    <form action={formAction} className="grid grid-cols-1 gap-2">
      <textarea
        name="message" // <-- This matches formData.get('message') on the server
        required
        rows={4}
        placeholder="type message then click send..."
        className="border border-[var(--line)] p-2"
      />
      
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="bg-[var(--button-hover)] p-2"
      >
        {isPending ? '...' : 'Send'}
      </button>
    </form>
  );
}
