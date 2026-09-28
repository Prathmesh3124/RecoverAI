import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = 
  import.meta.env.VITE_API_URL || "http://localhost:8000";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("access_token");
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
}

function App() {
  const [mode, setMode] = useState("login");
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("access_token"))
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const endpoint =
      mode === "login"
        ? `${API_URL}/auth/login`
        : `${API_URL}/auth/register`;

    const body =
      mode === "login"
        ? { email, password }
        : { name, email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      if (mode === "register") {
        setMessage("Account created successfully. Please sign in.");
        setMode("login");
        setName("");
        setPassword("");
      } else {
        localStorage.setItem("access_token", data.access_token);
        setLoggedIn(true);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    setLoggedIn(false);
    setEmail("");
    setPassword("");
    setMessage("");
  }

  if (loggedIn) {
    return <Dashboard onLogout={logout} />;
  }

  return (
    <div className="app">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-mark">R</div>

          <div>
            <h1>RecoverAI</h1>
            <p>Revenue recovery intelligence</p>
          </div>
        </div>

        <div className="auth-header">
          <h2>
            {mode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h2>

          <p>
            {mode === "login"
              ? "Sign in to your revenue recovery workspace."
              : "Start managing your revenue recovery with AI."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="field">
              <label>Full name</label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          )}

          <div className="field">
            <label>Email address</label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>

          {message && <div className="message">{message}</div>}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <div className="switch-mode">
          {mode === "login" ? (
            <>
              Don't have an account?

              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setMessage("");
                }}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onLogout }) {
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [recoveryActions, setRecoveryActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [analyzingPaymentId, setAnalyzingPaymentId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  async function analyzePayment(paymentId) {
    try {
      setAnalyzingPaymentId(paymentId);
      setActionMessage("");

      const response = await apiFetch(
        `/ai-decisions/analyze/${paymentId}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to analyze payment"
        );
      }

      setActionMessage(
        `Payment #${paymentId} analyzed successfully.`
      );

      const decisionsResponse = await apiFetch("/ai-decisions/");

      if (decisionsResponse.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      if (!decisionsResponse.ok) {
        throw new Error("Failed to refresh AI decisions");
      }

      const decisionsData = await decisionsResponse.json();
      setDecisions(decisionsData);
    } catch (err) {
      setActionMessage(
        err.message || "Failed to analyze payment"
      );
    } finally {
      setAnalyzingPaymentId(null);
    }
  }

  async function createRecoveryAction(paymentId, actionType) {
    try {
      setActionMessage("");

      const response = await apiFetch(
        `/recovery-actions/?payment_id=${encodeURIComponent(
          paymentId
        )}&action_type=${encodeURIComponent(
          actionType
        )}&status=executed`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create recovery action"
        );
      }

      setActionMessage(
        `Recovery action created for payment #${paymentId}.`
      );

      const actionsResponse = await apiFetch(
        "/recovery-actions/"
      );

      if (actionsResponse.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      if (actionsResponse.ok) {
        setRecoveryActions(await actionsResponse.json());
      }
    } catch (err) {
      setActionMessage(
        err.message || "Failed to create recovery action"
      );
    }
  }

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [
          customersResponse,
          paymentsResponse,
          decisionsResponse,
          recoveryActionsResponse,
        ] = await Promise.all([
          apiFetch("/customers/"),
          apiFetch("/payments/"),
          apiFetch("/ai-decisions/"),
          apiFetch("/recovery-actions/"),
        ]);

        if (
          [
            customersResponse,
            paymentsResponse,
            decisionsResponse,
            recoveryActionsResponse,
          ].some((response) => response.status === 401)
        ) {
          localStorage.removeItem("access_token");
          onLogout();
          return;
        }

        if (!customersResponse.ok) {
          throw new Error("Failed to load customers");
        }

        if (!paymentsResponse.ok) {
          throw new Error("Failed to load payments");
        }

        if (!decisionsResponse.ok) {
          throw new Error("Failed to load AI decisions");
        }

        if (!recoveryActionsResponse.ok) {
          throw new Error("Failed to load recovery actions");
        }

        const [
          customersData,
          paymentsData,
          decisionsData,
          recoveryActionsData,
        ] = await Promise.all([
          customersResponse.json(),
          paymentsResponse.json(),
          decisionsResponse.json(),
          recoveryActionsResponse.json(),
        ]);

        setCustomers(customersData);
        setPayments(paymentsData);
        setDecisions(decisionsData);
        setRecoveryActions(recoveryActionsData);
      } catch (err) {
        setError(
          err.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const latestDecisions = useMemo(() => {
    const map = new Map();

    for (const decision of decisions) {
      const existing = map.get(decision.payment_id);

      if (
        !existing ||
        new Date(decision.created_at) >
          new Date(existing.created_at)
      ) {
        map.set(decision.payment_id, decision);
      }
    }

    return map;
  }, [decisions]);

  const dashboardData = useMemo(() => {
    const paymentRows = payments.map((payment) => {
      const customer = customers.find(
        (item) => item.id === payment.customer_id
      );

      const decision = latestDecisions.get(payment.id);

      return {
        ...payment,
        customer,
        decision,
      };
    });

    const totalFailedRevenue = payments
      .filter((payment) => payment.status === "failed")
      .reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      );

    const failedPaymentCount = payments.filter(
      (payment) => payment.status === "failed"
    ).length;

    const highRiskPayments = paymentRows.filter(
      (row) => row.decision?.risk_level === "High"
    );

    const mediumRiskPayments = paymentRows.filter(
      (row) => row.decision?.risk_level === "Medium"
    );

    const lowRiskPayments = paymentRows.filter(
      (row) => row.decision?.risk_level === "Low"
    );

    const scoredRows = paymentRows.filter(
      (row) => row.decision
    );

    const averageRecoveryScore =
      scoredRows.length > 0
        ? scoredRows.reduce(
            (sum, row) =>
              sum +
              Number(
                row.decision.recovery_score || 0
              ),
            0
          ) / scoredRows.length
        : 0;

    const retryCount = paymentRows.filter(
      (row) =>
        row.decision?.recommended_action ===
        "retry_payment"
    ).length;

    const reminderCount = paymentRows.filter(
      (row) =>
        row.decision?.recommended_action ===
        "send_reminder"
    ).length;

    const escalationCount = paymentRows.filter(
      (row) =>
        row.decision?.recommended_action ===
        "human_escalation"
    ).length;

    return {
      paymentRows,
      totalFailedRevenue,
      failedPaymentCount,
      highRiskPayments,
      mediumRiskPayments,
      lowRiskPayments,
      averageRecoveryScore,
      retryCount,
      reminderCount,
      escalationCount,
    };
  }, [payments, customers, latestDecisions]);

  function scrollToSection(sectionId, navId) {
    setActiveNav(navId);

    const element = document.getElementById(sectionId);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <div className="brand-mark">R</div>

            <div>
              <h1>RecoverAI</h1>
              <span>
                Revenue recovery intelligence
              </span>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="panel">
            <h3>Loading dashboard...</h3>

            <p>
              Fetching customers, payments, and AI
              decisions.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <div className="brand-mark">R</div>

            <div>
              <h1>RecoverAI</h1>
              <span>
                Revenue recovery intelligence
              </span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            Log out
          </button>
        </header>

        <main className="dashboard-content">
          <div className="panel">
            <h3>Unable to load dashboard</h3>
            <p>{error}</p>

            <p>
              Make sure the backend is running on
              http://127.0.0.1:8000.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const {
    paymentRows,
    totalFailedRevenue,
    failedPaymentCount,
    highRiskPayments,
    mediumRiskPayments,
    lowRiskPayments,
    averageRecoveryScore,
    retryCount,
    reminderCount,
    escalationCount,
  } = dashboardData;

  const searchTerm = customerSearch.trim().toLowerCase();

  const filteredPaymentRows = searchTerm
    ? paymentRows.filter((row) => {
        const name =
          row.customer?.name?.toLowerCase() || "";

        const email =
          row.customer?.email?.toLowerCase() || "";

        const company =
          row.customer?.company?.toLowerCase() || "";

        return (
          name.includes(searchTerm) ||
          email.includes(searchTerm) ||
          company.includes(searchTerm)
        );
      })
    : paymentRows;

  return (
    <div className="dashboard dashboard-shell">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">R</div>

          <div>
            <strong>RecoverAI</strong>
            <span>Revenue Intelligence</span>
          </div>
        </div>

        <div className="sidebar-label">
          WORKSPACE
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-nav-item ${
              activeNav === "dashboard" ? "active" : ""
            }`}
            onClick={() =>
              scrollToSection("overview", "dashboard")
            }
          >
            <span className="sidebar-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${
              activeNav === "customers" ? "active" : ""
            }`}
            onClick={() =>
              scrollToSection("customers", "customers")
            }
          >
            <span className="sidebar-icon">♙</span>
            <span>Customers</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${
              activeNav === "payments" ? "active" : ""
            }`}
            onClick={() =>
              scrollToSection("payments", "payments")
            }
          >
            <span className="sidebar-icon">▣</span>
            <span>Payments</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${
              activeNav === "recovery" ? "active" : ""
            }`}
            onClick={() =>
              scrollToSection("recovery", "recovery")
            }
          >
            <span className="sidebar-icon">↻</span>
            <span>Recovery</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${
              activeNav === "ai-insights" ? "active" : ""
            }`}
            onClick={() =>
              scrollToSection(
                "ai-insights",
                "ai-insights"
              )
            }
          >
            <span className="sidebar-icon">✦</span>
            <span>AI Insights</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-label">
            ACCOUNT
          </div>

          <div className="sidebar-account">
            <div className="account-avatar">AI</div>

            <div>
              <strong>Recovery Engine</strong>
              <span>AI workspace</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={onLogout}
          >
            <span>↪</span>
            Log out
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <div className="brand-mark">R</div>

            <div>
              <h1>RecoverAI</h1>

              <span>
                Revenue recovery intelligence
              </span>
            </div>
          </div>

          <div className="dashboard-actions">
            <button
              type="button"
              className="refresh-button"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>

            <button
              type="button"
              className="add-customer-button"
              onClick={() => setShowAddCustomer(true)}
            >
              + Add Customer
            </button>

            <button
              className="logout-button"
              onClick={onLogout}
            >
              Log out
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          {selectedCustomer && (
            <section
              id="customers"
              className="panel customer-details"
            >
              <div className="panel-header">
                <div>
                  <p className="eyebrow">
                    CUSTOMER PROFILE
                  </p>

                  <h3>
                    {selectedCustomer.name?.trim() ||
                      `Customer #${selectedCustomer.id}`}
                  </h3>

                  <p>
                    {selectedCustomer.company ||
                      "No company listed"}
                  </p>
                </div>

                <button
                  type="button"
                  className="close-button"
                  onClick={() =>
                    setSelectedCustomer(null)
                  }
                >
                  Close
                </button>
              </div>

              <div className="customer-details-grid">
                <div>
                  <span>Email</span>

                  <strong>
                    {selectedCustomer.email ||
                      "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Total value</span>

                  <strong>
                    {formatCurrency(
                      selectedCustomer.total_value
                    )}
                  </strong>
                </div>

                <div>
                  <span>Risk level</span>

                  <strong
                    className={`risk risk-${String(
                      selectedCustomer.risk_level ||
                        "Low"
                    ).toLowerCase()}`}
                  >
                    {selectedCustomer.risk_level ||
                      "Low"}
                  </strong>
                </div>

                <div>
                  <span>Customer ID</span>

                  <strong>
                    #{selectedCustomer.id}
                  </strong>
                </div>
              </div>

              <div className="customer-payment-history">
                <div className="panel-header">
                  <div>
                    <h3>Payment history</h3>

                    <p>
                      Payments associated with this
                      customer
                    </p>
                  </div>
                </div>

                {payments.filter(
                  (payment) =>
                    payment.customer_id ===
                    selectedCustomer.id
                ).length === 0 ? (
                  <p>
                    No payments found for this
                    customer.
                  </p>
                ) : (
                  <div className="customer-payments">
                    {payments
                      .filter(
                        (payment) =>
                          payment.customer_id ===
                          selectedCustomer.id
                      )
                      .map((payment) => {
                        const decision =
                          latestDecisions.get(
                            payment.id
                          );

                        return (
                          <div
                            className="customer-payment-row"
                            key={payment.id}
                          >
                            <div>
                              <strong>
                                Payment #{payment.id}
                              </strong>

                              <span>
                                {formatCurrency(
                                  payment.amount
                                )}
                              </span>
                            </div>

                            <div>
                              <span>
                                Status:{" "}
                                {payment.status}
                              </span>

                              <span>
                                AI:{" "}
                                {decision
                                  ? formatAction(
                                      decision.recommended_action
                                    )
                                  : "Not analyzed"}
                              </span>
                            </div>

                            <div>
                              <button
                                type="button"
                                className="analyze-button"
                                onClick={() =>
                                  analyzePayment(
                                    payment.id
                                  )
                                }
                                disabled={
                                  analyzingPaymentId ===
                                  payment.id
                                }
                              >
                                {analyzingPaymentId ===
                                payment.id
                                  ? "Analyzing..."
                                  : "Analyze"}
                              </button>
                            </div>

                            <div>
                              {decision ? (
                                <span
                                  className={`risk risk-${String(
                                    decision.risk_level
                                  ).toLowerCase()}`}
                                >
                                  {decision.risk_level}
                                </span>
                              ) : (
                                <span className="risk">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </section>
          )}

          <div
            id="overview"
            className="dashboard-title"
          >
            <div>
              <p className="eyebrow">OVERVIEW</p>

              <h2>Revenue recovery dashboard</h2>

              <p>
                Monitor failed payments and prioritize
                recovery opportunities.
              </p>
            </div>
          </div>

          <div className="customer-search">
            <input
              type="text"
              value={customerSearch}
              onChange={(event) =>
                setCustomerSearch(event.target.value)
              }
              placeholder="Search customers by name, email, or company..."
            />
          </div>

          {actionMessage && (
            <div className="message">
              {actionMessage}
            </div>
          )}

          <section className="stats-grid">
            <StatCard
            label="Revenue at risk"
            value={formatCurrency(totalFailedRevenue)}
            detail={`${failedPaymentCount} failed payments`}
            icon="₹"
            tone="danger"
            />

            <StatCard
            label="Average recovery score"
            value={`${Math.round(averageRecoveryScore)}/100`}
            detail={`${decisions.length} AI decisions`}
            icon="✦"
            tone="primary"
            progress={averageRecoveryScore}
            />

            <StatCard
            label="High-risk payments"
            value={highRiskPayments.length}
            detail={`${mediumRiskPayments.length} medium risk`}
            icon="!"
            tone="warning"
            progress={
            payments.length
            ? (highRiskPayments.length / payments.length) * 100
            : 0
            }
            />

            <StatCard
              label="Customers at risk"
              value={
                highRiskPayments.length +
                mediumRiskPayments.length
              }
              detail={`${lowRiskPayments.length} low risk`}
              icon="♙"
              tone="info"
              />
            </section>

          <section
            id="recovery"
            className="dashboard-grid"
          >
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h3>Recovery performance</h3>

                  <p>
                    AI recovery score distribution
                    across analyzed payments
                  </p>
                </div>
              </div>

              <div className="chart-placeholder">
  <div className="chart-line chart-line-100">
    <span>100</span>
  </div>

  <div className="chart-line chart-line-80">
    <span>80</span>
  </div>

  <div className="chart-line chart-line-60">
    <span>60</span>
  </div>

  <div className="chart-line chart-line-40">
    <span>40</span>
  </div>

  <div className="chart-line chart-line-20">
    <span>20</span>
  </div>

  <div className="chart-bars">
    {filteredPaymentRows.length ? (
      filteredPaymentRows.slice(0, 8).map((row) => {
        const score = Math.max(
          20,
          Math.min(
            100,
            Number(row.decision?.recovery_score || 20)
          )
        );

        return (
          <div
            key={row.id}
            className="chart-bar"
            style={{
              height: `${score}%`,
            }}
            title={`${row.customer?.name || "Customer"}: ${score}/100`}
          />
        );
      })
    ) : (
      <div className="chart-empty">
        No recovery data yet
      </div>
    )}
  </div>

  <div className="chart-labels">
    {filteredPaymentRows.slice(0, 8).map((row) => (
      <span key={row.id}>
        #{row.id}
      </span>
    ))}
  </div>
</div>


                {[...filteredPaymentRows]
                  .sort((a, b) => {
                    const riskOrder = {
                      high: 3,
                      medium: 2,
                      low: 1,
                    };

                    const aRisk =
                      riskOrder[
                        a.decision?.risk_level?.toLowerCase()
                      ] || 0;

                    const bRisk =
                      riskOrder[
                        b.decision?.risk_level?.toLowerCase()
                      ] || 0;

                    if (bRisk !== aRisk) {
                      return bRisk - aRisk;
                    }

                    const aScore = Number(
                      a.decision?.recovery_score || 0
                    );

                    const bScore = Number(
                      b.decision?.recovery_score || 0
                    );

                    return bScore - aScore;
                  })
                  .slice(0, 5)
                  .map((row) => (
                    <RecoveryItem
                      key={row.id}
                      paymentId={row.id}
                      name={
                        row.customer?.name?.trim() ||
                        `Customer #${row.customer_id}`
                      }
                      amount={formatCurrency(row.amount)}
                      risk={
                        row.decision?.risk_level ||
                        "Pending"
                      }
                      action={
                        row.decision?.recommended_action
                      }
                      onAnalyze={analyzePayment}
                      onCreateAction={
                        createRecoveryAction
                      }
                      analyzing={
                        analyzingPaymentId === row.id
                      }
                    />
                  ))}
              </div>
            </section>

          <section
            id="ai-insights"
            className="panel"
          >
            <div className="panel-header">
              <div>
                <h3>AI recovery actions</h3>

                <p>
                  Actions recommended by the Recovery
                  Engine
                </p>
              </div>
            </div>

            <div className="action-summary">
              <div>
                <strong>{retryCount}</strong>
                <span>Retry payment</span>
              </div>

              <div>
                <strong>{reminderCount}</strong>
                <span>Send reminder</span>
              </div>

              <div>
                <strong>{escalationCount}</strong>
                <span>Human escalation</span>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>Recovery action history</h3>

                <p>
                  Actions executed by the Recovery
                  Engine
                </p>
              </div>
            </div>

            {recoveryActions.length === 0 ? (
              <div className="empty-state">
                No recovery actions have been
                executed yet.
              </div>
            ) : (
              <div className="actions-table">
                <div className="table-row table-heading">
                  <span>Action</span>
                  <span>Payment</span>
                  <span>Status</span>
                  <span>Created</span>
                </div>

                {[...recoveryActions]
                  .sort(
                    (a, b) =>
                      new Date(
                        b.created_at || 0
                      ) -
                      new Date(
                        a.created_at || 0
                      )
                  )
                  .slice(0, 10)
                  .map((action) => (
                    <div
                      className="table-row"
                      key={action.id}
                    >
                      <span>
                        {formatAction(
                          action.action_type
                        )}
                      </span>

                      <span>
                        #{action.payment_id}
                      </span>

                      <span>
                        <span className="status-badge">
                          {action.status}
                        </span>
                      </span>

                      <span>
                        {action.created_at
                          ? new Date(
                              action.created_at
                            ).toLocaleString(
                              "en-IN"
                            )
                          : "—"}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </section>

          <section
            id="payments"
            className="panel decisions-table"
          >
            <div className="panel-header">
              <div>
                <h3>Recent AI decisions</h3>

                <p>
                  Real decisions stored by the
                  Recovery Engine
                </p>
              </div>
            </div>

            <div className="actions-table">
              <div className="table-row table-heading">
                <span>Customer</span>
                <span>Payment</span>
                <span>AI recommendation</span>
                <span>Risk</span>
                <span>Recovery score</span>
                <span>Action</span>
              </div>

              {[...filteredPaymentRows]
                .sort(
                  (a, b) =>
                    new Date(
                      b.decision?.created_at || 0
                    ) -
                    new Date(
                      a.decision?.created_at || 0
                    )
                )
                .map((row) => (
                  <div
                    className="table-row"
                    key={row.id}
                  >
                    <span>
                      <button
                        type="button"
                        className="customer-link"
                        onClick={() =>
                          setSelectedCustomer(
                            row.customer
                          )
                        }
                      >
                        {row.customer?.name?.trim() ||
                          `Customer #${row.customer_id}`}
                      </button>
                    </span>

                    <span>
                      #{row.id} ·{" "}
                      {formatCurrency(row.amount)}
                    </span>

                    <span>
                      {row.decision
                        ? formatAction(
                            row.decision
                              .recommended_action
                          )
                        : "Not analyzed"}
                    </span>

                    <span
                      className={
                        row.decision
                          ? `risk risk-${row.decision.risk_level.toLowerCase()}`
                          : "risk"
                      }
                    >
                      {row.decision?.risk_level ||
                        "Pending"}
                    </span>

                    <span>
                      {row.decision
                        ? `${Number(
                            row.decision
                              .recovery_score || 0
                          )}%`
                        : "—"}
                    </span>

                    <button
                      type="button"
                      className="analyze-button"
                      onClick={() =>
                        analyzePayment(row.id)
                      }
                      disabled={
                        analyzingPaymentId ===
                        row.id
                      }
                    >
                      {analyzingPaymentId === row.id
                        ? "Analyzing..."
                        : "Analyze"}
                    </button>
                  </div>
                ))}
            </div>
          </section>
        </main>
      </div>

      {showAddCustomer && (
        <AddCustomerModal
          onClose={() =>
            setShowAddCustomer(false)
          }
          onSuccess={() => {
            setShowAddCustomer(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
  tone = "primary",
  progress,
}) {
  return (
    <div className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-top">
        <div className="stat-card-label">
          <span>{label}</span>
        </div>

        <div className="stat-card-icon">
          {icon}
        </div>
      </div>

      <strong>{value}</strong>

      <div className="stat-card-bottom">
        <span>{detail}</span>

        {typeof progress === "number" && (
          <div className="stat-progress">
            <div
              className="stat-progress-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function getDecisionReason(action, risk) {
  const normalizedAction = action?.toLowerCase();

  if (normalizedAction === "retry_payment") {
    return risk === "High"
      ? "High recovery potential — retry payment soon."
      : "Payment may succeed with another retry.";
  }

  if (normalizedAction === "send_reminder") {
    return "A payment reminder may help recover this amount.";
  }

  if (normalizedAction === "human_escalation") {
    return "Higher risk requires manual follow-up.";
  }

  return "AI recommends reviewing this failed payment.";
}

function RecoveryItem({
  name,
  amount,
  risk,
  action,
  paymentId,
  onAnalyze,
  analyzing,
  onCreateAction,
}) {
  return (
    <div className="recovery-item">
      <div>
        <strong>{name}</strong>

        <span>
          Payment #{paymentId} · {amount}
        </span>

        <span>
          {action
            ? formatAction(action)
            : "Not analyzed"}
        </span>

        {action && (
          <span>
            {getDecisionReason(action, risk)}
          </span>
        )}
      </div>

      <div>
        <span
          className={`risk risk-${risk.toLowerCase()}`}
        >
          {risk}
        </span>

        {action && (
          <button
            type="button"
            className="action-button"
            onClick={() =>
              onCreateAction(paymentId, action)
            }
          >
            Execute
          </button>
        )}

        <button
          type="button"
          className="analyze-button"
          onClick={() => onAnalyze(paymentId)}
          disabled={analyzing}
        >
          {analyzing
            ? "Analyzing..."
            : "Analyze"}
        </button>
      </div>
    </div>
  );
}

function formatCurrency(amount) {
  return `₹${Number(
    amount || 0
  ).toLocaleString("en-IN")}`;
}

function formatAction(action) {
  const labels = {
    retry_payment: "Retry payment",
    send_reminder: "Send reminder",
    human_escalation: "Human escalation",
  };

  return labels[action] || action;
}

function AddCustomerModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    total_value: "",
    amount: "",
    currency: "INR",
    status: "failed",
    failure_reason: "",
    attempt_count: "1",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const customerParams = new URLSearchParams({
        name: form.name,
        email: form.email,
        company: form.company,
        total_value: form.total_value || "0",
      });

      const customerResponse = await apiFetch(
        `/customers/?${customerParams.toString()}`,
        {
          method: "POST",
        }
      );

      const customerData =
        await customerResponse.json();

      if (customerResponse.status === 401) {
        localStorage.removeItem("access_token");
        window.location.reload();
        return;
      }

      if (!customerResponse.ok) {
        throw new Error(
          customerData.detail ||
            "Failed to create customer"
        );
      }

      const paymentParams = new URLSearchParams({
        customer_id: String(customerData.id),
        amount: form.amount,
        status: form.status,
        currency: form.currency,
        failure_reason: form.failure_reason,
        attempt_count: form.attempt_count || "1",
      });

      const paymentResponse = await apiFetch(
        `/payments/?${paymentParams.toString()}`,
        {
          method: "POST",
        }
      );

      const paymentData =
        await paymentResponse.json();

      if (paymentResponse.status === 401) {
        localStorage.removeItem("access_token");
        window.location.reload();
        return;
      }

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData.detail ||
            "Failed to create payment"
        );
      }

      onSuccess();
    } catch (err) {
      setError(
        err.message || "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="add-customer-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">NEW RECORD</p>

            <h2>Add Customer & Payment</h2>

            <p>
              Add a customer and their failed payment
              to the recovery workspace.
            </p>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Customer Information</h3>

            <div className="form-grid">
              <div className="field">
                <label>Customer Name *</label>

                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>

              <div className="field">
                <label>Email *</label>

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                  required
                />
              </div>

              <div className="field">
                <label>Company</label>

                <input
                  name="company"
                  type="text"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Company name"
                />
              </div>

              <div className="field">
                <label>Total Value</label>

                <input
                  name="total_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.total_value}
                  onChange={handleChange}
                  placeholder="125000"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Payment Information</h3>

            <div className="form-grid">
              <div className="field">
                <label>Payment Amount *</label>

                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="125000"
                  required
                />
              </div>

              <div className="field">
                <label>Currency</label>

                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div className="field">
                <label>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="failed">Failed</option>
                  <option value="pending">
                    Pending
                  </option>
                  <option value="success">
                    Success
                  </option>
                </select>
              </div>

              <div className="field">
                <label>Attempt Count</label>

                <input
                  name="attempt_count"
                  type="number"
                  min="1"
                  value={form.attempt_count}
                  onChange={handleChange}
                />
              </div>

              <div className="field full-width">
                <label>Failure Reason</label>

                <input
                  name="failure_reason"
                  type="text"
                  value={form.failure_reason}
                  onChange={handleChange}
                  placeholder="e.g. Insufficient funds"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="message">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="refresh-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Adding..."
                : "Add Customer & Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;