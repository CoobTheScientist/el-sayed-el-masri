/* ==========================================================================
   E&E Knits — site behavior
   Plain JS, no build step, no dependencies. Works on any static host.
   ==========================================================================

   ▼▼▼ EVERYTHING YOU NEED TO EDIT IS IN THE CONFIG BLOCK BELOW ▼▼▼
*/

const CONFIG = {
  // Where order requests and contact messages go.
  email: "yacob.ahmad98@gmail.com",

  // Formspree form ID — makes the forms send real email instead of opening
  // the customer's mail app. Free tier: 50 submissions/month.
  //   1. Sign up at https://formspree.io  2. New Form  3. copy the ID from
  //      the endpoint URL (https://formspree.io/f/XXXXXXX  ->  "XXXXXXX")
  // Leave it "" and the forms fall back to opening a pre-filled email.
  formspreeId: "",

  // Optional: Stripe Payment Links, one per size. Create them at
  // https://dashboard.stripe.com/payment-links (no coding, no server).
  // Leave "" to hide the Pay Now button and just take order requests.
  stripeLinks: {
    throw: "",
    twin: "",
    queen: "",
  },

  // Pricing. Change freely — the page recalculates automatically.
  sizes: {
    throw: { name: "Throw",   dims: '50" × 60"',  price: 145 },
    twin:  { name: "Twin",    dims: '66" × 90"',  price: 235 },
    queen: { name: "Queen",   dims: '90" × 90"',  price: 325 },
  },
};

/* ▲▲▲ END OF CONFIG — you shouldn't need to change anything below ▲▲▲ */

const money = (n) => "$" + n.toFixed(2).replace(/\.00$/, "");
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ------------------------------------------------------------------------
   Shared form sender — Formspree if configured, pre-filled email otherwise
   ---------------------------------------------------------------------- */

async function sendForm({ form, subject, body, statusEl, okMessage }) {
  const setStatus = (msg, ok) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = "form-status " + (ok ? "is-ok" : "is-err");
  };

  if (!CONFIG.formspreeId) {
    // No form backend yet — open the visitor's mail app with it all filled in.
    const href =
      `mailto:${CONFIG.email}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setStatus("Opening your email app with the details filled in — just hit send.", true);
    return;
  }

  const btn = $('button[type="submit"]', form);
  const label = btn ? btn.textContent : "";
  if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

  try {
    const data = new FormData(form);
    data.set("_subject", subject);
    data.set("message", body);
    const res = await fetch(`https://formspree.io/f/${CONFIG.formspreeId}`, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Formspree responded " + res.status);
    form.reset();
    setStatus(okMessage, true);
  } catch (err) {
    setStatus(
      `Something went wrong sending that. Please email me directly at ${CONFIG.email}.`,
      false
    );
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = label; }
  }
}

/* ------------------------------------------------------------------------
   Contact page form
   ---------------------------------------------------------------------- */

function initContactForm() {
  const form = $("#contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const body = [
      `Name:  ${fd.get("name") || ""}`,
      `Email: ${fd.get("email") || ""}`,
      `Topic: ${fd.get("topic") || ""}`,
      ``,
      `${fd.get("notes") || ""}`,
    ].join("\n");

    sendForm({
      form,
      subject: `Website inquiry — ${fd.get("topic") || "General question"}`,
      body,
      statusEl: $("#contactStatus"),
      okMessage: "Thanks! Your message is on its way — I usually reply within 2 business days.",
    });
  });
}

/* ---------------------------------------------------------- Email links */

function initEmailLinks() {
  $$("[data-email-link]").forEach((el) => {
    el.href = `mailto:${CONFIG.email}`;
    if (!el.textContent.trim()) el.textContent = CONFIG.email;
  });
  $$("[data-email-text]").forEach((el) => { el.textContent = CONFIG.email; });
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
}

document.addEventListener("DOMContentLoaded", () => {
  initContactForm();
  initEmailLinks();
});
