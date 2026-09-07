/**
 * One-off script: uploads the product photos in supabase/seed/product-images/
 * to the "product-images" Storage bucket and attaches each one to the
 * matching product row (matched by exact product name).
 *
 * Run from the repo root (needs @supabase/supabase-js, already installed at
 * the workspace root):
 *
 *   SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_ANON_KEY=your-anon-key \
 *   node supabase/seed/upload-images.js admin@example.com 'admin-password'
 *
 * Uses the admin email/password you already created (see README) — the
 * upload and the product update both go through the same RLS policies the
 * app itself uses, so no service-role key is needed.
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

async function main() {
  const [email, password] = process.argv.slice(2);
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!email || !password) {
    console.error(
      "Usage: SUPABASE_URL=... SUPABASE_ANON_KEY=... node supabase/seed/upload-images.js <admin-email> <admin-password>"
    );
    process.exit(1);
  }
  if (!url || !anonKey) {
    console.error("Missing SUPABASE_URL / SUPABASE_ANON_KEY environment variables.");
    process.exit(1);
  }

  const supabase = createClient(url, anonKey);

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    console.error("Sign-in failed:", signInError.message);
    process.exit(1);
  }
  console.log(`Signed in as ${email}.`);

  const manifestPath = path.join(__dirname, "product-images-manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  let ok = 0;
  let failed = 0;

  for (const [productName, filename] of Object.entries(manifest)) {
    const filePath = path.join(__dirname, "product-images", filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`Skipping "${productName}" — file not found: ${filename}`);
      failed++;
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `seed/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(storagePath, fileBuffer, { upsert: true, contentType: "image/jpeg" });

    if (uploadError) {
      console.error(`Upload failed for "${productName}" (${filename}):`, uploadError.message);
      failed++;
      continue;
    }

    const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(storagePath);
    const imageUrl = publicUrlData.publicUrl;

    const { data: updated, error: updateError } = await supabase
      .from("products")
      .update({ image_url: imageUrl })
      .eq("name", productName)
      .select();

    if (updateError) {
      console.error(`DB update failed for "${productName}":`, updateError.message);
      failed++;
      continue;
    }
    if (!updated || updated.length === 0) {
      console.warn(`No product row found with name "${productName}" — image uploaded but not attached.`);
      failed++;
      continue;
    }

    console.log(`✓ ${productName} -> ${imageUrl}`);
    ok++;
  }

  console.log(`\nDone. ${ok} products updated, ${failed} skipped/failed.`);
  await supabase.auth.signOut();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
