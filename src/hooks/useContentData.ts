import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Policy Sections ──
export const usePolicySections = () =>
  useQuery({
    queryKey: ["policy-sections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("policy_sections").select("*").order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

export const useUpsertPolicySection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (section: { id?: string; title: string; content: string; display_order?: number; is_active?: boolean }) => {
      const { error } = section.id
        ? await supabase.from("policy_sections").update(section).eq("id", section.id)
        : await supabase.from("policy_sections").insert(section);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policy-sections"] }),
  });
};

export const useDeletePolicySection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("policy_sections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policy-sections"] }),
  });
};

// ── FAQs ──
export const useFaqs = () =>
  useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faqs").select("*").order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

export const useUpsertFaq = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (faq: { id?: string; question: string; answer: string; category?: string; display_order?: number; is_active?: boolean }) => {
      const { error } = faq.id
        ? await supabase.from("faqs").update(faq).eq("id", faq.id)
        : await supabase.from("faqs").insert(faq);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faqs"] }),
  });
};

export const useDeleteFaq = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faqs"] }),
  });
};

// ── Footer Links ──
export const useFooterLinks = () =>
  useQuery({
    queryKey: ["footer-links"],
    queryFn: async () => {
      const { data, error } = await supabase.from("footer_links").select("*").order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

export const useUpsertFooterLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (link: { id?: string; label: string; url: string; display_order?: number; is_active?: boolean }) => {
      const { error } = link.id
        ? await supabase.from("footer_links").update(link).eq("id", link.id)
        : await supabase.from("footer_links").insert(link);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["footer-links"] }),
  });
};

export const useDeleteFooterLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("footer_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["footer-links"] }),
  });
};

// ── Site Settings ──
export const useSiteSettings = () =>
  useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach((s: any) => { map[s.key] = s.value; });
      return map;
    },
  });

export const useUpdateSiteSetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-settings"] }),
  });
};
