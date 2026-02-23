---
transforms:
  - (../scratch/.+)summary\.md -> $1/instruct.md
  - (../scratch/.+)notes\..* -> $1/instruct.md
---

* Given the content summary, plan an interesting article or essay that explores the key themes in depth
* Since the source input is a raw impromptu discussion, we may need to restructure, reframe, and filter the content for clarity and coherence
* Do not actually write or plan the essay: Plan the planning. Identify the appropriate instructions so they can be reviewed before proceeding to writing
* Specifically, identify:
    * **Who** we are writing to (Audience)
    * **What** we are saying (Core Message)
    * **Why** this is new or interesting (Value Proposition)
* The majority of the content should be used in the output - do not overly filter. This is not a typical article for a typical audience, but rather a focused deep-dive.