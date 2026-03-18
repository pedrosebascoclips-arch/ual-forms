export const SB_URL = "https://fqxhtjhamkqddcoxgyqn.supabase.co";
export const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeGh0amhhbWtxZGRjb3hneXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NzY4OTYsImV4cCI6MjA4NzU1Mjg5Nn0.cL4JQzjiRqmGGV1h81u4LKPO466F8oeonkBwqrvNuaA";

export const headers = () => ({
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
});
