/** Copy for /app-quote. Every claim is already on the site (home, about, MVP page, work); nothing new is promised. */
export const SHOW_PRICES = false; // flag: pricing section stays off until the owner decides (the site shows both "from $2,500" and "$14k–$26k")

export const pains = [
  { t: "Deadlines slip", b: "Scope and timeline are written into a fixed proposal before you commit, and you see working software every week, so slippage shows up early instead of at the end." },
  { t: "Surprise invoices", b: "You know the number before you commit a penny: a clear fixed price within 48 hours, with version one separated from later phases and the assumptions written down." },
  { t: "Juniors on your build", b: "The senior engineer who scopes, builds and ships your product is the person you talk to, not a sales rep who hands it to juniors." },
];

export const steps = [
  { n: "01", t: "Discover", b: "Goals, scope, the metric to move. Fixed proposal in 48h." },
  { n: "02", t: "Design", b: "Clickable UX before a line of code." },
  { n: "03", t: "Build", b: "Weekly working software, in your tools." },
  { n: "04", t: "Launch", b: "App Store & Play Store submission, done for you." },
  { n: "05", t: "Scale", b: "Iterate on real usage; own the ops." },
];

export const faqs = [
  { q: "What will it cost?", a: "You get a fixed price in writing, within 48 hours of a free call, before you commit anything. It depends on feature depth, particularly the back-end: real-time data, payments, offline behaviour, role-based access and third-party integrations." },
  { q: "Who owns the code, and can you sign an NDA?", a: "You own all code and IP. An NDA is available on request, and product names in our portfolio are withheld under client NDAs." },
  { q: "What if I change my mind mid-build?", a: "You see working software every week, so changes surface early. The proposal separates version one from later phases and writes the assumptions down, so a new idea can be scheduled as a later phase and you can see what it affects." },
  { q: "What happens after launch?", a: "Launch is the start of the cost, not the end of it: app stores need ongoing releases, OS versions change and real usage produces work no plan anticipated. We stay for monitoring and iteration sprints, or hand over cleanly if you are building an in-house team." },
  { q: "Do you work in my time zone?", a: "We work across UK, US, UAE and India time zones for real-time collaboration." },
  { q: "What is in the 48-hour proposal?", a: "Scope, timeline and a fixed price. Version one is separated from later phases explicitly, with the assumptions written down." },
];
