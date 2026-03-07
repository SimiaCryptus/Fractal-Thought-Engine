---
transforms: (.+)/content\.md -> $1/social_share.md
task_type: SocialMediaContent
---

# Influence-Optimized Social Share Posts

* Generate platform-specific share posts for the provided `content.md`
* Each post should be optimized for engagement, reach, and click-through on its target platform
* Produce separate posts for each platform listed below
* Extract the core insight, provocation, or value proposition from the content and lead with it
* Adapt tone, structure, length, and formatting to each platform's norms and algorithm preferences

---

## Output Format

Structure the output as clearly labeled sections, one per platform:

```
## LinkedIn
<post content>

## Facebook
<post content>

## X (Twitter)
<post content>

## X (Twitter) Thread
<thread content>

## Bluesky
<post content>

## Reddit
<post content>

## Hacker News
<post content>
```

---

## Platform Specifications

### LinkedIn

**Character Limit:** ~3,000 characters (posts truncate at ~210 characters with "...see more")
**Formatting Supported:**

- Line breaks (use liberally — single-sentence paragraphs perform best)
- Bold text (not natively, but ALL CAPS or unicode bold characters are common hacks)
- Emojis (used sparingly as bullet markers or section headers)
- No Markdown rendering, no clickable hashtags inline (hashtags go at the end)
- Links in the post body reduce reach; prefer placing the link in the first comment and noting "Link in comments"
  **Target Audience:** Professionals, technologists, researchers, executives, thought leaders. Skews toward people who
  signal intellectual engagement.
  **Tone:** Authoritative but accessible. Thought-leadership style. First-person perspective ("I've been thinking
  about...", "Here's what most people miss about..."). Avoid corporate jargon. Vulnerability and contrarian takes
  perform well.
  **Structure for Maximum Engagement:**

1. **Hook (first 2 lines):** A bold claim, surprising statistic, contrarian opinion, or provocative question. This is
   the only part visible before "see more" — it must compel the click.
2. **Body (5-15 short paragraphs):** One idea per line. Use white space aggressively. Build a narrative arc or argument.
   Include a personal angle or concrete example.
3. **Call to Engagement:** End with a question or invitation to discuss ("What's your take?", "Am I wrong about this?")
4. **Hashtags:** 3-5 relevant hashtags at the very end, on their own line. Mix broad (#AI, #MachineLearning) with
   niche (#AIConsciousness, #HumanAICollaboration).
   **Algorithm Notes:**

- Posts without outbound links get significantly more reach
- Dwell time matters — longer posts that hold attention are rewarded
- Comments in the first hour are critical; ask a genuine question to seed discussion
- Tagging people (sparingly, and only if relevant) boosts visibility

---

### Facebook

**Character Limit:** ~63,206 characters (but posts truncate at ~477 characters with "See more")
**Formatting Supported:**

- Line breaks
- Emojis
- No bold, italic, or Markdown
- Links generate preview cards (include the URL directly in the post body)
- Photo/image posts get higher reach than text-only or link posts
  **Target Audience:** General educated audience. More personal and community-oriented than LinkedIn. Friends-of-friends
  discovery model.
  **Tone:** Conversational, warm, curious. Less performative than LinkedIn. Write as if sharing something fascinating
  with a smart friend over coffee. Enthusiasm and genuine wonder perform better than authority signaling.
  **Structure for Maximum Engagement:**

1. **Hook:** An intriguing question, a "you won't believe what I found" energy, or a relatable observation
2. **Body:** 2-5 short paragraphs. Tell a micro-story or share a key insight with context. Keep it more concise than
   LinkedIn.
3. **Link:** Include the URL directly — Facebook generates a preview card. Add a line like "Full piece here 👇" before
   the link.
4. **Call to Engagement:** Ask for opinions, experiences, or reactions. Facebook's algorithm heavily weights comment
   activity.
5. **Hashtags:** 1-3 at most. Hashtags are less important on Facebook and can feel spammy. Use only if they're genuinely
   searchable terms.
   **Algorithm Notes:**

- Posts that generate meaningful comments (not just likes) are heavily boosted
- Shares are the highest-signal engagement — write something people want to re-share
- Image posts outperform text-only posts
- Video and native content outperform outbound links

---

### X (Twitter) — Single Post

**Character Limit:** 280 characters (links consume ~23 characters)
**Formatting Supported:**

- No rich text formatting
- Line breaks (use for emphasis)
- Emojis
- Hashtags are clickable and searchable
- Links are auto-shortened and generate preview cards
  **Target Audience:** Tech-savvy, opinionated, fast-scrolling. Values wit, concision, and hot takes. High density of
  developers, researchers, journalists, and AI practitioners.
  **Tone:** Sharp, confident, slightly provocative. Intellectual but punchy. The best tweets sound like the smartest
  thing someone said at a dinner party. Avoid hedging language.
  **Structure:**

1. **One killer line** that encapsulates the core insight or provocation
2. **Link** (if space permits, or as a reply to the main tweet)
3. **Hashtags:** 1-2 maximum, integrated naturally or appended. Over-hashtagging looks spammy on X.
   **Algorithm Notes:**

- Replies and quote-tweets boost visibility more than likes
- Tweets without links sometimes get more impressions (algorithm may suppress outbound links); consider posting the hook
  tweet first, then replying with the link
- Timing matters — post during peak hours for your target audience (US morning, European afternoon)

---

### X (Twitter) — Thread Format

**Character Limit:** 280 characters per tweet, 5-12 tweets recommended
**Formatting Supported:**

- Same as single tweet
- Number tweets (1/, 2/, etc.) or use a consistent emoji marker
- First tweet must stand alone as a hook
  **Target Audience:** Same as single tweet, but threads attract readers who want depth. Thread readers are more likely
  to follow and engage.
  **Tone:** Same sharp tone, but with room to build an argument. Each tweet should be independently quotable.
  **Structure:**

1. **Tweet 1 (Hook):** Bold claim or question. Must be compelling standalone — most people will only see this one. End
   with "🧵👇" or "A thread:" to signal more is coming.
2. **Tweets 2-N (Body):** One idea per tweet. Use concrete examples, data points, or surprising facts. Maintain
   momentum — every tweet should make the reader want the next one.
3. **Final Tweet:** Summarize the key takeaway. Include the link. Invite follows or retweets ("If you found this useful,
   RT the first tweet so others can find it").

---

### Bluesky

**Character Limit:** 300 characters per post
**Formatting Supported:**

- No rich text formatting (plain text only)
- Line breaks
- Links generate preview cards
- Emojis
- No hashtags in the traditional sense (Bluesky uses a different discovery model based on custom feeds and algorithms)
  **Target Audience:** Early adopters, tech community, academics, journalists, and users who migrated from Twitter.
  Skews toward people who value thoughtful discourse over engagement farming.
  **Tone:** Thoughtful, genuine, slightly nerdy. Less performative than X. The community actively penalizes obvious
  engagement bait. Authenticity and intellectual curiosity are rewarded.
  **Structure:**

1. **Lead with the insight** — not a hook, but a genuinely interesting observation or finding
2. **Brief context** — 1-2 sentences of why it matters
3. **Link** — include directly; preview cards work well
4. **No hashtags** — Bluesky discovery works through custom feeds, reposts, and follows, not hashtag search
   **Algorithm Notes:**

- Bluesky uses customizable algorithmic feeds — content is surfaced based on the feeds users subscribe to
- Reposts and likes from well-connected accounts matter more than raw engagement numbers
- The community is smaller but highly engaged; quality over quantity

---

### Reddit

**Character Limit:** 40,000 characters for text posts; 300 characters for titles
**Formatting Supported:**

- Full Markdown (bold, italic, headers, lists, code blocks, blockquotes, links)
- Reddit-flavored Markdown (strikethrough with `~~`, superscript with `^`)
- Link posts vs. text posts are distinct submission types
  **Target Audience:** Highly variable by subreddit. Generally skeptical, detail-oriented, and allergic to
  self-promotion. Values substance, novelty, and genuine contribution to discussion.
  **Tone:** Informative, humble, community-oriented. Write as a peer sharing something interesting, NOT as a brand
  promoting content. Self-promotion is heavily penalized on most subreddits. Frame the post as a contribution to the
  community's interests.
  **Structure:**

1. **Title:** Descriptive and specific. Not clickbait — Reddit users downvote vague or sensationalized titles. State the
   core finding or question clearly. Example: "We built a system that transforms articles into 23 different cognitive
   formats (comics, Socratic dialogues, game theory analyses) — here's what we learned about multi-modal understanding"
2. **Body (for text posts):** Lead with the most interesting finding or insight. Provide enough context that the post is
   valuable even without clicking through. Include the link naturally, not as the sole purpose of the post. Use Markdown
   formatting for readability.
3. **Subreddit Targeting:** Suggest 2-3 appropriate subreddits based on the content topic (e.g., r/artificial,
   r/MachineLearning, r/philosophy, r/compsci, r/MediaSynthesis)
4. **No hashtags** — Reddit does not use hashtags
   **Algorithm Notes:**

- Early upvotes in the first hour are critical for visibility
- Comments from the OP (original poster) engaging with replies boost the post
- Cross-posting to multiple subreddits is acceptable if the content is genuinely relevant to each
- Many subreddits have specific posting rules — note any formatting requirements

---

### Hacker News

**Character Limit:** Title: 80 characters. Comments: ~8,000 characters.
**Formatting Supported:**

- Titles are plain text only, no Markdown
- Comments support basic formatting: blank lines for paragraphs, `*` for italic, indented code blocks
- No bold, no headers, no links in Markdown format (URLs are auto-linked)
- Link submissions vs. "Show HN" vs. "Ask HN" are distinct post types
  **Target Audience:** Software engineers, startup founders, researchers, technical leaders. Extremely high
  signal-to-noise expectations. Values technical depth, intellectual honesty, and novelty.
  **Tone:** Understated, precise, intellectually honest. No hype, no superlatives, no marketing language. HN readers are
  experts at detecting and punishing self-promotion. The ideal tone is "here's something technically interesting" — let
  the work speak for itself.
  **Structure:**

1. **Title:** Concise, factual, specific. Follow HN conventions:

- For link posts: Describe what the thing IS, not why it's amazing. Example: "Fractal Thought Engine: A pipeline that
  transforms articles into 23 cognitive formats"
- For Show HN: "Show HN: [concise description of what you built]"
- Avoid ALL CAPS, exclamation marks, or clickbait phrasing

2. **Submission Comment (optional but recommended):** Post a top-level comment providing context: what the project is,
   what's technically interesting about it, what you learned, and what you'd do differently. Be candid about
   limitations.
3. **No hashtags, no emojis** — these signal inauthenticity on HN
   **Algorithm Notes:**

- HN uses a penalty for posts that get flagged or have a high click-to-upvote ratio (people clicked but didn't find it
  valuable)
- Engagement in comments (especially thoughtful, technical responses from the submitter) significantly boosts ranking
- Posting time matters: US morning (EST) tends to get the most visibility
- "Show HN" posts get a dedicated section and are treated more favorably for self-promotion than regular link posts

---

## General Guidelines Across All Platforms

1. **Lead with value, not promotion.** Every post should give the reader something — an insight, a question, a
   surprise — before asking them to click through.
2. **Adapt the angle per platform.** The same article might emphasize:

- The **career/industry implications** on LinkedIn
- The **human story or curiosity angle** on Facebook
- The **sharpest single insight** on X
- The **technical novelty** on Hacker News
- The **community-relevant question** on Reddit
- The **thoughtful observation** on Bluesky

3. **Hashtag discipline:**

- LinkedIn: 3-5, at the end
- Facebook: 0-3, only if genuinely useful
- X: 1-2, integrated or appended
- Bluesky: None
- Reddit: None
- Hacker News: None

4. **Link placement strategy:**

- LinkedIn: In first comment (note "link in comments" in post)
- Facebook: In post body (generates preview card)
- X: In reply tweet or at end of thread
- Bluesky: In post body
- Reddit: In post body with context
- Hacker News: As the submission URL

5. **Emoji usage:**

- LinkedIn: Moderate (as bullet markers or section breaks)
- Facebook: Moderate
- X: Light
- Bluesky: Light
- Reddit: Minimal to none
- Hacker News: Never

6. **Include a suggested posting schedule** noting optimal times if the content is time-sensitive.
7. **For each platform post, include a brief rationale** (in a comment/note block) explaining the strategic choices
   made — why this hook, why this angle, why this CTA.