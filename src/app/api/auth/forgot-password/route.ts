import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    // We do not leak whether an account exists for that email
    return apiSuccess({
      message:
        "If an account exists for that email, you'll receive instructions to reset your password.",
    });
  } catch {
    return apiSuccess({
      message:
        "If an account exists for that email, you'll receive instructions to reset your password.",
    });
  }
}
