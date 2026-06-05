import React from "react";
import { FiDollarSign, FiCreditCard, FiDownload } from "react-icons/fi";
import { WelcomeBanner, StatCards, Panel, PanelHeader, PrimaryButton, SecondaryButton } from "../DashboardUI";
import { pageWrapClass } from "../dashboardTheme";

const TRANSACTIONS = [
  { item: "PG Fee UPI - STU-001", time: "22 May 2026", amt: "+₹14,500", positive: true },
  { item: "AWS Object Store Storage", time: "18 May 2026", amt: "-₹8,490", positive: false },
  { item: "PG Fee Bank - STU-024", time: "15 May 2026", amt: "+₹24,000", positive: true },
  { item: "Redis Cluster Cache API", time: "12 May 2026", amt: "-₹2,300", positive: false },
  { item: "PG Fee UPI - STU-112", time: "09 May 2026", amt: "+₹14,500", positive: true },
];

export const BillingLedger = () => {
  return (
    <div className={pageWrapClass}>
      <WelcomeBanner
        badge="Billing Ledger"
        title="Payments & revenue"
        description="Track fee collections, refunds, and platform expenses in one financial view."
        actions={
          <>
            <PrimaryButton>
              <span className="inline-flex items-center gap-1.5">
                <FiDownload className="w-3.5 h-3.5" /> Statements
              </span>
            </PrimaryButton>
            <SecondaryButton>Reconcile</SecondaryButton>
          </>
        }
      />

      <StatCards
        stats={[
          { label: "Revenue (MTD)", value: "₹4.82L", change: "+8.3% MoM", icon: <FiDollarSign className="w-5 h-5" /> },
          { label: "Collected Today", value: "₹42,100", change: "18 transactions", icon: <FiCreditCard className="w-5 h-5" /> },
          { label: "Pending Fees", value: "₹1.24L", change: "86 students", icon: <FiDollarSign className="w-5 h-5" /> },
          { label: "Refunds", value: "₹12,400", change: "3 this month", icon: <FiDollarSign className="w-5 h-5" /> },
        ]}
      />

      <Panel>
        <PanelHeader eyebrow="Ledger" title="Recent transactions" />
        <div className="space-y-3">
          {TRANSACTIONS.map((tx, i) => (
            <div
              key={i}
              className="flex justify-between items-center text-xs p-3 rounded-2xl bg-[#fafafa]/80 border border-black/[0.04] hover:bg-[#fafafa] transition-all"
            >
              <div>
                <h4 className="font-extrabold text-[#0c0407]">{tx.item}</h4>
                <span className="text-[9px] text-[#9ca3af] font-bold block mt-0.5">{tx.time}</span>
              </div>
              <span
                className={`font-extrabold text-sm ${
                  tx.positive ? "text-[#05CD99]" : "text-[#0c0407]"
                }`}
              >
                {tx.amt}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

export default BillingLedger;
