import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { handleApi } from '../_shared/api.js';
import { workspaceRepository } from '../_shared/repository.js';

const url = Deno.env.get('SUPABASE_URL')!;
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const allowedOrigins = (Deno.env.get('RENTER_ALLOWED_ORIGINS') || '').split(',').map(value => value.trim()).filter(Boolean);

// Public booking routes are anonymous. Every owner route verifies its token here.
Deno.serve(request => handleApi(request, {
  repository: workspaceRepository(admin), allowedOrigins,
  publicBookingEnabled: Deno.env.get('RENTER_PUBLIC_BOOKING_ENABLED') === 'true',
  authenticate: async token => {
    const { data, error } = await admin.auth.getUser(token);
    return error ? null : data.user;
  },
}));
