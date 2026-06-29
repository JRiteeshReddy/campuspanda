import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { create, verify, getNumericDate } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Generates a cryptographically secure 6-digit OTP code
function generateSecureOTP(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (100000 + (array[0] % 900000)).toString();
}

// Hashes the OTP using SHA-256 for secure storage in DB
async function hashOTP(otp: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(otp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initialize JWT signing key using environment secret
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'local-fallback-secret-at-least-32-chars-long!!';
const keyBuf = new TextEncoder().encode(JWT_SECRET);
const cryptoKey = await crypto.subtle.importKey(
  "raw",
  keyBuf,
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

// Verify admin JWT token from request headers
async function verifyAdminToken(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization') || req.headers.get('x-admin-token');
  if (!authHeader) return null;
  
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : authHeader;
    
  try {
    const payload = await verify(token, cryptoKey);
    if (payload.role === 'admin' && payload.sub) {
      return payload.sub as string;
    }
  } catch (err) {
    console.error('JWT Verification failed:', err);
  }
  return null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, ''); // clean trailing slash

  try {
    // ----------------------------------------------------
    // Action 1: Send OTP
    // ----------------------------------------------------
    if (path.endsWith('/send-otp') && req.method === 'POST') {
      const { email } = await req.json();
      if (!email || typeof email !== 'string') {
        return new Response(JSON.stringify({ error: 'Email is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const adminEmail = Deno.env.get('ADMIN_EMAIL');
      if (!adminEmail) {
        return new Response(JSON.stringify({ error: 'Admin email not configured on server' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
        // Generic error response to prevent user enumeration
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Rate limit check: Only 1 OTP request allowed every 60 seconds per email
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
      const { data: recentOtps, error: checkLimitError } = await supabase
        .from('admin_otps')
        .select('created_at')
        .eq('email', email.toLowerCase().trim())
        .gt('created_at', oneMinuteAgo)
        .eq('verified', false);

      if (checkLimitError) {
        console.error('Database error checking rate limit:', checkLimitError);
      } else if (recentOtps && recentOtps.length > 0) {
        return new Response(JSON.stringify({ error: 'Please wait 60 seconds before requesting another OTP' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate secure code and hashes
      const otp = generateSecureOTP();
      const hashed = await hashOTP(otp);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes validity

      // Insert OTP into database
      const { error: insertError } = await supabase
        .from('admin_otps')
        .insert({
          email: email.toLowerCase().trim(),
          otp_hash: hashed,
          expires_at: expiresAt,
          attempts: 0,
          verified: false,
        });

      if (insertError) {
        console.error('Database error saving OTP:', insertError);
        return new Response(JSON.stringify({ error: 'Failed to generate OTP' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Send via email using Resend
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'CampusPanda Admin <onboarding@resend.dev>',
              to: [email.toLowerCase().trim()],
              subject: 'CampusPanda Admin Login OTP',
              html: `
                <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
                  <h2 style="color: #0071e3;">CampusPanda Admin Panel</h2>
                  <p>Your one-time password (OTP) to access the admin panel is:</p>
                  <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 15px; background-color: #f5f5f7; border-radius: 4px; text-align: center; margin: 20px 0; color: #1d1d1f;">
                    ${otp}
                  </div>
                  <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes. Do not share this code with anyone.</p>
                </div>
              `,
            }),
          });
          if (!res.ok) {
            const errText = await res.text();
            console.error('Resend error response:', errText);
            // Fallback print to console
            console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
          }
        } catch (err) {
          console.error('Fetch error calling Resend:', err);
          console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
        }
      } else {
        console.log(`[DEV MODE] OTP for ${email} is: ${otp}`);
      }

      return new Response(JSON.stringify({ success: true, message: 'OTP sent successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ----------------------------------------------------
    // Action 2: Verify OTP
    // ----------------------------------------------------
    if (path.endsWith('/verify-otp') && req.method === 'POST') {
      const { email, otp } = await req.json();
      if (!email || !otp) {
        return new Response(JSON.stringify({ error: 'Email and OTP are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const adminEmail = Deno.env.get('ADMIN_EMAIL');
      if (email.toLowerCase().trim() !== adminEmail?.toLowerCase().trim()) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch active, unverified, unexpired OTP records
      const nowStr = new Date().toISOString();
      const { data: otps, error: fetchError } = await supabase
        .from('admin_otps')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('verified', false)
        .gt('expires_at', nowStr)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError || !otps || otps.length === 0) {
        return new Response(JSON.stringify({ error: 'OTP expired or invalid. Please request a new one.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const activeOtp = otps[0];

      // Security: Check maximum verification attempts (limit 3)
      if (activeOtp.attempts >= 3) {
        await supabase
          .from('admin_otps')
          .update({ verified: true })
          .eq('id', activeOtp.id);
          
        return new Response(JSON.stringify({ error: 'Too many incorrect attempts. Please request a new OTP.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Increment attempts
      const currentAttempts = activeOtp.attempts + 1;
      await supabase
        .from('admin_otps')
        .update({ attempts: currentAttempts })
        .eq('id', activeOtp.id);

      // Verify OTP hash
      const incomingHash = await hashOTP(otp.trim());
      if (incomingHash !== activeOtp.otp_hash) {
        return new Response(JSON.stringify({ error: `Invalid OTP. Attempts remaining: ${3 - currentAttempts}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Mark OTP as verified (used)
      await supabase
        .from('admin_otps')
        .update({ verified: true })
        .eq('id', activeOtp.id);

      // Create JWT session token (expires in 2 hours)
      const jwt = await create({ alg: "HS256", typ: "JWT" }, {
        sub: email.toLowerCase().trim(),
        role: "admin",
        exp: getNumericDate(60 * 60 * 2),
      }, cryptoKey);

      return new Response(JSON.stringify({ success: true, token: jwt }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ----------------------------------------------------
    // Action 3: Get Current Release
    // ----------------------------------------------------
    if (path.endsWith('/release') && req.method === 'GET') {
      const verifiedEmail = await verifyAdminToken(req);
      if (!verifiedEmail) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('app_releases')
        .select('*')
        .order('version_code', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching release:', error);
        return new Response(JSON.stringify({ error: 'Database error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const latestRelease = data && data.length > 0 ? data[0] : null;

      return new Response(JSON.stringify({ success: true, release: latestRelease }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ----------------------------------------------------
    // Action 4: Publish New Version (Upload APK & write version.json)
    // ----------------------------------------------------
    if (path.endsWith('/publish') && req.method === 'POST') {
      const verifiedEmail = await verifyAdminToken(req);
      if (!verifiedEmail) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const formData = await req.formData();
      const file = formData.get('apk') as File | null;
      const versionName = formData.get('versionName') as string | null;
      const versionCodeStr = formData.get('versionCode') as string | null;
      const releaseNotes = formData.get('releaseNotes') as string | null;
      const mandatoryStr = formData.get('mandatory') as string | null;

      if (!file || !versionName || !versionCodeStr || !releaseNotes) {
        return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const versionCode = parseInt(versionCodeStr);
      const mandatory = mandatoryStr === 'true' || mandatoryStr === '1';

      // Security validation: Limit file uploads to Android APK files only
      if (!file.name.toLowerCase().endsWith('.apk')) {
        return new Response(JSON.stringify({ error: 'Invalid file type. Only Android APK (.apk) files are allowed.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Security validation: Restrict maximum file size limit (50MB)
      const MAX_SIZE = 50 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return new Response(JSON.stringify({ error: 'File size exceeds limit (50MB)' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const fileArrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(fileArrayBuffer);
      const fileName = `campuspanda-v${versionName}-${versionCode}.apk`;

      console.log(`Uploading APK: ${fileName} (${file.size} bytes)`);

      // Upload file to the 'apks' bucket (using upsert: true to overwrite if same version uploaded)
      const { error: uploadError } = await supabase.storage
        .from('apks')
        .upload(fileName, fileData, {
          contentType: 'application/vnd.android.package-archive',
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return new Response(JSON.stringify({ error: `Upload failed: ${uploadError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Retrieve public CDN URL
      const { data: { publicUrl } } = supabase.storage
        .from('apks')
        .getPublicUrl(fileName);

      // Save version metadata in app_releases table
      const { error: dbError } = await supabase
        .from('app_releases')
        .insert({
          version_code: versionCode,
          version_name: versionName,
          release_notes: releaseNotes,
          mandatory: mandatory,
          download_url: publicUrl,
        });

      if (dbError) {
        console.error('Database release insert error:', dbError);
        return new Response(JSON.stringify({ error: `Database insert failed: ${dbError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate version.json
      const versionJson = {
        versionCode: versionCode,
        versionName: versionName,
        mandatory: mandatory,
        title: `CampusPanda v${versionName}`,
        message: releaseNotes,
        downloadUrl: publicUrl,
        publishedAt: new Date().toISOString().split('T')[0],
      };

      // Upload/Overwrite public version.json
      const { error: jsonError } = await supabase.storage
        .from('apks')
        .upload('version.json', JSON.stringify(versionJson, null, 2), {
          contentType: 'application/json',
          upsert: true,
        });

      if (jsonError) {
        console.error('Failed to update version.json in storage:', jsonError);
        return new Response(JSON.stringify({ error: `APK published but version.json failed: ${jsonError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, release: versionJson }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default 404 Route
    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Request processing error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
