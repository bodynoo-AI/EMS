import React from "react";
import "./dashboard.css";

export default function Dashboard() {
  return (
    <div className="page">
      <div className="ph">
        <div className="ph-l">
          <div className="bc">
            EMS Pro <span>›</span>
            <span className="cur">Dashboard</span>
          </div>

          <div className="ptitle">Overview</div>

          <div className="psub">
            Tuesday, June 9, 2026 · Good morning, Admin
          </div>
        </div>

        <div className="ph-r">
          <button className="btn">
            Export
          </button>

          <button className="btn btn-p">
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="sg">
        <div className="sc">
          <div
            className="si"
            style={{
              background: "var(--blue2)",
              color: "var(--blue)"
            }}
          >
            👥
          </div>

          <div className="slabel">
            Total Employees
          </div>

          <div className="sval">
            247
          </div>

          <div className="ssub tu">
            +12 this month
          </div>
        </div>

        <div className="sc">
          <div
            className="si"
            style={{
              background: "var(--green2)",
              color: "var(--green)"
            }}
          >
            ✅
          </div>

          <div className="slabel">
            Active Today
          </div>

          <div className="sval">
            198
          </div>

          <div className="ssub">
            80.2% attendance rate
          </div>
        </div>

        <div className="sc">
          <div
            className="si"
            style={{
              background: "var(--amber2)",
              color: "var(--amber)"
            }}
          >
            📅
          </div>

          <div className="slabel">
            On Leave
          </div>

          <div className="sval">
            24
          </div>

          <div className="ssub">
            8 pending approval
          </div>
        </div>

        <div className="sc">
          <div
            className="si"
            style={{
              background: "var(--coral2)",
              color: "var(--coral)"
            }}
          >
            💻
          </div>

          <div className="slabel">
            Assets Assigned
          </div>

          <div className="sval">
            312
          </div>

          <div className="ssub">
            18 pending return
          </div>
        </div>
      </div>

      {/* Department Headcount */}
      <div className="dg2">
        <div className="card">
          <div className="ct">
            Department headcount
          </div>

          {[
            ["Engineering", 82],
            ["Sales", 55],
            ["HR", 30],
            ["Finance", 26],
            ["Marketing", 22],
            ["Operations", 20]
          ].map(([dept, width]) => (
            <div className="dbr" key={dept}>
              <div className="dbl">{dept}</div>

              <div className="dbb">
                <div
                  className="dbf"
                  style={{
                    width: `${width}%`,
                    background: "#185FA5"
                  }}
                />
              </div>

              <div className="dbc">
                {width}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="ct">
            Recent Activity
          </div>

          {[
            "Priya Sharma's leave approved by HR",
            "New employee Rahul Mehta onboarded",
            "Laptop LP-2041 assigned",
            "Leave request rejected",
            "Vikas promoted to Senior Developer"
          ].map((item, index) => (
            <div
              className="ai"
              key={index}
            >
              <div className="adot" />
              <div>
                <div className="at2">
                  {item}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="dg3">
        <div className="card">
          <div className="ct">
            Monthly Headcount Growth
          </div>

          <div className="mchart">
            {[52,55,58,56,65,70,72,76,80,85,91,100].map(
              (h, i) => (
                <div
                  key={i}
                  className="mb"
                  style={{
                    height: `${h}%`,
                    background:
                      i === 11
                        ? "#185FA5"
                        : "#B5D4F4"
                  }}
                />
              )
            )}
          </div>
        </div>

        <div className="card">
          <div className="ct">
            Leave This Week
          </div>

          <div
            style={{
              fontSize: "34px",
              fontWeight: "800"
            }}
          >
            24
          </div>

          <div className="ssub">
            employees on approved leave
          </div>
        </div>
      </div>
    </div>
  );
}