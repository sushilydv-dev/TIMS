import React, { useEffect, useState, useCallback } from "react";
import { FiDollarSign, FiCalendar, FiCreditCard, FiCheckCircle, FiAlertCircle, FiPercent, FiDownload } from "react-icons/fi";
import axios from "axios";
import { Toast } from "../DashboardUI";
import { cardClass, labelMutedClass, trendUpClass, trendDownClass } from "../dashboardTheme";
import { generatePaymentReceipt } from "../../../utils/generatePaymentReceipt";

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function formatInr(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

export function MyFeesDesk({ onPaymentSuccess }) {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [payingId, setPayingId] = useState(null);

  const fetchStudentData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/api/students/me/fees");
      setStudent(data);
    } catch (err) {
      setStudent(null);
      setError(err.response?.data?.message || "Failed to load your fee information. Please refresh or contact support.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const showToast = (msg) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(""), 5000);
  };

  const handlePayInstallment = async (installment) => {
    setPayingId(installment.id);
    try {
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) {
        showToast("Razorpay SDK failed to load. Please check your connection.");
        setPayingId(null);
        return;
      }

      const orderRes = await axios.post("/api/v1/payments/razorpay-order", {
        installment_id: installment.id,
      });

      const { razorpay_order_id, amount, currency, key_id } = orderRes.data;

      const options = {
        key: key_id,
        amount: amount * 100,
        currency: currency,
        name: "TIMS Academy",
        description: `Fee Payment - ${installment.installment_label}`,
        order_id: razorpay_order_id,
        handler: async (response) => {
          showToast("Payment captured by Razorpay. Synchronizing states...");
          try {
            await axios.post("/api/v1/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            showToast("Payment verified and ledger updated successfully!");
            await fetchStudentData();
            if (onPaymentSuccess) {
              onPaymentSuccess();
            }
          } catch (err) {
            console.error("Payment verification failed", err);
            showToast(err.response?.data?.message || "Payment verification failed. Please contact support.");
          } finally {
            setPayingId(null);
          }
        },
        prefill: {
          name: student?.User?.name || "",
          email: student?.User?.email || "",
          contact: student?.phone || "",
        },
        theme: {
          color: "#fc362d",
        },
        modal: {
          ondismiss: () => {
            setPayingId(null);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      showToast(err.response?.data?.message || "Payment request initialization failed");
      setPayingId(null);
    }
  };

  const handleDownloadReceipt = async (payment) => {
    try {
      // Build student + course info from what we have in state
      const enrollment = student?.Enrollments?.[0] || null;
      const batch  = enrollment?.Batch  || null;
      const course = batch?.Course      || null;
      await generatePaymentReceipt({
        studentName:   student?.User?.name   || "—",
        studentCode:   student?.student_code || "—",
        studentEmail:  student?.User?.email  || "—",
        courseName:    course?.title          || "—",
        batchName:     batch?.batch_name      || "—",
        amount:        payment.amount,
        paymentDate:   payment.payment_date,
        paymentMethod: payment.payment_methhod || "—",
        transactionId: payment.transaction_id  || "—",
        status:        payment.status || "SUCCESS",
      });
    } catch (err) {
      showToast("Receipt generation failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm font-semibold text-[#94a3b8]">
        Loading fee ledger profile...
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-5 border border-[#b91c1c]/10 bg-[#fef2f2] rounded-2xl flex items-center gap-3 text-xs text-[#b91c1c] font-semibold">
        <FiAlertCircle className="w-5 h-5 shrink-0" />
        <span>{error || "Fee ledger could not be loaded."}</span>
      </div>
    );
  }

  const primaryFee = student.Fees?.[0] || null;
  const installments = [...(primaryFee?.installments || [])].sort((a, b) => {
    if (a.sequence_number !== undefined && b.sequence_number !== undefined) {
      return a.sequence_number - b.sequence_number;
    }
    return new Date(a.due_date) - new Date(b.due_date);
  });
  const payments = primaryFee?.payments || [];

  const totalFee = Number(primaryFee?.total_amount || 0);
  const baseFee = Number(primaryFee?.base_amount ?? totalFee);
  const discountAmount = Number(primaryFee?.discount_amount || 0);
  const totalPaid = Number(primaryFee?.paid_ammount || primaryFee?.paid_amount || 0);
  const totalDue = Number(primaryFee?.due_amount || 0);
  const paymentScheme = primaryFee?.payment_scheme_mode || (installments.length === 1 ? "FULL" : "INSTALLMENT");
  const isFullPaymentPlan = paymentScheme === "FULL";

  const status = primaryFee?.payment_status || "PENDING_FIRST_PAYMENT";
  const isPendingFirst = status === "PENDING_FIRST_PAYMENT" || status === "NONE";

  const unpaid = installments.filter((i) => i.status !== "PAID");
  const nextInstallment = unpaid.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
  const nextDueDate = nextInstallment ? nextInstallment.due_date : "—";

  const pendingPaymentLabel = isFullPaymentPlan ? "Pending Full Payment" : "Pending First Installment Payment";
  const pendingPaymentDescription = isFullPaymentPlan
    ? "Your dashboard resources are locked. Complete the full course fee payment to unlock access."
    : "Your dashboard resources are locked. Clear your first installment payment to unlock access.";

  return (
    <div className="space-y-6">
      <Toast message={toastMsg} />

      <div className={`relative overflow-hidden ${cardClass} p-5 sm:p-6 transition-all`}>
        <div
          className={`absolute inset-0 opacity-15 backdrop-blur-2xl transition-all ${
            isPendingFirst ? "bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" : "bg-gradient-to-r from-emerald-600 to-teal-500"
          }`}
        />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span
              className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest rounded-lg border ${
                isPendingFirst ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              }`}
            >
              Enrollment Access State
            </span>
            <h2 className="text-lg font-bold text-[#0c0407] mt-3 tracking-tight">
              {isPendingFirst ? pendingPaymentLabel : "Active Cohort Registration"}
            </h2>
            <p className="text-[#636363] text-xs mt-1 font-medium max-w-xl">
              {isPendingFirst
                ? pendingPaymentDescription
                : "Your student credentials are fully active. Explore courses, review cohorts, and download billing receipts below."}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`inline-block px-4 py-2 font-extrabold text-xs rounded-xl shadow-sm border ${
                isPendingFirst ? "bg-rose-500 text-white border-transparent" : "bg-white text-[#059669] border-black/[0.08]"
              }`}
            >
              {isPendingFirst ? "Awaiting Payment" : "Status: Active"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`flex items-center gap-4 ${cardClass} p-5 hover:shadow-md transition-all duration-200`}>
          <div className="w-12 h-12 rounded-2xl bg-[#fafafa] border border-black/[0.04] flex items-center justify-center shrink-0 text-[#475569]">
            <FiCreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className={labelMutedClass}>Contracted Fee</p>
            <h3 className="text-lg sm:text-xl font-bold text-[#0c0407] tracking-tight mt-1">{formatInr(totalFee)}</h3>
            {discountAmount > 0 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg mt-1 inline-block bg-emerald-50 text-emerald-600">
                {formatInr(baseFee)} − {formatInr(discountAmount)} discount
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg mt-1 inline-block bg-slate-100 text-[#475569]">
                {isFullPaymentPlan ? "Full payment plan" : "Installment plan"}
              </span>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-4 ${cardClass} p-5 hover:shadow-md transition-all duration-200`}>
          <div className="w-12 h-12 rounded-2xl bg-[#fafafa] border border-black/[0.04] flex items-center justify-center shrink-0 text-emerald-600">
            <FiCheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className={labelMutedClass}>Cleared Balance</p>
            <h3 className="text-lg sm:text-xl font-bold text-[#0c0407] tracking-tight mt-1">{formatInr(totalPaid)}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg mt-1 inline-block ${trendUpClass}`}>
              {totalFee > 0 ? Math.round((totalPaid / totalFee) * 100) : 0}% Settled
            </span>
          </div>
        </div>

        <div className={`flex items-center gap-4 ${cardClass} p-5 hover:shadow-md transition-all duration-200`}>
          <div className="w-12 h-12 rounded-2xl bg-[#fafafa] border border-black/[0.04] flex items-center justify-center shrink-0 text-amber-600">
            <FiDollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className={labelMutedClass}>Outstanding Dues</p>
            <h3 className="text-lg sm:text-xl font-bold text-[#0c0407] tracking-tight mt-1">{formatInr(totalDue)}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg mt-1 inline-block ${trendDownClass}`}>
              Remaining Dues
            </span>
          </div>
        </div>

        <div className={`flex items-center gap-4 ${cardClass} p-5 hover:shadow-md transition-all duration-200`}>
          <div className="w-12 h-12 rounded-2xl bg-[#fafafa] border border-black/[0.04] flex items-center justify-center shrink-0 text-sky-600">
            {discountAmount > 0 ? <FiPercent className="w-5 h-5" /> : <FiCalendar className="w-5 h-5" />}
          </div>
          <div>
            <p className={labelMutedClass}>{discountAmount > 0 ? "Discount Applied" : "Next Schedule Date"}</p>
            <h3 className="text-base sm:text-lg font-bold text-[#0c0407] tracking-tight mt-1 truncate max-w-[150px]">
              {discountAmount > 0 ? formatInr(discountAmount) : nextDueDate}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg mt-1 inline-block bg-sky-50 text-sky-600">
              {discountAmount > 0 ? "Enrollment discount" : "Calendar Due"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            <h3 className="text-base font-extrabold text-[#0c0407] border-b border-black/[0.06] pb-4 mb-4">
              {isFullPaymentPlan ? "Full Payment Due" : "Active Installment Roster & Payment Map"}
            </h3>

            <div className="space-y-3">
              {installments.length === 0 ? (
                <p className="text-xs text-gray-400 font-semibold py-8 text-center bg-slate-50 rounded-xl border border-dashed border-black/[0.08]">
                  No payment schedule found for your enrollment.
                </p>
              ) : (
                installments.map((inst, index) => {
                  const isPaid = inst.status === "PAID";
                  const isOverdue =
                    inst.status === "OVERDUE" || (inst.status !== "PAID" && new Date(inst.due_date) < new Date());
                  const isCurrentUnpaid = !isPaid && (index === 0 || installments[index - 1]?.status === "PAID");
                  const payLabel = isFullPaymentPlan ? "Pay Full Amount Now" : "Pay Installment Now";

                  return (
                    <div
                      key={inst.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all ${
                        isPaid
                          ? "bg-slate-50/50 border-black/[0.04] opacity-80"
                          : isCurrentUnpaid
                          ? "bg-gradient-to-r from-rose-500/[0.02] to-amber-500/[0.02] border-rose-500/20 shadow-sm"
                          : "bg-white border-black/[0.06]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isPaid
                              ? "bg-emerald-500/10 text-emerald-500"
                              : isOverdue
                              ? "bg-red-500/10 text-red-500"
                              : "bg-slate-100 text-[#475569]"
                          }`}
                        >
                          {isPaid ? <FiCheckCircle /> : <span>{index + 1}</span>}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#0c0407]">{inst.installment_label}</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Due Date: {inst.due_date}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-black/[0.05]">
                        <div className="text-left sm:text-right">
                          <p className="text-xs font-extrabold text-[#0c0407]">{formatInr(inst.amount_due)}</p>
                          <p className="text-[9px] text-[#9ca3af] font-semibold mt-0.5">
                            {isPaid ? "Settled" : "Outstanding"}
                          </p>
                        </div>

                        {isPaid ? (
                          <button
                            type="button"
                            onClick={async () => {
                              const match = payments.find((p) => p.installment_id === inst.id);
                              if (match) await handleDownloadReceipt(match);
                              else showToast("Receipt metadata syncing. Check transaction logs.");
                            }}
                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/10 text-[10px] font-extrabold text-[#059669] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <FiDownload className="w-3 h-3" /> Receipt
                          </button>
                        ) : isCurrentUnpaid ? (
                          <button
                            type="button"
                            onClick={() => handlePayInstallment(inst)}
                            disabled={payingId !== null}
                            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-extrabold rounded-lg shadow-md shadow-rose-500/15 cursor-pointer animate-[pulse_2s_infinite] disabled:opacity-50"
                          >
                            {payingId === inst.id ? "Processing..." : payLabel}
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 bg-slate-100 text-[10px] font-extrabold text-slate-400 rounded-lg select-none border border-black/5">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            <h3 className="text-base font-extrabold text-[#0c0407] mb-4">Receipt Logs</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {payments.length === 0 ? (
                <p className="text-xs text-gray-400 font-semibold py-8 text-center bg-slate-50 rounded-xl border border-dashed border-black/[0.08]">
                  No transaction settlements logged yet.
                </p>
              ) : (
                payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-gray-100 transition-all"
                  >
                    <div>
                      <h4 className="font-extrabold text-[#0c0407]">
                        Settle: {formatInr(p.amount)}
                      </h4>
                      <span className="text-[9px] text-[#9ca3af] font-bold block mt-0.5">
                        {p.payment_date} • {p.payment_methhod}
                      </span>
                      {p.transaction_id && (
                        <span className="text-[9px] text-[#9ca3af] font-mono block">{p.transaction_id}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                        SUCCESS
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownloadReceipt(p)}
                        className="flex items-center gap-1 text-[9px] font-bold text-[#475569] hover:text-[#fc362d] cursor-pointer px-2 py-1 rounded-lg border border-gray-200 hover:border-[#fc362d]/30 bg-white transition-all"
                        title="Download Receipt"
                      >
                        <FiDownload className="w-3 h-3" /> Receipt
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyFeesDesk;
