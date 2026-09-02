import Cue, { ChapterContext } from "./Cue.jsx";
import { CHAPTERS } from "../lib/chapters.js";
import { tracks, projects, stats, club } from "../data/content.js";

const vhOf = (id) => CHAPTERS.find((c) => c.id === id).vh;

/**
 * A chapter is a length of scroll plus a pinned copy column.
 *
 * `mode` decides how the beats inside relate to one another:
 *   "stack" — they accumulate, one under the next (a track, a project)
 *   "slot"  — they replace one another on the same optical line
 *             (a sequence of single lines: "Build." "Break." "Learn.")
 *
 * `foot` renders against the viewport floor rather than in the column.
 */
function Chapter({ id, align = "center", mode = "stack", foot, children }) {
  return (
    <ChapterContext.Provider value={id}>
      <section className="ch" style={{ height: `${vhOf(id)}vh` }} data-chapter={id}>
        <div className={`ch-pin ch-${align}`}>
          <div className={`col col-${mode}`}>{children}</div>
          {foot}
        </div>
      </section>
    </ChapterContext.Provider>
  );
}

const project = (id) => projects.find((p) => p.id === id);

function ProjectCard({ id, index }) {
  const p = project(id);
  return (
    <>
      <Cue from={0.14} to={0.95}>
        <span className="mono">{index} · Project</span>
      </Cue>
      <Cue from={0.2} to={0.95}>
        <h2 className="t-xl">{p.title}</h2>
      </Cue>
      <Cue from={0.3} to={0.92}>
        <p className="body">{p.desc}</p>
      </Cue>
      <Cue from={0.4} to={0.9}>
        <ul className="tagrow">
          {p.tags.map((t) => (
            <li key={t} className="mono tag">
              {t}
            </li>
          ))}
        </ul>
      </Cue>
    </>
  );
}

export default function Story({ revealed }) {
  return (
    <div className="story" data-revealed={revealed}>
      {/* ── 01 It starts with curiosity ───────────────────────── */}
      <Chapter
        id="hero"
        align="center"
        mode="slot"
        foot={
          <Cue initial to={0.55} fade={0.12} className="scroll-hint">
            <span className="mono">Scroll</span>
            <span className="hint-line" />
          </Cue>
        }
      >
        <Cue initial to={0.85} fade={0.1} className="stack center">
          <span className="mono brandline">{club.short}</span>
          <h1 className="t-hero">We build things.</h1>
        </Cue>
      </Chapter>

      {/* ── 02 Idea ───────────────────────────────────────────── */}
      <Chapter id="idea" align="left" mode="slot">
        <Cue from={0.02} to={0.46}>
          <h2 className="t-xl">It starts with a question.</h2>
        </Cue>
        <Cue from={0.5} to={0.99}>
          <h2 className="t-xl">
            What if we built it <em>ourselves?</em>
          </h2>
        </Cue>
      </Chapter>

      {/* ── 03 Learn ──────────────────────────────────────────── */}
      <Chapter id="learn" align="center">
        <Cue from={0.05} to={0.95} className="stack center">
          <span className="mono">Learn</span>
          <h2 className="t-lg">Four ways in.</h2>
          <p className="body center-body">
            Members pick the track — or tracks — that match their interests and
            skill level. Every one of them starts from zero.
          </p>
        </Cue>
      </Chapter>

      {/* ── 04–07 The four tracks ─────────────────────────────── */}
      {tracks.map((tr) => (
        <Chapter key={tr.id} id={tr.id} align="left">
          <Cue from={0.12} to={0.95}>
            <span className="mono" style={{ color: tr.color }}>
              Track {tr.index}
            </span>
          </Cue>
          <Cue from={0.18} to={0.95}>
            <h2 className="t-xl">{tr.name}</h2>
          </Cue>
          <Cue from={0.28} to={0.92}>
            <p className="body">{tr.summary}</p>
          </Cue>
          <Cue from={0.38} to={0.9}>
            <ul className="tagrow">
              {tr.keywords.map((k) => (
                <li key={k} className="mono tag">
                  {k}
                </li>
              ))}
            </ul>
          </Cue>
        </Chapter>
      ))}

      {/* ── 08 Build ──────────────────────────────────────────── */}
      <Chapter id="build" align="center" mode="slot">
        <Cue from={0.0} to={0.5} className="stack center">
          <h2 className="t-xl muted">We don't just learn.</h2>
        </Cue>
        <Cue from={0.52} to={1} className="stack center">
          <h2 className="t-hero">We build.</h2>
        </Cue>
      </Chapter>

      {/* ── 09–11 Three projects ──────────────────────────────── */}
      <Chapter id="robot" align="left">
        <ProjectCard id="line-robot" index="01" />
      </Chapter>
      <Chapter id="weather" align="right">
        <ProjectCard id="weather" index="02" />
      </Chapter>
      <Chapter id="algo" align="left">
        <ProjectCard id="algo-viz" index="03" />
      </Chapter>

      {/* ── 12 Ecosystem ──────────────────────────────────────── */}
      <Chapter id="ecosystem" align="center" mode="slot">
        <Cue from={0.02} to={0.34} className="stack center">
          <p className="body center-body">And they kept going.</p>
        </Cue>
        <Cue from={0.62} to={1} fade={0.1} className="stack center">
          <span className="t-figure">15+</span>
          <span className="mono figure-label">Projects built</span>
        </Cue>
      </Chapter>

      {/* ── 13 Experiment ─────────────────────────────────────── */}
      <Chapter id="experiment" align="center" mode="slot">
        <Cue from={0.02} to={0.28} className="stack center">
          <h2 className="t-xl">Build.</h2>
        </Cue>
        <Cue from={0.28} to={0.5} className="stack center">
          <h2 className="t-xl">Break.</h2>
        </Cue>
        <Cue from={0.5} to={0.72} className="stack center">
          <h2 className="t-xl">Learn.</h2>
        </Cue>
        <Cue from={0.72} to={1} className="stack center">
          <h2 className="t-xl">Build again.</h2>
        </Cue>
      </Chapter>

      {/* ── 14 Community ──────────────────────────────────────── */}
      <Chapter id="community" align="center" mode="slot">
        <Cue from={0.04} to={0.5} className="stack center">
          <h2 className="t-lg">None of it happens alone.</h2>
        </Cue>
        <Cue from={0.5} to={1} className="stack center">
          <ul className="statrow">
            {stats
              .filter((s) => s.label !== "Projects built")
              .map((s) => (
                <li key={s.label}>
                  <span className="t-stat">{s.num}</span>
                  <span className="mono">{s.label}</span>
                </li>
              ))}
          </ul>
        </Cue>
      </Chapter>

      {/* ── 15 Join ───────────────────────────────────────────── */}
      <Chapter id="join" align="center">
        <Cue from={0.05} to={1} fade={0.1} className="stack center">
          <span className="mono">Get involved</span>
          <h2 className="t-hero">Come build something.</h2>
          <p className="body center-body">
            Whether you're brand new to coding or already shipping side projects,
            there's a place for you in {club.short}.
          </p>
          <div className="cta-row">
            <a className="btn btn-solid" href="/join.html">
              Join the club
            </a>
            <a className="btn btn-line" href="/projects.html">
              See all projects
            </a>
          </div>
          <p className="mono footnote">
            © {club.year} {club.name} · {club.email}
          </p>
        </Cue>
      </Chapter>
    </div>
  );
}
