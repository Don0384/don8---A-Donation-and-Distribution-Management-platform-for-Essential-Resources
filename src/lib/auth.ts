
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export type AuthUser = User | null;

export async function signIn({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signUp({ 
  email, 
  password, 
  firstName,
  lastName,
  phone,
  userType,
  adminCode
}: { 
  email: string; 
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: "donor" | "receiver" | "admin";
  adminCode?: string;
}) {
  // Validate required fields
  if (!firstName || !lastName || !phone) {
    throw new Error("First name, last name, and phone number are required");
  }

  // Verify admin code if userType is admin
  if (userType === "admin" && adminCode !== "ardosito") {
    throw new Error("Invalid admin verification code");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        user_type: userType
      },
    },
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function getCurrentUser(): Promise<AuthUser> {
  return supabase.auth.getUser().then(({ data }) => data.user);
}
