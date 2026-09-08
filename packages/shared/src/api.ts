import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CatalogType,
  CompanyInfo,
  ExistingVisitorLead,
  NewCatalogType,
  NewProduct,
  NewVisitorLead,
  Product,
  Profile,
  UpdateCatalogType,
  UpdateCompanyInfo,
  UpdateProduct,
} from "./types";

/** Every helper takes the supabase client explicitly — no shared module-level singleton. */

// ---------- Catalog types ----------

export async function listCatalogTypes(db: SupabaseClient): Promise<CatalogType[]> {
  const { data, error } = await db
    .from("catalog_types")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCatalogType(
  db: SupabaseClient,
  input: NewCatalogType
): Promise<CatalogType> {
  const { data, error } = await db
    .from("catalog_types")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCatalogType(
  db: SupabaseClient,
  id: string,
  input: UpdateCatalogType
): Promise<CatalogType> {
  const { data, error } = await db
    .from("catalog_types")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCatalogType(db: SupabaseClient, id: string): Promise<void> {
  const { error } = await db.from("catalog_types").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Products ----------

export interface ProductQuery {
  catalogTypeId?: string;
  search?: string;
  activeOnly?: boolean;
}

export async function listProducts(
  db: SupabaseClient,
  query: ProductQuery = {}
): Promise<Product[]> {
  let q = db.from("products").select("*").order("created_at", { ascending: false });

  if (query.catalogTypeId) {
    q = q.eq("catalog_type_id", query.catalogTypeId);
  }
  if (query.activeOnly) {
    q = q.eq("is_active", true);
  }
  if (query.search && query.search.trim().length > 0) {
    // PostgREST's .or() filter uses commas/parens as syntax, so strip them from
    // user input before interpolating into the filter string.
    const term = query.search.trim().replace(/[,()]/g, " ");
    // Search across name, category, description and the flattened specs text.
    q = q.or(
      `name.ilike.%${term}%,category.ilike.%${term}%,description.ilike.%${term}%,specs_text.ilike.%${term}%`
    );
  }

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getProduct(db: SupabaseClient, id: string): Promise<Product | null> {
  const { data, error } = await db.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProduct(db: SupabaseClient, input: NewProduct): Promise<Product> {
  const { data, error } = await db.from("products").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(
  db: SupabaseClient,
  id: string,
  input: UpdateProduct
): Promise<Product> {
  const { data, error } = await db
    .from("products")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(db: SupabaseClient, id: string): Promise<void> {
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Company info (singleton) ----------

export async function getCompanyInfo(db: SupabaseClient): Promise<CompanyInfo | null> {
  const { data, error } = await db.from("company_info").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateCompanyInfo(
  db: SupabaseClient,
  id: string,
  input: UpdateCompanyInfo
): Promise<CompanyInfo> {
  const { data, error } = await db
    .from("company_info")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------- Auth / profile ----------

export async function getMyProfile(db: SupabaseClient): Promise<Profile | null> {
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data, error } = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function signInWithPassword(db: SupabaseClient, email: string, password: string) {
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut(db: SupabaseClient) {
  const { error } = await db.auth.signOut();
  if (error) throw error;
}

// ---------- Storage ----------

export async function uploadImage(
  db: SupabaseClient,
  bucket: "product-images" | "company-images",
  path: string,
  file: Blob | File | ArrayBuffer,
  contentType?: string
): Promise<string> {
  const { error } = await db.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType,
  });
  if (error) throw error;
  const { data } = db.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ---------- Visitor gate (no-password lead capture in front of the catalog) ----------

export async function createVisitorLead(db: SupabaseClient, input: NewVisitorLead): Promise<void> {
  // Goes through a SECURITY DEFINER RPC rather than a client-side
  // .upsert(...): INSERT ... ON CONFLICT DO UPDATE needs to see the
  // pre-existing conflicting row to resolve the conflict, and that
  // visibility check is governed by the table's SELECT policy (admin-only
  // here) — not the INSERT/UPDATE policies — so a plain client-side upsert
  // fails with an RLS violation for every returning visitor regardless of
  // how permissive those are. The RPC bypasses RLS entirely for its own
  // internal insert-or-update, sidestepping this.
  const { error } = await db.rpc("upsert_visitor_lead", {
    p_name: input.name,
    p_company_name: input.company_name,
    p_phone_country_code: input.phone_country_code,
    p_phone_number: input.phone_number,
    p_email: input.email,
  });
  if (error) throw error;
}

/** Looks up a returning visitor's previously-entered details by email alone (no password). */
export async function getVisitorLeadByEmail(
  db: SupabaseClient,
  email: string
): Promise<ExistingVisitorLead | null> {
  const { data, error } = await db.rpc("get_visitor_lead_by_email", { check_email: email });
  if (error) throw error;
  if (!data || data.length === 0) return null;
  return data[0];
}

/** True if the given email belongs to an admin — used to decide whether to show the Admin menu. */
export async function checkIsAdminEmail(db: SupabaseClient, email: string): Promise<boolean> {
  const { data, error } = await db.rpc("is_admin_email", { check_email: email });
  if (error) throw error;
  return Boolean(data);
}
