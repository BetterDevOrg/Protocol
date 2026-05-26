export type MemberRow = {
  id: string;
  auth_user_id: string | null;
  community_id: string;
  member_number: number;
  full_name: string;
  email: string;
  city: string;
  country: string | null;
  phone_e164: string | null;
  x_handle: string;
  x_profile_link: string | null;
  reputation: number;
  followed_x: boolean;
  joined_community: boolean;
  invite_slug: string;
  joined_at: string;
  avatar_url: string | null;
  bio: string | null;
  screenshot_file_name: string | null;
  created_at: string;
  updated_at: string;
};

export type MemberInsert = {
  full_name: string;
  email: string;
  phone_e164?: string | null;
  city: string;
  country?: string | null;
  x_handle: string;
  x_profile_link?: string | null;
  screenshot_file_name?: string | null;
  followed_x?: boolean;
  joined_community?: boolean;
  invite_slug: string;
  reputation?: number;
  auth_user_id?: string | null;
};

export type Database = {
  public: {
    Tables: {
      members: {
        Row: MemberRow;
        Insert: MemberInsert;
        Update: Partial<MemberInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
