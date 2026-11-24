import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    // Kreiraj admin client sa service role key-om
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase credentials" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email je obavezan" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Pronalaženje korisnika sa emailom: ${email}`);

    // Pronađi korisnika po email-u
    const { data: profiles, error: fetchError } = await supabase
      .from("profiles")
      .select("id, email, role")
      .ilike("email", email)
      .single();

    if (fetchError) {
      console.error("Greška pri pronalaženju korisnika:", fetchError);
      return new Response(
        JSON.stringify({ error: `Korisnik nije pronađen: ${fetchError.message}` }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!profiles) {
      return new Response(
        JSON.stringify({ error: `Korisnik sa emailom ${email} nije pronađen` }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Pronađen korisnik:", profiles);

    // Ažuriraj role na admin
    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", profiles.id)
      .select()
      .single();

    if (updateError) {
      console.error("Greška pri ažuriranju role:", updateError);
      return new Response(
        JSON.stringify({ error: `Greška pri ažuriranju: ${updateError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Korisnik je uspešno postavljen kao admin:", updated);

    return new Response(
      JSON.stringify({
        message: "Korisnik je uspešno postavljen kao admin",
        user: updated,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Greška:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
