# Meta Development portfolio refresh

## Scope and design

Updated 27 September 2026. Improve the existing website and enquiry journey, and add shared website views. This is the existing plain HTML/CSS/JavaScript project, hosted through GitHub Pages. No framework, package manager, domain or deployment change. The smooth-scroll follow-up adds a pinned, locally served Lenis runtime.

Audience: Roblox creators looking for a focused fix, a feature, or a connected prototype. Primary action: **Get a project quote**, leading to the existing FormSubmit enquiry. Preserve project videos, email/Discord contact and the existing thank-you route. The final publishing request removes the colour picker and saved accent preferences, leaving a fixed violet palette.

Two directions considered: an expanded code-editor hero or a portfolio-first project preview. Chosen: portfolio-first, because it shows the work before asking a visitor to make contact. Use the existing violet/charcoal palette, Space Grotesk headings and DM Sans body text. Retain the original project artwork; no external design was copied. Reference: the repository's existing page, visually inspected on desktop before changes.

Hero candidates considered:
- Your next Roblox feature. Built to play. **Selected:** concrete offer and a natural lead-in to the showcased work.
- Roblox systems that feel finished. Retains the earlier message but is less specific about the commission.
- From game idea to playable system. Useful for prototypes, less suitable for targeted fixes.

The hero now leads with the recorded Connected Simulator Framework demo, with explicit selectors for combat, keyboard input/audio and hoverboard movement. The seven-demo library follows the hero/stats, ahead of the biography. Visitors can filter game systems, combat/weapons and movement/input. Anime Pulse remains as one regular demo at the end of the library; its duplicate large experience panel was removed.

The motion direction is an original violet signal grid: a gently warping Canvas 2D field with short travelling traces and bounded pointer response. The skill's layered-motion atlas informed separation of scene/content and natural-scroll entrances; no external site's implementation or live visual behaviour was reverified or copied for this update. The native document remains the scroll container. Desktop wheel interpolation is now owned by one Lenis instance; touch, keyboard paging, nested text areas and mobile navigation retain native behaviour. There is no pinning, automatic video playback or carousel timer.

## Acceptance checklist

- [x] Preserve the existing identity and static stack.
- [x] Strengthen the main CTA and explain the next step.
- [x] Carry pricing scope into a real enquiry without overwriting the written brief or chosen budget.
- [x] Provide direct email and Discord contact alternatives.
- [x] Add shared portfolio page views with honest loading/failure states.
- [x] Keep website views separate from Roblox game visits.
- [x] Repair mobile menu contrast, Escape handling and focus return.
- [x] Keep mobile, keyboard, reduced-motion and JavaScript-disabled paths usable.
- [x] Verify layout and functional paths in Chromium emulation.
- [x] Publish the portfolio refresh and verify GitHub Pages on the configured gh-pages branch.
- [ ] Verify an authorised real form submission and receipt with the owner.

## Claims and integrations

Seven recorded showcases are present in the source; their existing YouTube destinations were preserved. Videos were not replayed end to end. The unsupported “12+ systems delivered”, “most requested” badge and repeated 24-hour response promise were removed from the edited journey. The user subsequently requested a substantial price increase with a $600 base for a couple of features. The pricing now starts at $600 for two small, scoped features, $1,500 for a systems build and $3,000 for a playable prototype. The larger tiers are editorial starting points chosen for the updated ladder; all packages require an agreed quote. The hero, enquiry introduction, budget options, package CTAs and FAQ match this positioning. Currency remains USD as on the original site.

FormSubmit remains a native form POST. Name, reply contact and a brief are required. Reference link and deadline are optional; the budget supports “Not sure yet”. The success route is preserved and does not itself prove email delivery. Local QA intercepts the POST before it leaves the browser; no real message was sent and provider activation/delivery remains unverified. Native navigation lets the provider handle submission errors; email is also available directly on the form.

Roblox game statistics continue to try Roblox and then RoProxy. Each request has a five-second timeout. All three expected numeric fields must be present before numbers are shown. Failed refreshes display dashes and an unavailable notice instead of undated hardcoded figures.

## Website views

Provider: Hits.sh. The integration follows its [official repository documentation](https://github.com/silentsoft/hits), checked during this task. The counter image is keyed to `metaa0.github.io/MetaDevelopment`, distinct from the GitHub repository traffic metric and the Roblox game-visit count.

- Loads only on `https://metaa0.github.io/MetaDevelopment/` or its `index.html` route.
- One normal image request per page load; no cache-busting, seeded values, polling, browser identifiers or localStorage visit totals.
- The service receives an ordinary image request. The site sets `referrerPolicy` to `no-referrer`; no user-entered form data is sent to the counter.
- An information disclosure explains approximate views, repeat loads, caching, automated traffic and the provider; it links to the public counter details.
- A blocked/failed image or eight-second timeout produces a readable unavailable state.
- Preview/local hosts never increment the shared counter. With JavaScript disabled the visitor sees a truthful explanatory label.
- Counts start when this integration is published/used. Earlier website visits cannot be recovered through this counter. This is not unique-visitor analytics or a conversion dashboard.
- Provider availability was checked using the separate `MetaDevelopment/qa-20260927` test key: HTTP 200, SVG image, 610 bytes. The actual public portfolio counter was not incremented for QA.

The Stripe Directory CLI was unavailable on this machine. Provider documentation was checked directly after the directory setup documentation and an unsuccessful Firecrawl retrieval; no provider account, paid plan or infrastructure was provisioned.

If the website's public domain changes, update the exact production-host guard and decide whether to retain the existing counter key before publishing.

## Validation evidence

Run the static preview from this directory, for example `python -m http.server 4178 --bind 127.0.0.1`. Run `node scripts/qa.cjs` with Playwright installed, or set `PLAYWRIGHT_PATH` to its module location. The task used the bundled Codex Node/Python/Playwright runtimes and installed no packages.

The script verifies 320, 375, 390, 430, 768, 900, 1024 and 1440 CSS-pixel widths plus 844×390 landscape. Checks include overflow, one main h1, fragment destinations, image alt attributes, mobile menu and focus, keyboard project switching, all three pricing CTAs, brief preservation, optional fields, URL validation, the intercepted native POST, sticky quote visibility, live reduced-motion preference, no-JavaScript navigation, the thank-you route, counter production gating, mocked counter success/failure and Roblox failure fallback.

Evidence lives in ignored `.qa/`: `report.json`, desktop/mobile hero screenshots, menu screenshot, contact screenshot and the original desktop baseline. Additional motion screenshots and motion-report.json cover this update. Screenshots of form QA contain labelled test inputs. Mocked counter values are test fixtures only and never appear in the site source.

`node --check script.js` and `git diff --check` passed. No build/lint pipeline exists for this static project. No Lighthouse score or conversion improvement is claimed. Physical phones, Safari, assistive technology, true browser 200%/400% zoom, field performance, external video playback and live enquiry delivery remain unverified; 320px reflow and Chromium responsive emulation are the evidence available here.

The hero uses the existing small vector brand mark instead of loading the roughly 937 KB Discord avatar for a 44px portrait. Other below-fold images load lazily; the hero artwork is eager with a reserved aspect ratio. Lenis 1.3.26 is the only added dependency (18,722 bytes of JavaScript, 513 bytes of CSS). It is locally served from assets/vendor/lenis-1.3.26 with its MIT notice and SHA-512-verified npm provenance. No install hooks were run, and the package has no runtime dependencies. A single shared animation-frame clock drives the smoother and a decorative Canvas loop is capped at 30 drawn frames/second on desktop and 24 on phones, with capped DPR (1.5 / 1). The visible motion control pauses the loop, cancels active Web Animations and removes hero scroll depth; the preference survives reload. Live reduced-motion changes immediately cancel movement. Hidden documents and pagehide stop the loop; pageshow resumes it when allowed. Static CSS atmosphere and fully visible HTML survive missing canvas/JavaScript.

Scroll entrances use a visible-by-default IntersectionObserver/Web Animations pattern (22px, 620ms, maximum 110ms stagger). They run once and animate internal card content rather than competing with card hover transforms. Hero depth uses a separate translate property with a 32px maximum and is disabled on phones. Process cards highlight as they enter view.

Additional validation: node scripts/motion-qa.cjs checks canvas pixel changes while running, frozen pixels on pause and reduced motion, persisted pause, live/initial motion preferences, synthetic pagehide/pageshow, all four hero selectors, every demo filter/count, demo ordering, active-animation cancellation, rapid reverse scrolling, and mobile header/filter behaviour. These are Chromium checks, not a physical-device performance profile. The media-query assertion waits for the asynchronous browser change event. No real enquiries or live portfolio-counter requests were used for these tests.


## Smooth scrolling and consistent section motion

The user requested smooth scrolling and broader dynamic behaviour after providing screenshots of the About section and hero. The implementation follows the official Lenis repository documentation at https://github.com/darkroomengineering/lenis and the pinned npm package README/source (1.3.26). Package integrity and source URL are recorded in assets/vendor/lenis-1.3.26/provenance.json.

Lenis uses lerp 0.16, wheel multiplier 1 and autoRaf false. Its manual clock is the existing motion loop, so there is no competing scroll controller or second animation clock. Smooth interpolation is active only with a fine pointer above the phone breakpoint. syncTouch is false. No runtime CDN request is needed.

Pause, reduced motion, hidden documents and pagehide destroy the scroll instance instead of stopping/locking the page. Resuming recreates one instance from the current native scroll position. CSS smooth behaviour is disabled only while Lenis owns interpolation. A missing vendor file leaves usable native scrolling and links. Hash links update history and focus their destination after settling; they honour the sticky-header offset and synchronise current scroll position first, including after keyboard paging. Back navigation and midpage reload were tested. Menu scrolling, textarea scrolling and selects are excluded from interception.

Major section headers, stats, About media/text, proof cards, experience details, process, skills, pricing, FAQ, contact and footer now share short progressive entrances. About and experience images gain bounded desktop parallax. Each section has a subtle progress accent. Active navigation follows the current section, including when decorative motion is paused. Fine-pointer lighting on cards/forms is event-driven; FAQ answers and filter changes receive brief transitions. Motion preference/pause cancels these effects and retains all text and controls.

Additional test: node scripts/scroll-qa.cjs. Chromium received a 600px wheel input; the recorded sample reached 370px during the early interpolation window and settled at 600px. Reverse wheel, header-safe anchor positioning and focus, About parallax, Page Down, nested textarea scrolling, back navigation, midpage refresh, pause/reduced-motion destruction, missing-library fallback and native touch configuration passed with no uncaught page errors. This is input-simulation evidence, not a physical mouse/trackpad or phone performance measurement. The regression exposed and fixed an anchor overshoot after Page Down by synchronising native scroll before the anchor animation.

## Cursor and fixed corner views follow-up

The user rejected pop-in entrances. Removed the section entrance observer and demo-filter body animations; content remains still and fully visible while the background, bounded image parallax, smooth scroll and interaction feedback continue. Added a 32px fine-pointer halo to the existing animation clock. It keeps the native pointer and expands over links/buttons without intercepting clicks. Hide it over form controls, on keyboard use, pointer exit, window blur, touch, pause and reduced motion.

Removed the hero developer icon and One developer / Direct contact block. Moved the existing genuine page-view counter to a fixed bottom-right chip labelled Profile views, with its explanation retained. On small screens it sits above the quote CTA. The count still represents website page views, not Roblox profile views or unique visitors. Removed the eye icon as well.

GitHub Pages publishes from gh-pages. The separate existing main-branch Actions workflow is blocked by the environment branch rule; do not loosen that rule. Publish with a normal fast-forward push to gh-pages and check the standard pages build and deployment job.
