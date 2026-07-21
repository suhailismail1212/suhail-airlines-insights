# Prompt History

The prompts used to build Suhail Airlines Insights with Claude, in order. A couple of adjacent, closely related asks have been merged into a single entry for readability.

1. **Project brief.** Specified a standalone analytics dashboard demo built with Next.js, TypeScript, and Tailwind CSS, covering Overview, Visits & Happiness, Zone Analytics, Journeys, and Dissatisfied Visitors pages — plus four features beyond the reference tool's scope: anomaly/alert flags, period-over-period comparison, a forecast panel, and exportable reports. Specified a realistic mock data generator, a login flow, and a deploy-ready build.

2. **Scope clarifications.** Chose to use my own name for branding rather than the client's, asked for a few theme directions to pick between, confirmed I had real zone data to seed the generator with, and specified deploy-ready only — no live deployment needed.

3. **Theme and branding.** Selected the "Bold data-viz colorful" theme direction, then renamed the project to "Suhail Airlines" with an airport-inspired visual theme in place of an early "Emirates" placeholder, to keep clear distance from the real client, and supplied real zone data for the generator.

4. **Depth pass, part 1.** Requested persistent active states on the date-range filters, hover-to-highlight behavior on the Journeys flow chart, more clickable drill-downs across the Overview page, and richer gender/age comparisons — pointed to a reference tool's screenshots for the level of depth expected, without asking for a literal copy. Held off starting until all reference material was shared.

5. **Depth pass, go-ahead.** Shared the remaining reference screenshots and gave the green light to build: more hover interactions, deeper demographic breakdowns, and a general lift in the amount of insight surfaced across the app.

6. **Run instructions.** Asked for setup and run instructions for the project.

7. **Bug fix and enhancement pass.** Flagged a bug from a screenshot, asked for a full regression pass to confirm there were no other bugs, and asked for a general enhancement pass since the app still felt basic.

8. **Follow-up bug reports.** Flagged that the site failed to fully load as it previously had, and separately flagged a UI overlap bug (donut chart tooltip colliding with its center label).

9. **Motion and polish pass.** Requested a subtle motion pass across the app: number count-up animations, chart entrance animations, card hover states, page transitions, loading skeletons, and button press feedback — explicitly ruling out glassmorphism, gradients/glows, scroll-triggered reveals, and bouncy easing in favor of restraint.

10. **Structural rebuild to match the reference tool.** Requested the dashboard be rebuilt page-by-page to match the reference tool's layout, structure, and chart types directly, reasoning that real client work means building within existing brand guidelines rather than a fresh design — while keeping the Suhail Airlines branding, the four custom features, and the existing motion/polish work intact, and executing to a higher visual standard than the reference. Asked for each page to be shown for confirmation before moving to the next. After the trademark/confidentiality tradeoff of this approach was flagged, confirmed the project was still headed for a public repo.

11. **Color correction.** Asked for the dashboard's headline numbers to be colored red to match the reference tool, then refined the request after the first pass landed on a shade that read as too brown rather than a true red.

12. **Feature parity fix.** Flagged that the red number styling had regressed to black in the browser, and requested a Visits/Happiness lens toggle on the Zone Analytics and Journeys pages to match the reference tool's pattern.

13. **Final QA and documentation.** Requested a final bug sweep across the whole app, and asked for the full prompt history from this conversation to be compiled for the project repository.

14. **Prompt log polish.** Requested this file's entries be rewritten for clarity and merged where naturally related, to present the prompting process cleanly.
