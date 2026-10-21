// Deterministic study planner. The agent decides WHEN to plan and with what
// settings; this code does the actual scheduling so the math is never guessed.

const DEFAULT_HOURS = { exam: 6, project: 8, assignment: 3, quiz: 2, reading: 1, other: 2 };
const MAX_DAYS = 60;
const MAX_HOURS_PER_ITEM_PER_DAY = 2;

export function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function weekday(iso) {
  return new Date(iso + 'T12:00:00Z').getUTCDay(); // 0 = Sunday
}

// Quiz scores under 70% boost that deadline's study time (up to +50%).
export function weakBoosts(quizHistory = []) {
  const boosts = {};
  for (const q of quizHistory) {
    if (!q.deadlineId || !q.total) continue;
    const pct = q.score / q.total;
    if (pct < 0.7) boosts[q.deadlineId] = Math.max(boosts[q.deadlineId] || 1, 1 + (0.7 - pct) * (5 / 7));
  }
  return boosts;
}

export function buildPlan(deadlines, opts) {
  const { today, hoursPerDay = 3, skipWeekdays = [], boosts = {} } = opts;
  const start = opts.startDate && opts.startDate > today ? opts.startDate : today;
  const warnings = [];

  const items = deadlines
    .filter((d) => !d.done && d.due && d.due > start)
    .map((d) => {
      const base = Number(d.estHours) > 0 ? Number(d.estHours) : DEFAULT_HOURS[d.type] ?? DEFAULT_HOURS.other;
      const need = Math.round(base * (boosts[d.id] || 1) * 2) / 2;
      return { ...d, need, left: need };
    });

  const skipped = deadlines.filter((d) => !d.done && d.due === start);
  for (const d of skipped) warnings.push(`"${d.title}" (${d.course}) is due ${d.due}, too soon to schedule.`);

  const blocks = [];
  const lastDue = items.reduce((m, d) => (d.due > m ? d.due : m), start);
  for (let i = 0; i < MAX_DAYS; i++) {
    const day = addDays(start, i);
    if (day >= lastDue) break;
    if (skipWeekdays.includes(weekday(day))) continue;

    let capacity = hoursPerDay;
    const daysLeft = (d) => Math.max(1, (new Date(d.due) - new Date(day)) / 86400000);
    // Most urgent first: hours still needed divided by days remaining.
    const open = items.filter((d) => d.left > 0 && d.due > day).sort((a, b) => b.left / daysLeft(b) - a.left / daysLeft(a));

    for (const d of open) {
      if (capacity <= 0) break;
      const hours = Math.min(d.left, capacity, MAX_HOURS_PER_ITEM_PER_DAY);
      blocks.push({ date: day, deadlineId: d.id, course: d.course, title: d.title, type: d.type, hours, boosted: !!boosts[d.id] });
      d.left -= hours;
      capacity -= hours;
    }
  }

  for (const d of items) {
    if (d.left > 0) warnings.push(`Could not fit ${d.left}h for "${d.title}" before ${d.due}. Add hours per day or start earlier.`);
  }

  // Two exams on the same day is worth flagging to the student.
  const examDays = {};
  for (const d of items.filter((x) => x.type === 'exam')) (examDays[d.due] ||= []).push(d.title);
  for (const [day, list] of Object.entries(examDays)) if (list.length > 1) warnings.push(`Exam conflict on ${day}: ${list.join(' and ')}.`);

  const totalHours = blocks.reduce((s, b) => s + b.hours, 0);
  return { start, hoursPerDay, skipWeekdays, blocks, warnings, totalHours };
}
