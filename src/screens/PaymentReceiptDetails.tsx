
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ReceiptText,
  UserRound,
  CalendarDays,
  CreditCard,
  Hash,
  RefreshCw,
  Download,
  FileText,
  ShieldCheck,
  Wallet,
  ArrowUpRight,
  Copy,
  Mail,
  Phone,
  BriefcaseBusiness,
  BadgeCheck,
 
} from "lucide-react";
import { toast } from "react-toastify";

import {
  paymentReceiptService,
  type PaymentReceipt,
} from "../service/paymentReceiptService";

import "./paymentreceipt.css";

/* =========================================
   FORMAT CURRENCY
========================================= */

const formatCurrency = (
  amount?: number,
  currency = "USD"
): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(Number(amount ?? 0));
  } catch {
    return `${currency || "USD"} ${Number(amount ?? 0).toFixed(2)}`;
  }
};

/* =========================================
   FORMAT DATE
========================================= */

const formatDate = (date?: any): string => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

/* =========================================
   SAFE DISPLAY VALUE
========================================= */

const safeDisplayValue = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return (
      value
        .map((item) => safeDisplayValue(item))
        .filter((item) => item !== "—")
        .join(", ") || "—"
    );
  }

  if (typeof value === "object") {
    if (value.name) return safeDisplayValue(value.name);
    if (value.title) return safeDisplayValue(value.title);
    if (value.label) return safeDisplayValue(value.label);
    if (value.type) return safeDisplayValue(value.type);

    try {
      return JSON.stringify(value);
    } catch {
      return "—";
    }
  }

  return String(value);
};

/* =========================================
   PAYMENT METHOD FORMATTER
========================================= */

const formatPaymentMethod = (method: any): string => {
  if (!method) return "—";

  if (typeof method === "string") return method;

  if (typeof method === "object") {
    const parts = [
      method.type,
      method.cardHolderName,
    ]
      .filter(
        (item) =>
          item !== null &&
          item !== undefined &&
          String(item).trim() !== ""
      )
      .map((item) => safeDisplayValue(item));

    return parts.join(" - ") || "—";
  }

  return String(method);
};

/* =========================================
   USER NAME
========================================= */

const getUserName = (user: any): string => {
  if (!user) return "—";

  if (typeof user === "string") return user;

  if (typeof user !== "object") {
    return safeDisplayValue(user);
  }

  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    safeDisplayValue(user.name) !== "—"
      ? safeDisplayValue(user.name)
      : fullName || user.email || "—"
  );
};

/* =========================================
   TRANSACTION ID
========================================= */

const getTransactionId = (
  payment: PaymentReceipt
): string => {
  const data: any = payment;

  return safeDisplayValue(
    data.transactionId ||
      data.paymentGateway?.transactionId ||
      data.paymentGateway?.paymentIntentId ||
      data.paymentIntentId
  );
};

/* =========================================
   BOOKING ID
========================================= */

const getBookingId = (booking: any): string => {
  if (!booking) return "—";

  if (typeof booking === "string") return booking;

  return safeDisplayValue(
    booking.publicServiceId || booking._id
  );
};

/* =========================================
   SERVICE NAME
========================================= */

const getServiceName = (booking: any): string => {
  if (!booking || typeof booking === "string") {
    return "—";
  }

  return safeDisplayValue(
    booking.service?.name ||
      booking.service?.serviceName ||
      booking.service?.title
  );
};




/* =========================================
   SECTION HEADER
========================================= */

const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) => (
  <div className="payment-section-heading">
    <div className="payment-section-icon">
      <Icon size={21} />
    </div>

    <div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  </div>
);

/* =========================================
   DETAIL ITEM
========================================= */

const DetailItem = ({
  label,
  value,
  icon: Icon,
  copyable = false,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ElementType;
  copyable?: boolean;
}) => {
  const safeValue = (() => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    if (React.isValidElement(value)) {
      return value;
    }

    if (
      typeof value === "object" ||
      typeof value === "boolean"
    ) {
      return safeDisplayValue(value);
    }

    return value;
  })();

  const copyValue =
    typeof value === "string" ? value : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue);
      toast.success("Copied successfully");
    } catch {
      toast.error("Unable to copy value");
    }
  };

  return (
    <div className="payment-detail-item">
      <div className="payment-detail-label">
        {Icon && <Icon size={14} />}
        <span>{label}</span>
      </div>

      <div className="payment-detail-value-row">
        <div className="payment-detail-value">
          {safeValue}
        </div>

        {copyable &&
          copyValue &&
          copyValue !== "—" && (
            <button
              type="button"
              title="Copy"
              onClick={handleCopy}
              className="payment-copy-btn no-print"
            >
              <Copy size={14} />
            </button>
          )}
      </div>
    </div>
  );
};

/* =========================================
   MAIN COMPONENT
========================================= */

const PaymentReceiptDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [receipt, setReceipt] =
    useState<PaymentReceipt | null>(null);

  const [loading, setLoading] = useState(true);

  /* =========================================
     FETCH RECEIPT DETAILS
  ========================================= */

  useEffect(() => {
    let isMounted = true;

    const loadDetails = async () => {
      if (!id) {
        if (isMounted) {
          toast.error("Payment ID is missing.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);

        const result =
          await paymentReceiptService.getReceiptDetails(id);

        if (!isMounted) return;

        const receiptData =
          (result as any)?.data?.data ||
          (result as any)?.data ||
          result;

        if (
          receiptData &&
          typeof receiptData === "object" &&
          !Array.isArray(receiptData)
        ) {
          setReceipt(receiptData as PaymentReceipt);
        } else {
          setReceipt(null);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load receipt details.";

        if (isMounted) {
          setReceipt(null);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);



  /* =========================================
     LOADING STATE
  ========================================= */

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="payment-loading-icon">
          <RefreshCw size={27} />
        </div>

        <h3>Loading payment details...</h3>

        <p>
          Please wait while we fetch your receipt
        </p>
      </div>
    );
  }

  /* =========================================
     RECEIPT NOT FOUND
  ========================================= */

  if (!receipt) {
    return (
      <div className="payment-not-found">
        <div className="payment-not-found-card">
          <div className="payment-not-found-icon">
            <ReceiptText size={38} />
          </div>

          <h2>Receipt Not Found</h2>

          <p>
            This payment receipt could not be loaded.
          </p>

          <button
            onClick={() =>
              navigate("/payment-receipts")
            }
            className="payment-btn payment-btn-primary"
            style={{ marginTop: "24px" }}
          >
            <ArrowLeft size={17} />
            Back to Receipts
          </button>
        </div>
      </div>
    );
  }

  /* =========================================
     NORMALIZE RECEIPT DATA
  ========================================= */

  const receiptData: any = receipt;

  const user =
    receiptData.user &&
    typeof receiptData.user === "object"
      ? receiptData.user
      : undefined;

  const booking =
    receiptData.booking &&
    typeof receiptData.booking === "object"
      ? receiptData.booking
      : undefined;

  const provider = booking?.provider;

  const amount = Number(
    receiptData.totalAmount ??
      receiptData.amount ??
      0
  );

  const paymentAmount = Number(
    receiptData.amount ?? 0
  );

  const currency = receiptData.currency || "USD";


  const paymentMethod = formatPaymentMethod(
    receiptData.paymentMethod
  );




  const transactionId = getTransactionId(receipt);

  const requesterName = getUserName(
    user || receiptData.user
  );

  const providerName = getUserName(provider);

  const serviceId = getBookingId(
    booking || receiptData.booking
  );

  const receiptNumber = safeDisplayValue(
    receiptData.receiptNumber
  );


  /* =========================================
     MAIN UI
  ========================================= */

  return (
    <div className="payment-detail-page">
      <div className="payment-detail-container">

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="payment-detail-header no-print">
          <div className="payment-header-left">
           

            <div className="payment-heading-row">
              <div className="payment-heading-icon">
                <ReceiptText size={24} />
              </div>

              <div>
                <h1>Payment Receipt Details</h1>

                <p>
                  Manage and review complete payment
                  transaction information.
                </p>
              </div>
            </div>
          </div>

          <div className="payment-header-actions">
            <button
              onClick={() =>
                navigate("/payment-receipts")
              }
              className="payment-btn payment-btn-back"
            >
              <ArrowLeft size={16} />
              Back
            </button>

           
          </div>
        </div>

        {/* =====================================
            RECEIPT HERO
        ===================================== */}

        <div className="payment-receipt-hero">
          <div className="payment-hero-content">
            <div className="payment-brand-tag">
              <ShieldCheck size={15} />
              SENIORAMERICA • OFFICIAL RECEIPT
            </div>

            <h2>
              {receiptNumber === "—"
                ? "Payment Receipt"
                : receiptNumber}
            </h2>

           
          </div>

          <div className="payment-hero-amount">
            <p>Total Payment Amount</p>

            <h2>
              {formatCurrency(amount, currency)}
            </h2>

           
          </div>
        </div>

        

        {/* =====================================
            MAIN CONTENT
        ===================================== */}

        <div className="payment-main-grid mt-2">

          {/* LEFT COLUMN */}

          <div className="payment-left-column">

            {/* TRANSACTION INFORMATION */}

            <section className="payment-section-card">
              <SectionHeader
                icon={CreditCard}
                title="Transaction Information"
                subtitle="Payment gateway and transaction reference details"
              />

              <div className="payment-detail-grid">
                <DetailItem
                  label="Transaction ID"
                  value={transactionId}
                  icon={Hash}
                  copyable
                />

                

                <DetailItem
                  label="Receipt Number"
                  value={receiptNumber}
                  icon={ReceiptText}
                  copyable
                />

               

                <DetailItem
                  label="Payment Method"
                  value={paymentMethod}
                  icon={Wallet}
                />

              

               


               
              </div>
            </section>

            {/* REQUESTER INFORMATION */}

            <section className="payment-section-card">
              <SectionHeader
                icon={UserRound}
                title="Requester Information"
                subtitle="Details of the customer associated with this payment"
              />

              <div className="payment-profile-strip">
                <div className="payment-profile-avatar">
                  <UserRound size={26} />
                </div>

                <div className="payment-profile-info">
                  <h4>{requesterName}</h4>

                  <p>Requester </p>
                </div>

                <div className="payment-profile-tag">
                  Customer
                </div>
              </div>

              <div className="payment-detail-grid">
                <DetailItem
                  label="Requester Name"
                  value={requesterName}
                  icon={UserRound}
                />

                
                <DetailItem
                  label="Email Address"
                  value={safeDisplayValue(user?.email)}
                  icon={Mail}
                  copyable
                />

                <DetailItem
                  label="Phone Number"
                  value={safeDisplayValue(user?.phone)}
                  icon={Phone}
                />
              </div>
            </section>

            {/* BOOKING / SERVICE INFORMATION */}

            <section className="payment-section-card">
              <SectionHeader
                icon={BriefcaseBusiness}
                title="Booking / Service Information"
                subtitle="Service booking and assigned provider details"
              />

              <div className="payment-service-highlight">
                <div>
                  <small>Service Name</small>

                  <h4>{getServiceName(booking)}</h4>

                  <p>Service ID: {serviceId}</p>
                </div>

                <div className="payment-service-icon">
                  <BriefcaseBusiness size={23} />
                </div>
              </div>

              <h4 className="payment-subsection-title">
                Booking Details
              </h4>

              <div className="payment-detail-grid">
                <DetailItem
                  label="Service ID"
                  value={serviceId}
                  icon={Hash}
                  copyable
                />

                <DetailItem
                  label="Service Name"
                  value={getServiceName(booking)}
                  icon={BriefcaseBusiness}
                />

                <DetailItem
                  label="Scheduled Date"
                  value={formatDate(
                    booking?.scheduledDate ||
                      booking?.startDate
                  )}
                  icon={CalendarDays}
                />

                <DetailItem
                  label="Booking Status"
                  value={
                    <span>
                      {safeDisplayValue(booking?.status)}
                    </span>
                  }
                  icon={BadgeCheck}
                />
              </div>

              <hr className="payment-divider" />

              <h4 className="payment-subsection-title">
                Assigned Care giver
              </h4>

              <div className="payment-profile-strip">
                <div className="payment-profile-avatar provider">
                  <BriefcaseBusiness size={23} />
                </div>

                <div className="payment-profile-info">
                  <h4>{providerName}</h4>

                  <p>Service  Care giver</p>
                </div>
              </div>

              <div className="payment-detail-grid">
                <DetailItem
                  label="Care giver Name"
                  value={providerName}
                  icon={UserRound}
                />

               
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}

          <aside className="payment-right-column">

            {/* PAYMENT SUMMARY */}

            <section className="payment-side-summary">
              <div className="payment-side-summary-header">
                <h3>
                  <Wallet size={19} />
                  Payment Summary
                </h3>

                <p>Complete payment breakdown</p>
              </div>

              <div className="payment-side-summary-body">
                <div>
                  <p className="payment-side-label">
                    Payment Amount
                  </p>

                  <h2 className="payment-side-amount">
                    {formatCurrency(
                      paymentAmount,
                      currency
                    )}
                  </h2>
                </div>

                <div className="payment-side-row">
                  <span>Payment Amount</span>

                  <strong>
                    {formatCurrency(
                      paymentAmount,
                      currency
                    )}
                  </strong>
                </div>

                <div className="payment-side-row">
                  <span>Total Amount</span>

                  <strong>
                    {formatCurrency(amount, currency)}
                  </strong>
                </div>

                <div className="payment-side-total">
                  <p>Total Recorded</p>

                  <h3>
                    {formatCurrency(amount, currency)}
                  </h3>
                </div>
              </div>
            </section>


            {/* RECEIPT DOCUMENT */}

            {typeof receiptData.receiptUrl === "string" &&
              receiptData.receiptUrl.trim() !== "" && (
                <section className="payment-document-card">
                  <div className="payment-document-heading">
                    <div className="payment-document-icon">
                      <FileText size={22} />
                    </div>

                    <div>
                      <h3>Receipt Document</h3>

                      <p>External receipt document</p>
                    </div>
                  </div>

                  <a
                    href={receiptData.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="payment-document-link"
                  >
                    <Download size={16} />
                    Open Receipt
                    <ArrowUpRight size={15} />
                  </a>
                </section>
              )}
          </aside>
        </div>

       
      </div>
    </div>
  );
};

export default PaymentReceiptDetails;
