export type AccreditationStatus =
  | 'upcoming'
  | 'drafted'
  | 'submitted'
  | 'awaiting_response'
  | 'granted'
  | 'rejected'
  | 'waitlisted'
  | 'shot'
  | 'no_show';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string | null;
  role: 'admin' | 'photographer';
  avatar_url: string | null;
  created_at: string;
}

export interface Show {
  id: string;
  organization_id: string;
  band_id: string;
  venue: string;
  city: string;
  show_date: string;
  promoter: string | null;
  tour_name: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  band?: Band;
}

export interface PrContact {
  id: string;
  organization_id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestTemplate {
  id: string;
  organization_id: string;
  name: string;
  subject: string | null;
  body: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Band {
  id: string;
  organization_id: string;
  name: string;
  genre: string | null;
  label: string | null;
  website: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  pr_contacts?: PrContact[];
  shows?: Show[];
}

export interface AccreditationRequest {
  id: string;
  organization_id: string;
  show_id: string;
  photographer_id: string;
  pr_contact_id: string | null;
  template_id: string | null;
  status: AccreditationStatus;
  submission_deadline: string | null;
  submitted_at: string | null;
  response_received_at: string | null;
  pit_restrictions: string | null;
  gallery_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  show?: Show;
  pr_contact?: PrContact;
  photographer?: Profile;
}
