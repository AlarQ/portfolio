/**
 * Public Buttondown embed endpoint the `Newsletter` form POSTs to directly —
 * ships in static HTML, not a secret. Double opt-in and the post-subscribe
 * redirect (to `/thanks`) are configured in the Buttondown dashboard, not here.
 */
export const NEWSLETTER_ACTION = "https://buttondown.com/api/emails/embed-subscribe/bednarczyk";
