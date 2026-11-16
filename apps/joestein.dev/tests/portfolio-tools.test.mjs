import assert from "node:assert/strict";
import { test } from "node:test";
import { createPortfolioTools, receiptsInputSchema } from "../lib/portfolio-tools.ts";

const technology = {
  _id: "technology-1", name: "TypeScript", slug: "typescript",
  category: "Frontend & UI", iconKey: "typescript",
};
const achievement = {
  _key: "virtualization", bullet: "Raw resume bullet", deepDive: "Authoritative engineering details",
  tracks: ["Frontend Architecture"], includeInDefaultOverview: true,
  technologies: [technology],
};
const project = {
  _id: "project-1", title: "Booking platform", slug: "booking", subtitle: "Self-service booking",
  order: 0, problem: "Booking workflow", liveUrl: "https://example.com/booking",
  repoUrl: "https://example.com/source", techStack: [technology],
  architectureNotes: [{ _type: "block", _key: "notes", children: [{ _type: "span", _key: "note", text: "Project architecture", marks: [] }], style: "normal", markDefs: [] }],
};
function fixture() {
  return {
    about: { downloads: [{ _key: "resume", label: "Resume", url: "https://example.com/resume" }] },
    roles: [{
      _id: "role-1", title: "Senior Engineer", company: "Example Company", dateRange: "2021–2025",
      order: 0, roleSummary: "Role summary", technologies: [technology],
      achievements: [achievement, { ...achievement, _key: "delivery", includeInDefaultOverview: false }],
    }],
    projects: [project], technologies: [technology],
  };
}
const options = { toolCallId: "test", messages: [] };
const selection = (id, type = "achievement") => ({
  id, type, relevanceScore: 75, matchReason: "Relevant to responsive workflows.",
  tailoredNarrative: "Joe keeps large workflows responsive for users. He applies virtualization to reduce rendering work while preserving access to the full dataset.",
});

test("receipts hydrate only server metadata and retain the tailored narrative", async () => {
  const context = fixture();
  const before = JSON.stringify(context);
  const input = receiptsInputSchema.parse({ receipts: [
    { ...selection("virtualization"), company: "Invented company", deepDive: "Invented details", technologies: [] },
    { ...selection("project-1", "project"), liveUrl: "https://untrusted.example" },
  ] });
  const results = await createPortfolioTools(context).showReceipts.execute(input, options);
  assert.deepEqual(results.map((receipt) => receipt.type), ["achievement", "project"]);
  assert.equal(results[0].company, "Example Company");
  assert.equal(results[0].roleTitle, "Senior Engineer");
  assert.equal(results[0].dateRange, "2021–2025");
  assert.equal(results[0].deepDive, achievement.deepDive);
  assert.deepEqual(results[0].technologies, [technology]);
  assert.equal(results[0].tailoredNarrative, input.receipts[0].tailoredNarrative);
  assert.equal(results[0].relevanceScore, 75);
  assert.equal(results[0].matchReason, input.receipts[0].matchReason);
  assert.equal("bullet" in results[0], false);
  assert.equal(results[1].liveUrl, project.liveUrl);
  assert.equal(results[1].subtitle, project.subtitle);
  assert.deepEqual(results[1].architectureNotes, project.architectureNotes);
  assert.equal(JSON.stringify(context), before);
});

test("unknown IDs, wrong record types, and duplicate selections are discarded", async () => {
  const result = await createPortfolioTools(fixture()).showReceipts.execute({ receipts: [
    selection("missing"), selection("project-1"), selection("virtualization"), selection("virtualization"),
  ] }, options);
  assert.deepEqual(result.map((receipt) => receipt.id), ["virtualization"]);
});

test("achievement keys shared by multiple roles are rejected instead of misattributed", async () => {
  const context = fixture();
  context.roles.push({ ...context.roles[0], _id: "role-2", company: "Another Company" });
  const result = await createPortfolioTools(context).showReceipts.execute({ receipts: [selection("virtualization")] }, options);
  assert.deepEqual(result, []);
});

test("receipt input requires honest bounded scores, match reasons, and nonempty narratives", () => {
  for (const relevanceScore of [0, 101, NaN, Infinity]) {
    assert.equal(receiptsInputSchema.safeParse({ receipts: [{ ...selection("virtualization"), relevanceScore }] }).success, false);
  }
  for (const field of ["relevanceScore", "matchReason", "tailoredNarrative"]) {
    const receipt = selection("virtualization");
    delete receipt[field];
    assert.equal(receiptsInputSchema.safeParse({ receipts: [receipt] }).success, false);
  }
  assert.equal(receiptsInputSchema.safeParse({ receipts: [{ ...selection("virtualization"), tailoredNarrative: " " }] }).success, false);
  assert.equal(receiptsInputSchema.safeParse({ receipts: [{ ...selection("virtualization"), matchReason: " " }] }).success, false);
});

test("all matches survive hydration and are sorted by descending relevance without a four-item cap", async () => {
  const context = fixture();
  context.projects = Array.from({ length: 5 }, (_, index) => ({ ...project, _id: `project-${index}` }));
  const scores = [50, 90, 10, 100, 70];
  const input = receiptsInputSchema.parse({ receipts: [
    ...context.projects.map((item, index) => ({ ...selection(item._id, "project"), relevanceScore: scores[index] })),
    selection("virtualization"),
  ] });
  const results = await createPortfolioTools(context).showReceipts.execute(input, options);
  assert.equal(results.length, 6);
  assert.deepEqual(results.map((item) => item.relevanceScore), [100, 90, 75, 70, 50, 10]);
  assert.deepEqual(results.map((item) => item.id), ["project-3", "project-1", "virtualization", "project-4", "project-0", "project-2"]);
});

test("repeated IDs retain the highest-scoring narrative and reason", async () => {
  const result = await createPortfolioTools(fixture()).showReceipts.execute({ receipts: [
    { ...selection("virtualization"), relevanceScore: 25 },
    { ...selection("virtualization"), relevanceScore: 95, matchReason: "Direct evidence", tailoredNarrative: "Joe solved the matching performance problem. He used virtualization to limit rendering work." },
  ] }, options);
  assert.equal(result.length, 1);
  assert.equal(result[0].relevanceScore, 95);
  assert.equal(result[0].matchReason, "Direct evidence");
});

test("empty content is safe; explicit downloads and overview remain available", async () => {
  const emptyTools = createPortfolioTools({ about: null, roles: [], projects: [], technologies: [] });
  assert.deepEqual(await emptyTools.showReceipts.execute({ receipts: [selection("missing")] }, options), []);
  assert.deepEqual(await emptyTools.showDownloads.execute({}, options), []);
  const context = fixture();
  const tools = createPortfolioTools(context);
  assert.deepEqual(await tools.showDownloads.execute({}, options), context.about.downloads);
  const overview = await tools.showOverview.execute({}, options);
  assert.deepEqual(overview.roles[0].achievements.map((item) => item._key), ["virtualization"]);
  assert.equal(context.roles[0].achievements.length, 2);
});

test("projects and achievements share one ranking and retain their type even when IDs overlap", async () => {
  const context = fixture();
  context.projects = [{ ...project, _id: "virtualization" }];
  const result = await createPortfolioTools(context).showReceipts.execute({ receipts: [
    { ...selection("virtualization"), relevanceScore: 80 },
    { ...selection("virtualization", "project"), relevanceScore: 95 },
    { ...selection("delivery"), relevanceScore: 90 },
  ] }, options);
  assert.deepEqual(result.map(({ type, relevanceScore }) => ({ type, relevanceScore })), [
    { type: "project", relevanceScore: 95 },
    { type: "achievement", relevanceScore: 90 },
    { type: "achievement", relevanceScore: 80 },
  ]);
  assert.equal(result[0].liveUrl, project.liveUrl);
  assert.equal(result[0].repoUrl, project.repoUrl);
  assert.equal(result[2].roleId, context.roles[0]._id);
});
