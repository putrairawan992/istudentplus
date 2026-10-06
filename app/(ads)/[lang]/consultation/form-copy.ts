// Copy and choices for the ads landing page's lead form, shared by the server component that
// reads them from the CMS (adsPage → tab "Form Iklan") and the client component that renders
// them. The defaults are what the approved mock shipped with; the CMS only overrides a value
// when it is non-empty, so a half-filled record can never blank out a live label or option.
export type AdsFormCopy = {
    title: string;
    intro: string;
    submit: string;
    successTitle: string;
    successBody: string;
    interests: string[];
    locations: string[];
    starts: string[];
};

export const DEFAULT_ADS_FORM_COPY: AdsFormCopy = {
    title: "Book a free consultation",
    intro:
        "Share your plans and a counsellor replies with a personalised recommendation. No obligation, no fees to talk.",
    submit: "Book a free consultation",
    successTitle: "Thanks, we got your details",
    successBody:
        "A counsellor will review your plans and get back to you with a personalised recommendation.",
    interests: [
        "Study in Australia (not sure of level yet)",
        "VET or diploma in Australia",
        "Bachelor or master in Australia",
        "Next course, already in Australia",
        "General English or Conversation Class",
        "IELTS Preparation",
    ],
    locations: ["Indonesia", "Australia", "Other country"],
    starts: ["Within 6 months", "6 to 12 months", "More than 12 months", "Not sure yet"],
};
