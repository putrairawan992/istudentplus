export type CountryOverview = {
  livingCost: string;
  career: string;
  admission: string;
  accommodation: string;
  culture: string;
};

export type Country = {
  slug: string;
  name: string;
  tag: string;
  cities: string;
  gradient: string;
  image?: string;
  imageLabel?: string;
  whyStudy: string;
  overview: CountryOverview;
  featuredPrograms?: { name: string; description: string; href: string }[];
  keyFacts?: { label: string; value: string }[];
  livingCosts?: { expense: string; range: string }[];
  visaRequirements?: string[];
};

export const COUNTRIES: Country[] = [
  {
    slug: "australia",
    name: "Australia",
    tag: "Open",
    cities: "Melbourne · Sydney",
    gradient: "from-[#1E78C7] to-[#0C2F4E]",
    image: "/destinations/australia.jpg",
    whyStudy:
      "Australia is the fourth most popular destination for international students — offering " +
      "more than 1,200 schools with over 22,000 courses, high-ranked universities, and the " +
      "chance to work while you study and after you graduate.",
    overview: {
      livingCost: "Varies by city — Melbourne and Sydney run higher than regional areas. See the monthly cost breakdown below.",
      career: "International students may work while studying, with clear post-study work visa pathways in IT, engineering, health, and hospitality.",
      admission: "Requirements vary by qualification level (VET, Bachelor, Master) — your counselor matches documents to the right pathway.",
      accommodation: "On-campus dorms, homestays, and shared apartments, arranged before departure.",
      culture: "Multicultural, English-speaking, with a large and active Indonesian student community.",
    },
    keyFacts: [
      { label: "Languages spoken", value: "English" },
      { label: "Cost of study", value: "AUD 20,000 – AUD 45,000 / year" },
      { label: "Sources of funding", value: "Scholarships, grants, bursaries, work opportunities, and financial aid" },
      { label: "Exams required", value: "IELTS/TOEFL and GMAT/GRE" },
      { label: "Degrees", value: "Diploma, Bachelor's, Master's, Doctorate" },
      { label: "Intakes", value: "February/March and July/August" },
      { label: "Visa", value: "Subclass 500 visa" },
    ],
    livingCosts: [
      { expense: "Accommodation", range: "AUD 800 – 2,500" },
      { expense: "Groceries", range: "AUD 300 – 500" },
      { expense: "Transportation", range: "AUD 100 – 200" },
      { expense: "Dining out", range: "AUD 300 – 500" },
      { expense: "Utilities", range: "AUD 150 – 250" },
      { expense: "Internet & mobile", range: "AUD 50 – 100" },
      { expense: "Miscellaneous", range: "AUD 200 – 400" },
    ],
    visaRequirements: [
      "Confirmation of Enrollment (CoE) from a recognised Australian educational institution",
      "Proof of sufficient financial resources to cover tuition, living expenses, and return travel",
      "English language proficiency test results (e.g., IELTS, TOEFL)",
      "Overseas Student Health Cover (OSHC) to cover medical expenses",
      "Genuine Temporary Entrant (GTE) statement",
      "Meet health and character requirements",
    ],
    featuredPrograms: [
      {
        name: "VET Courses",
        description: "Vocational Education and Training (TVET) — Certificate I through Advanced Diploma, across 10 industries.",
        href: "/courses#vet",
      },
      {
        name: "High School",
        description: "Years 7–12, leading to an ATAR for university entrance.",
        href: "/courses#high-school",
      },
      {
        name: "General English",
        description: "A comprehensive foundation across reading, writing, speaking, and listening.",
        href: "/language-programs#general-english",
      },
    ],
  },
  {
    slug: "uk",
    name: "United Kingdom",
    tag: "Open",
    cities: "London · Manchester",
    gradient: "from-[#153A5B] to-[#0A1D30]",
    image: "/destinations/uk.jpg",
    whyStudy:
      "The UK offers shorter degree lengths (3-year Bachelor's, 1-year Master's), centuries-old " +
      "institutions, and a Graduate visa route that lets students stay on to work after graduation.",
    overview: {
      livingCost: "London runs highest; other cities like Manchester are more affordable. Ask your counselor for current estimates.",
      career: "Graduate visa route allows post-study work; strong for finance, law, and research-focused fields.",
      admission: "Typically UCAS applications for undergraduate, direct university applications for postgraduate.",
      accommodation: "University halls of residence in year one, private shared housing after.",
      culture: "Highly international student body, especially in London and Manchester.",
    },
  },
  {
    slug: "usa",
    name: "United States",
    tag: "Open",
    cities: "New York · Boston",
    gradient: "from-[#2E9E7A] to-[#0F3D2F]",
    image: "/destinations/usa.jpg",
    whyStudy:
      "The US has the widest range of institutions and majors, flexible liberal-arts-style " +
      "degrees, and Optional Practical Training (OPT) for hands-on work experience after study.",
    overview: {
      livingCost: "Wide range depending on state and city — your counselor can help compare options against your budget.",
      career: "OPT and STEM-OPT extensions offer 1–3 years of post-study practical training.",
      admission: "SAT/ACT or test-optional for undergraduate; GRE/GMAT often required for graduate programs.",
      accommodation: "On-campus dorms are common in year one; off-campus housing after.",
      culture: "Extremely diverse, with strong international student services on most campuses.",
    },
  },
  {
    slug: "canada",
    name: "Canada",
    tag: "Open",
    cities: "Toronto · Vancouver",
    gradient: "from-[#C7297E] to-[#4E0F32]",
    image: "/destinations/canada.jpg",
    whyStudy:
      "Canada is known for accessible tuition relative to the US/UK, a straightforward Post-Graduation " +
      "Work Permit (PGWP), and clear pathways toward permanent residency.",
    overview: {
      livingCost: "Toronto and Vancouver run higher than smaller cities — your counselor can help you compare.",
      career: "Post-Graduation Work Permit length depends on program length; often a pathway to permanent residency.",
      admission: "Requirements vary by province and institution; college (diploma) and university (degree) pathways both available.",
      accommodation: "Residence halls, homestays, and shared apartments near campus.",
      culture: "Large, well-established Indonesian and broader international student communities.",
    },
  },
  {
    slug: "china",
    name: "China",
    tag: "Open",
    cities: "Beijing · Shanghai",
    gradient: "from-[#B85042] to-[#3E1A0C]",
    image: "/destinations/china.jpg",
    imageLabel: "Kuliah di Tiongkok",
    whyStudy:
      "China offers a growing number of English-taught programs, government and university " +
      "scholarships, and strong options for students pairing Mandarin study with their degree.",
    overview: {
      livingCost: "Generally lower than Australia, UK, US, or Canada — details vary by city.",
      career: "Growing relevance for students pursuing business or trade careers connected to China.",
      admission: "HSK (Chinese proficiency) may be required for Mandarin-taught programs; not for English-taught tracks.",
      accommodation: "On-campus dormitories are standard and typically the most affordable option.",
      culture: "Fast-growing international student population, with active scholarship programs.",
    },
  },
  {
    slug: "japan",
    name: "Japan",
    tag: "3 seats",
    cities: "Osaka · Tokyo",
    gradient: "from-[#7A5C1E] to-[#2E2007]",
    image: "/destinations/japan.jpg",
    imageLabel: "Kuliah di Jepang",
    whyStudy:
      "Japan pairs respected universities and language schools with JLPT-linked pathways, making " +
      "it a strong fit for students combining language study with a degree or career move.",
    overview: {
      livingCost: "Tokyo runs higher than Osaka and other regional cities — ask your counselor for current figures.",
      career: "Strong demand for Japanese-language-proficient graduates in manufacturing, IT, and tourism.",
      admission: "Language schools typically require JLPT N5 or above; degree programs vary by institution.",
      accommodation: "Dormitories and share houses are common for international students.",
      culture: "Structured, safety-focused environment with a well-established international student support system.",
    },
    featuredPrograms: [
      {
        name: "Language School",
        description: "JLPT-aligned Japanese language pathways ahead of university or work.",
        href: "/language-programs#jlpt",
      },
    ],
  },
];

export function getCountry(slug: string) {
  return COUNTRIES.find((c) => c.slug === slug);
}
