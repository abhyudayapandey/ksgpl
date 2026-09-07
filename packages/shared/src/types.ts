export type UserRole = "admin" | "end_user";

export interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
  created_at: string;
}

export interface CatalogType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export type ProductSpecs = Record<string, string>;

export interface Product {
  id: string;
  catalog_type_id: string;
  name: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  specs: ProductSpecs;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  brand_name: string | null;
  tagline: string | null;
  description: string | null;
  established_year: number | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  gallery_urls: string[];
  updated_at: string;
}

export interface NewCatalogType {
  name: string;
  slug: string;
  description?: string | null;
  display_order?: number;
}

export interface NewProduct {
  catalog_type_id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  image_url?: string | null;
  specs?: ProductSpecs;
  tags?: string[];
  is_active?: boolean;
}

export type UpdateProduct = Partial<NewProduct>;
export type UpdateCatalogType = Partial<NewCatalogType>;
export type UpdateCompanyInfo = Partial<Omit<CompanyInfo, "id" | "updated_at">>;

export interface VisitorLead {
  id: string;
  name: string;
  company_name: string;
  phone_country_code: string;
  phone_number: string;
  email: string;
  created_at: string;
}

export interface NewVisitorLead {
  name: string;
  company_name: string;
  phone_country_code: string;
  phone_number: string;
  email: string;
}

export interface ExistingVisitorLead {
  name: string;
  company_name: string;
  phone_country_code: string;
  phone_number: string;
}
