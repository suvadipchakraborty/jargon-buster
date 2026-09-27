/**
 * Jargon Buster — Translation Engine
 * ------------------------------------------------------------
 * The upstream API only returns a raw buzzword phrase (no meaning).
 * That phrase is always built from a fixed template:
 *   [Adverb] [Verb] [Adjective] [Noun phrase]
 * e.g. "Interactively Expedite Client-focused Supply Chains"
 *
 * This engine looks up each slot in a plain-English dictionary and
 * assembles a blunt, human sentence. Anything not in the dictionary
 * still gets a sensible generic gloss, so the app never breaks on
 * a word bank we haven't fully catalogued.
 * ------------------------------------------------------------
 */

const JB_ADVERBS = {
  "appropriately": "in whatever way avoids a follow-up question",
  "assertively": "loudly enough that nobody double-checks it",
  "authoritatively": "with total confidence and zero evidence",
  "collaboratively": "in a meeting that could have been an email",
  "compellingly": "using a slide with a big arrow on it",
  "competently": "adequately, which someone felt needed saying",
  "completely": "about eighty percent of the way",
  "continually": "in every single status update from now on",
  "conveniently": "in whatever way requires the least effort",
  "credibly": "by citing a source nobody will check",
  "distinctively": "in a way that looks like everyone else's",
  "dramatically": "with a chart that starts the y-axis at 40",
  "dynamically": "differently each time, on purpose or not",
  "efficiently": "with fewer people doing the same amount of work",
  "energistically": "with the energy of a Monday 9am, forced",
  "enthusiastically": "in the group chat, not in person",
  "globally": "for one office, then called worldwide",
  "holistically": "without actually looking at any one part closely",
  "interactively": "while pretending it's a two-way conversation",
  "intrinsically": "for reasons nobody can point to",
  "monotonectally": "using a word that isn't real, on purpose",
  "objectively": "based on one person's strong opinion",
  "phosfluorescently": "using a word designed to end the discussion",
  "proactively": "before anyone actually asked for it",
  "professionally": "in a font that looks trustworthy",
  "progressively": "a little bit, eventually, maybe",
  "quickly": "somewhere between this sprint and next year",
  "rapidiously": "fast, in a memo that took three weeks to send",
  "seamlessly": "with the seams hidden, not removed",
  "synergistically": "by putting two teams in the same room",
  "uniquely": "in a way three other companies already do",
  "strategically": "after a meeting that decided very little",
  "aggressively": "with a deadline nobody agreed to",
  "consistently": "whenever someone remembers to",
  "explicitly": "in writing, so it can be pointed to later",
  "implicitly": "without ever quite saying it out loud"
};

/* Every fragment here is a short transitive verb phrase, written so that
   "we're going to {fragment} the {noun}" always parses as a real sentence —
   no dangling clauses that only make sense standing alone. */
const JB_VERBS = {
  "actualize": "actually build",
  "administrate": "shuffle the paperwork for",
  "aggregate": "dump into one spreadsheet",
  "architect": "sketch once on a whiteboard for",
  "benchmark": "loosely compare against a competitor's",
  "brand": "slap a new logo on",
  "cultivate": "slowly grow",
  "customize": "add one dropdown to",
  "deliver": "eventually hand over",
  "deploy": "push out, regarding",
  "disintermediate": "cut the middleman out of",
  "disseminate": "forward an unread email about",
  "drive": "nag everyone about",
  "e-enable": "put online",
  "embrace": "reluctantly try",
  "empower": "hand more work regarding",
  "enable": "make technically possible for",
  "engage": "message once about",
  "engineer": "duct-tape together",
  "enhance": "tweak slightly and rename",
  "envisioneer": "daydream about",
  "evolve": "let quietly change, unmanaged",
  "expedite": "speed up, allegedly",
  "exploit": "squeeze extra value out of",
  "extend": "bolt extra features onto",
  "fabricate": "cobble together",
  "facilitate": "sit in on meetings about",
  "fashion": "cobble together",
  "formulate": "write down, after the fact, about",
  "foster": "encourage from a safe distance",
  "generate": "produce by Friday",
  "grow": "hope quietly gets bigger, regarding",
  "harness": "finally start using",
  "implement": "actually build",
  "incentivize": "pay people extra to bother with",
  "incubate": "leave sitting in a folder",
  "initiate": "kick off a meeting about",
  "innovate": "put a new name on",
  "integrate": "force to talk to",
  "iterate": "tweak slightly, again",
  "leverage": "just plain use",
  "maintain": "keep from falling apart",
  "matrix": "cram into a grid, regarding",
  "maximize": "push as far as it will go, regarding",
  "mesh": "force to work with",
  "monetize": "figure out how to charge for",
  "morph": "quietly turn into something else, regarding",
  "optimize": "make marginally better",
  "orchestrate": "coordinate by chasing people about",
  "plagiarize": "copy from a competitor's site",
  "pontificate": "talk for a long time about",
  "predominate": "become the default option for",
  "procrastinate": "keep delaying",
  "productize": "wrap in a UI and sell",
  "promote": "put on the homepage",
  "pursue": "chase without much of a plan for",
  "recontextualize": "re-explain, unchanged",
  "redefine": "rename",
  "reinvent": "rebuild under a new name",
  "repurpose": "reuse, since there's no budget for new",
  "restore": "put back the way it was, regarding",
  "revolutionize": "change slightly, with a press release about",
  "scale": "stretch past its tested limits, regarding",
  "seize": "grab before a competitor does, regarding",
  "simplify": "hide the complexity of",
  "strategize": "make a slide about",
  "streamline": "cut a step from",
  "supply": "eventually provide",
  "syndicate": "over-share",
  "synergize": "throw two teams at",
  "synthesize": "cram three reports into one about",
  "target": "aim for, with no real plan for",
  "transform": "rename the department behind",
  "transition": "slowly phase out",
  "unleash": "finally ship, months late, regarding",
  "utilize": "use, the long way of saying it, for",
  "visualize": "cram into a chart, regarding",
  "whiteboard": "talk about, then forget"
};

const JB_ADJECTIVES = {
  "adaptive": "flexible enough to survive one reorg",
  "agile": "kept to two-week chunks, whether it fits or not",
  "backend": "the part users never see and rarely think about",
  "backward-compatible": "still working with the old thing, mostly",
  "best-of-breed": "the one the salesperson called best",
  "bleeding-edge": "untested, but exciting to say out loud",
  "business": "made to sound serious",
  "client-based": "aimed at whoever's paying",
  "client-centered": "aimed at whoever's paying",
  "client-centric": "aimed at whoever's paying",
  "client-focused": "actually about the client",
  "collaborative": "involving more meetings than necessary",
  "compelling": "backed by one good-looking chart",
  "competitive": "priced to match whoever we're copying",
  "cooperative": "requiring three teams to agree first",
  "corporate": "official enough to need approval",
  "cost effective": "cheaper, which is the actual point",
  "cross functional": "made up of people who don't usually talk",
  "cross-platform": "built to work everywhere, tested on one device",
  "customer directed": "shaped by one loud customer email",
  "customized": "changed by one setting",
  "cutting-edge": "new, or new to this company",
  "distinctive": "different in a way marketing insisted on",
  "dynamic": "prone to changing without warning",
  "e-business": "the same business, but on a website",
  "economically sound": "cheap enough to get signed off",
  "effective": "worked, at least once",
  "efficient": "done with fewer people than it needs",
  "elastic": "stretchy right up until it snaps",
  "emerging": "new enough that nobody's sure it'll last",
  "empowered": "given more responsibility, not more pay",
  "end-to-end": "supposed to cover the whole thing, on paper",
  "enterprise": "big enough to need extra approvals",
  "ethical": "the version that survives a press headline",
  "extensible": "built so someone else can fix it later",
  "flexible": "prone to changing depending on who's asking",
  "focused": "narrowed down to one bullet point",
  "frictionless": "smooth for the user, painful for the team building it",
  "front-line": "closest to the actual customers",
  "functional": "working, technically",
  "future-proof": "hopefully still working in two years",
  "global": "rolled out to one extra country",
  "goal-oriented": "aimed at a number on a slide",
  "granular": "broken into more pieces than needed",
  "high-quality": "checked at least once",
  "holistic": "vague on purpose, to cover everything",
  "impactful": "noticeable to at least one person",
  "innovative": "different from last year's version",
  "integrated": "forced to work with something else",
  "interactive": "responsive when you click something",
  "interoperable": "compatible with other systems, in theory",
  "mission-critical": "going to get someone yelled at if it breaks",
  "multidisciplinary": "involving people who disagree a lot",
  "next-generation": "the next version, marketed as a leap",
  "open-source": "free, with someone else's bugs included",
  "out-of-the-box": "supposed to work without extra setup",
  "premium": "the same thing, priced higher",
  "proactive": "done before being asked, for once",
  "process-centric": "more about the steps than the result",
  "professional": "presentable in a client meeting",
  "quality": "checked, at minimum",
  "real-time": "fast enough that nobody notices the delay",
  "reliable": "yet to break, as far as anyone knows",
  "revolutionary": "meaningfully different",
  "robust": "hard to break by accident",
  "scalable": "built to work for more people, in theory",
  "seamless": "smooth on the surface, held together with hidden seams",
  "standardized": "the same everywhere, on paper",
  "strategic": "approved by someone senior",
  "sustainable": "not going to fall apart immediately",
  "synergistic": "the kind of word that makes two things sound like one",
  "tactical": "short-term, and everyone knows it",
  "team driven": "decided by committee, slowly",
  "top-line": "about revenue, not cost",
  "transparent": "visible to whoever's allowed to see it",
  "turnkey": "ready to go, assuming nothing goes wrong",
  "ubiquitous": "everywhere, or at least on every slide",
  "unique": "different, probably not as much as claimed",
  "user centric": "designed with an actual user in mind, sometimes",
  "user-centric": "designed with an actual user in mind, sometimes",
  "value-added": "pricier, and they'd like you to notice",
  "viral": "shared by more than twelve people",
  "virtual": "happening on a screen instead of in a room",
  "visionary": "ambitious, and short on specifics",
  "web-enabled": "the sort of thing that now has a website",
  "wireless": "no cables, more batteries",
  "world-class": "good, according to the people who built it"
};

const JB_NOUNS = {
  "action items": "to-do list",
  "action-items": "to-do list",
  "alignments": "point where everyone finally agrees",
  "applications": "software itself",
  "architectures": "way the whole thing is put together",
  "bandwidth": "spare time and energy",
  "benefits": "good parts, emphasized on purpose",
  "best practices": "way it worked last time, repeated blindly",
  "catalysts for change": "thing that finally forces a decision",
  "channels": "ways messages get sent",
  "clouds": "someone else's servers",
  "communities": "users, when we want them to feel special",
  "content": "stuff that gets written or posted",
  "convergence": "point where several things become one",
  "core competencies": "stuff the company is actually good at",
  "customer service": "people who answer complaints",
  "data": "numbers, some of them checked",
  "deliverables": "things that are actually due",
  "e-business": "same business, done through a website",
  "e-commerce": "business of selling things online",
  "expertise": "knowing more than the person asking",
  "experiences": "way using the thing actually feels",
  "functionalities": "features",
  "growth strategies": "plan to get bigger",
  "ideas": "things said in a meeting, mostly unused",
  "imperatives": "things leadership insists matter most",
  "infrastructures": "plumbing behind everything",
  "initiatives": "projects with a name and a kickoff meeting",
  "innovation": "newest thing this quarter",
  "interfaces": "parts users actually touch",
  "intranets": "internal website nobody visits",
  "leadership": "people who sign off on things",
  "markets": "people we're trying to sell to",
  "materials": "stuff used to make or explain something",
  "methodologies": "steps, written down formally",
  "metrics": "numbers used to prove a point",
  "mindshare": "amount people think about the brand",
  "models": "simplified version of something complicated",
  "networks": "connections between people or systems",
  "niche markets": "small group who'll actually buy this",
  "opportunities": "problems, rebranded",
  "outsourcing": "practice of paying someone else to do it cheaper",
  "paradigms": "way things are currently assumed to work",
  "partnerships": "two companies agreeing to help each other, sort of",
  "platforms": "base everything else is built on",
  "portals": "login page for internal tools",
  "relationships": "web of who owes who a favor",
  "resources": "people, mostly, described like equipment",
  "roi": "question of whether it was worth the money",
  "scenarios": "situations planned for, and the ones that aren't",
  "schemas": "way the data is organized",
  "services": "stuff offered beyond the product itself",
  "solutions": "fix, sold as if it's new",
  "structures": "way teams or systems are arranged",
  "supply chains": "way things get from A to B",
  "synergy": "two teams doing what one team could",
  "systems": "tools that keep everything running",
  "technologies": "tools, described more impressively",
  "users": "people actually using the thing",
  "web services": "bits of software that talk to each other online"
};

const JB_TEMPLATES = [
  ({ adverbFrag, verbFrag, nounFrag, adjectiveFrag }) =>
    `${cap(adverbFrag)}, someone is going to ${verbFrag} the ${nounFrag} \u2014 supposedly ${adjectiveFrag}.`,
  ({ verbFrag, nounFrag, adjectiveWord, adjectiveFrag }) =>
    `Plain English: they're planning to ${verbFrag} the ${nounFrag}. Calling it \u201c${adjectiveWord.toLowerCase()}\u201d just means it's ${adjectiveFrag}.`,
  ({ adverbFrag, verbFrag, nounFrag, adjectiveFrag }) =>
    `Bottom line: ${cap(verbFrag)} the ${nounFrag}, ${adverbFrag}, and call it ${adjectiveFrag}.`,
  ({ verbFrag, nounFrag, adjectiveWord, adjectiveFrag }) =>
    `In short, someone will ${verbFrag} the ${nounFrag}. The word doing all the work is \u201c${adjectiveWord.toLowerCase()}\u201d \u2014 which just means ${adjectiveFrag}.`
];

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function lookup(dict, word, fallback) {
  if (!word) return fallback;
  const key = word.toLowerCase().trim();
  if (dict[key]) return dict[key];
  // soft fallback: strip a trailing 's' or common suffixes and retry once
  const stripped = key.replace(/s$/, "");
  if (dict[stripped]) return dict[stripped];
  return fallback;
}

/**
 * Parses a phrase of the fixed shape [adverb] [verb] [adjective] [noun phrase...]
 * and returns { adverbWord, verbWord, adjectiveWord, nounWord, translation }
 */
function translateJargon(phrase) {
  const words = phrase.trim().split(/\s+/);
  const adverbWord = words[0] || "";
  const verbWord = words[1] || "";
  const adjectiveWord = words[2] || "";
  const nounWord = words.slice(3).join(" ") || words[words.length - 1] || "";

  const adverbFrag = lookup(JB_ADVERBS, adverbWord, "for reasons nobody will explain");
  const verbFrag = lookup(JB_VERBS, verbWord, "do something to");
  const adjectiveFrag = lookup(JB_ADJECTIVES, adjectiveWord, "important, apparently");
  const nounFrag = lookup(JB_NOUNS, nounWord, nounWord.toLowerCase() || "the thing in question");

  const template = JB_TEMPLATES[Math.floor(Math.random() * JB_TEMPLATES.length)];
  const translation = template({
    adverbWord, verbWord, adjectiveWord, nounWord,
    adverbFrag, verbFrag, adjectiveFrag, nounFrag
  });

  return { adverbWord, verbWord, adjectiveWord, nounWord, translation };
}
