import { Panel, PanelHeader, StatusBadge } from "../DashboardUI";

/**
 * Students tab — enrolled student roster for a batch.
 */
export function BatchStudents({ students = [] }) {
  return (
    <Panel>
      <PanelHeader eyebrow="Roster" title={`Enrolled (${students.length})`} />
      {!students.length ? (
        <p className="text-xs text-[#94a3b8] text-center py-10 bg-[#fafafa] rounded-xl border border-dashed border-black/[0.07]">
          No students enrolled.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-black/[0.07] text-[#94a3b8] uppercase tracking-wider">
                <th className="pb-3 px-2 font-bold text-left">#</th>
                <th className="pb-3 px-2 font-bold text-left">Student</th>
                <th className="pb-3 px-2 font-bold text-left">Email</th>
                <th className="pb-3 px-2 font-bold text-left">Enrolment Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i} className="border-b border-black/[0.04] hover:bg-[#fafafa]">
                  <td className="py-3 px-2 text-[#94a3b8] font-bold">{i + 1}</td>
                  <td className="py-3 px-2 font-extrabold text-[#0c0407]">{s.student?.name || "—"}</td>
                  <td className="py-3 px-2 text-[#636363]">{s.student?.email || "—"}</td>
                  <td className="py-3 px-2">
                    <StatusBadge variant={s.enrollment_status === "ACTIVE" ? "ok" : "info"}>
                      {s.enrollment_status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

export default BatchStudents;
