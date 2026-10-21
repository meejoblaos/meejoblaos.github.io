// MEEJOB — Supabase connection
//
// This file only creates the Supabase client. All UI lives in index.html.
// Note: the publishable (anon) key is safe to expose in the browser — row level
// security in Supabase is what protects the data.

const SUPABASE_URL = "https://nioicvluznlbdclegqjx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_4EGw7_3td1salgWpqoo06w_bJllQNPW";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

window.supabaseClient = supabaseClient;

console.log("MEEJOB: Supabase client initialized.");


// Show a small, dismissible banner if the backend cannot be reached.
// Nothing is injected into the page when the connection is healthy.

function showConnectionError(message) {
  if (document.getElementById("connectionErrorBanner")) {
    return;
  }

  const banner = document.createElement("div");

  banner.id = "connectionErrorBanner";

  banner.setAttribute("role", "alert");

  banner.style.cssText = [
    "position:fixed",
    "left:50%",
    "bottom:18px",
    "transform:translateX(-50%)",
    "max-width:90%",
    "padding:12px 18px",
    "border-radius:10px",
    "background:#7f1d1d",
    "color:#fff",
    "font:14px Arial,Helvetica,sans-serif",
    "box-shadow:0 8px 24px rgba(0,0,0,.25)",
    "z-index:2000"
  ].join(";");

  banner.textContent = message;

  document.body.appendChild(banner);

  setTimeout(function () {
    banner.remove();
  }, 8000);
}

window.addEventListener("online", function () {
  console.log("MEEJOB: back online.");
});

window.addEventListener("offline", function () {
  showConnectionError("You are offline. Some features will not work.");
});
