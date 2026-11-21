import { useState } from "react";
import {
  ArrowRight,
  Database,
  Fingerprint,
  Network,
  Workflow,
} from "lucide-react";
import type { PrivacyRisk, ProcessingActivity } from "./model";

const lanes = [
  { key: "collection", label: "Collection", kind: "Source", Icon: Fingerprint },
  { key: "sharing", label: "Transfer", kind: "Data exchange", Icon: Network },
  {
    key: "use",
    label: "Processing",
    kind: "Processing service",
    Icon: Workflow,
  },
  { key: "retention", label: "Retention", kind: "Data store", Icon: Database },
] as const;
type Lane = (typeof lanes)[number]["key"];

export default function PrivacyMap({
  activities,
  risks,
  onEdit,
}: {
  activities: ProcessingActivity[];
  risks: PrivacyRisk[];
  onEdit: (activity: ProcessingActivity) => void;
}) {
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<{
    activity: string;
    lane: Lane;
    connection?: boolean;
  } | null>(null);
  const classes = [
    ...new Set(
      activities.flatMap((activity) =>
        activity.categories
          .split(/[,;\n]+/)
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ),
  ].sort();
  const visible = activities.filter(
    (activity) =>
      (!category ||
        activity.categories
          .split(/[,;\n]+/)
          .some((value) => category === value.trim())) &&
      (!from || (activity.recordedOn && activity.recordedOn >= from)) &&
      (!to || (activity.recordedOn && activity.recordedOn <= to)),
  );
  const focus = visible.find((activity) => activity.id === selected?.activity);
  const currentLane = lanes.find((lane) => lane.key === selected?.lane);
  const related = risks.filter((risk) => risk.activityId === focus?.id);
  return (
    <section className="xa-privacy-map" aria-labelledby="privacy-map-title">
      <header>
        <div>
          <h2 id="privacy-map-title">Data flow map</h2>
          <p>Trace recorded processing from collection to retention.</p>
        </div>
        <div className="xa-privacy-filters">
          <label>
            Data class
            <select
              aria-label="Data class"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">All classes</option>
              {classes.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Recorded from
            <input
              type="date"
              aria-label="Recorded from"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>
          <label>
            Recorded through
            <input
              type="date"
              aria-label="Recorded through"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
        </div>
      </header>
      <div className="xa-privacy-map-body">
        <div
          className="xa-privacy-map-scroll"
          tabIndex={0}
          role="region"
          aria-label="Privacy data flow lanes"
        >
          <div className="xa-privacy-canvas">
            <div className="xa-privacy-lanes">
              {lanes.map(({ key, label, Icon }) => (
                <div key={key}>
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </div>
              ))}
            </div>
            {visible.map((activity, rowIndex) => (
              <div className="xa-privacy-map-row" key={activity.id}>
                <p>{activity.name}</p>
                <div className="xa-privacy-lanes">
                  <svg
                    className="xa-privacy-edges"
                    viewBox="0 0 400 98"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {lanes.slice(0, -1).map((lane, index) => {
                      const y0 = 27 + ((index + rowIndex * 2) % 4) * 10;
                      const y1 = 27 + ((index + 1 + rowIndex * 2) % 4) * 10;
                      const x0 = index * 100 + 75;
                      return (
                        <path
                          key={lane.key}
                          d={`M${x0} ${y0} C${x0 + 22} ${y0}, ${x0 + 26} ${y1}, ${x0 + 50} ${y1}`}
                          fill="none"
                          stroke="#7da2c7"
                          strokeWidth="1.5"
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    })}
                  </svg>
                  {lanes.map(({ key, label, kind, Icon }, index) => {
                    const text =
                      key === "retention"
                        ? `${activity.retentionDays} days`
                        : activity[key] || "Pending activity detail";
                    return (
                      <div
                        className="xa-privacy-lane-node"
                        key={key}
                        data-lane={key}
                        style={
                          {
                            "--flow-offset": `${((index + rowIndex * 2) % 4) * 10}px`,
                          } as React.CSSProperties
                        }
                      >
                        <button
                          type="button"
                          className="xa-privacy-node"
                          aria-pressed={
                            selected?.activity === activity.id &&
                            selected.lane === key &&
                            !selected.connection
                          }
                          aria-label={`${activity.name}: ${label}, ${text}`}
                          onClick={() =>
                            setSelected({ activity: activity.id, lane: key })
                          }
                        >
                          <span>
                            <Icon size={13} aria-hidden="true" />
                            {kind}
                          </span>
                          <strong>{text}</strong>
                        </button>
                        {index < lanes.length - 1 && (
                          <button
                            type="button"
                            className="xa-privacy-connection"
                            aria-label={`${activity.name}: connection from ${label} to ${lanes[index + 1].label}`}
                            aria-pressed={
                              selected?.activity === activity.id &&
                              selected.lane === key &&
                              !!selected.connection
                            }
                            onClick={() =>
                              setSelected({
                                activity: activity.id,
                                lane: key,
                                connection: true,
                              })
                            }
                          >
                            <ArrowRight size={14} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {!visible.length && (
              <p className="xa-chart-empty">
                {activities.length
                  ? "No activities match these filters."
                  : "Record a processing activity or load a completed demo to explore the map."}
              </p>
            )}
          </div>
        </div>
        {focus && currentLane && (
          <aside
            className="xa-privacy-detail"
            aria-label="Selected data flow details"
          >
            <h3>{focus.name}</h3>
            <p>
              {currentLane.label}
              {selected?.connection
                ? ` → ${lanes[lanes.indexOf(currentLane) + 1].label}`
                : ""}
            </p>
            <dl>
              <dt>Purpose</dt>
              <dd>{focus.purpose}</dd>
              <dt>Data subjects</dt>
              <dd>{focus.dataSubjects}</dd>
              <dt>Data class</dt>
              <dd>{focus.categories}</dd>
              <dt>Responsible parties</dt>
              <dd>
                {focus.controller}
                {focus.processor && ` · ${focus.processor}`}
              </dd>
              <dt>Retention and deletion</dt>
              <dd>
                {focus.retentionDays} days ·{" "}
                {focus.deletion || "Deletion method pending"}
              </dd>
            </dl>
            <h4>Linked privacy findings</h4>
            {related.length ? (
              <ul>
                {related.map((risk) => (
                  <li key={risk.id}>
                    {risk.harm} ·{" "}
                    {risk.residualLikelihood * risk.residualImpact} residual
                  </li>
                ))}
              </ul>
            ) : (
              <p>No linked findings recorded.</p>
            )}
            <button type="button" onClick={() => onEdit(focus)}>
              Edit activity
            </button>
          </aside>
        )}
      </div>
      {visible.length > 0 && (
        <details className="xa-privacy-list">
          <summary>Activity list · {visible.length}</summary>
          <ul>
            {visible.map((activity) => (
              <li key={activity.id}>
                <button
                  type="button"
                  onClick={() =>
                    setSelected({ activity: activity.id, lane: "collection" })
                  }
                >
                  {activity.name}
                </button>
                <span>{activity.categories}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
