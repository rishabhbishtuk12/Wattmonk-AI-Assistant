import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import profilePhoto from "../../utils/Rishabh.jpeg";

const API_BASE_URL = import.meta.env.VITE_API;

const CHAT_SUMMARY_PROMPT = `Go through the following chat and summarize it in a concise way.

Answer only on the basis of the chat provided. Do not add outside information or assumptions.

Include:
- What the conversation was about
- Important questions or problems
- Key responses or solutions

Avoid unnecessary details and keep it readable.

Return the answer only in valid JSON format using this structure:
{
  "topic": "...",
  "questions_or_problems": ["...", "..."],
  "key_responses_or_solutions": ["...", "..."],
  "summary": "..."
}`;

const initialMessages = [
  {
    id: 1,
    role: "assistant",
    text: "Welcome to Wattmonk AI Assistant. I can help with NEC guidance, Wattmonk information, and general chat.",
    source: "General",
  },
  {
    id: 2,
    role: "user",
    text: "Give me a quick overview of NEC and Wattmonk support.",
  },
  {
    id: 3,
    role: "assistant",
    text: "NEC questions focus on electrical code guidance, while Wattmonk questions cover company details, services, and internal knowledge.",
    source: "NEC + Wattmonk",
  },
];

const quickPrompts = [
  "Summarize NEC grounding rules",
  "What services does Wattmonk provide?",
  "Explain this project in simple words",
];

const necHighlights = [
  { label: "Edition", value: "2017 NFPA 70" },
  { label: "Purpose", value: "Electrical safety" },
  { label: "Focus", value: "Code compliance and protection" },
];

const wattmonkHighlights = [
  { label: "Founded", value: "2019" },
  { label: "Reach", value: "All 50 US states" },
  { label: "Strength", value: "Fast solar engineering workflows" },
];

const necSections = [
  {
    title: "What It Is",
    body: "The National Electrical Code, published as NFPA 70, is one of the most important electrical safety frameworks used in the United States. It provides structured guidance for electrical design, installation, and inspection in order to protect life, property, and infrastructure.",
  },
  {
    title: "Why It Matters",
    body: "The NEC is more than a technical manual. It acts as a safety backbone for electrical work by helping engineers, contractors, inspectors, and installers follow consistent practices that reduce hazards and improve reliability.",
  },
  {
    title: "Key Coverage Areas",
    points: [
      "general electrical definitions and installation requirements",
      "branch circuits, feeders, and services",
      "grounding and bonding rules",
      "overcurrent protection and surge protection",
      "wiring methods, materials, and enclosures",
    ],
  },
  {
    title: "Practical Value",
    body: "For solar and electrical projects, NEC guidance supports safe system design, code-compliant plan sets, smoother approvals, and better alignment with national standards. It is especially valuable when working with grounding, service equipment, branch circuits, and wiring safety.",
  },
  {
    title: "Important Note",
    body: "NFPA makes it clear that the code should be treated as a living standard. Users should always check for updated editions, tentative interim amendments, errata, and local adoption rules before depending on a specific requirement.",
  },
];

const wattmonkSections = [
  {
    title: "Company Identity",
    body: "Wattmonk is a modern solar engineering and technology company focused on making solar deployment faster, simpler, and more accessible. Since its establishment in 2019, it has built a strong position by combining engineering services with workflow automation and customer-focused delivery.",
  },
  {
    title: "What Makes It Strong",
    body: "Its biggest advantage is speed with structure. Wattmonk does not only offer isolated solar services, but supports the full project lifecycle through one connected workflow, from proposal and survey to permitting, engineering review, and utility submission.",
  },
  {
    title: "Core Services",
    points: [
      "rapid solar sales proposals and shade analysis",
      "site survey tools for accurate field capture",
      "permit plan sets with drawings and calculations",
      "structural and electrical engineering review",
      "PTO and interconnection documentation support",
    ],
  },
  {
    title: "Technology Edge",
    body: "Wattmonk uses digital tools and automation to improve execution quality. A standout example is Zippy, its semi-automated machine-learning-powered plan set tool, which reduces manual effort, speeds up output generation, and helps teams work more efficiently on both residential and commercial projects.",
  },
  {
    title: "Market Impact",
    body: "The company supports more than 20,000 homes each month in the US and maintains broad AHJ and utility coverage. This scale helps it streamline approvals, reduce delays, and create cost savings for solar businesses that need fast and reliable engineering support.",
  },
  {
    title: "Culture and Vision",
    body: "Wattmonk presents itself as a company built on sustainability, innovation, collaboration, and inclusion. Its culture emphasizes growth, flexibility, and long-term contribution to the clean energy transition.",
  },
];

function Layout({ children, isDarkMode, onToggleTheme }) {
  const themeClassName = isDarkMode ? "theme-dark" : "theme-light";

  return (
    <div className={`app-shell ${themeClassName}`}>
      <div className="hero-glow" aria-hidden="true" />

      <header className="topbar">
        <aside className="sidebar">
          <a className="brand" href="/">
            <span className="brand-mark">W</span>
            <span className="brand-text">Wattmonk AI</span>
          </a>

          <nav className="side-nav" aria-label="Primary">
            <NavLink to="/" end>
              Chat
            </NavLink>
            <NavLink to="/chat-summary">Chat Summary</NavLink>
            <NavLink to="/nec-about">NEC About</NavLink>
            <NavLink to="/wattmonk-about">Wattmonk About</NavLink>
            <NavLink to="/about">About Me</NavLink>
          </nav>

          <button
            type="button"
            className={`theme-toggle ${isDarkMode ? "is-dark" : "is-light"}`}
            onClick={onToggleTheme}
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <span className="toggle-track">
              <span className="toggle-thumb">
                <span className="toggle-icon toggle-sun" aria-hidden="true">
                  o
                </span>
                <span className="toggle-icon toggle-moon" aria-hidden="true">
                  c
                </span>
              </span>
            </span>
          </button>
        </aside>

        <main className="page-content">{children}</main>
      </header>
    </div>
  );
}

function parseStructuredText(text) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    const numberedLines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const isNumberedList =
      numberedLines.length > 1 &&
      numberedLines.every((line) => /^\d+\.\s+/.test(line));

    if (isNumberedList) {
      return {
        type: "list",
        items: numberedLines.map((line) => line.replace(/^\d+\.\s+/, "")),
      };
    }

    return {
      type: "paragraph",
      text: block,
    };
  });
}

function renderInlineBold(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (/^\*\*.*\*\*$/.test(part)) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function AnimatedAssistantText({ text, shouldAnimate }) {
  const [visibleText, setVisibleText] = useState(shouldAnimate ? "" : text);

  useEffect(() => {
    if (!shouldAnimate) {
      setVisibleText(text);
      return undefined;
    }

    let index = 0;
    setVisibleText("");

    const timer = window.setInterval(() => {
      index += Math.max(1, Math.ceil(text.length / 80));
      setVisibleText(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, 28);

    return () => window.clearInterval(timer);
  }, [text, shouldAnimate]);

  const blocks = useMemo(() => parseStructuredText(visibleText), [visibleText]);

  return (
    <div className="assistant-rich-text">
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <ol className="assistant-list" key={`${block.type}-${index}`}>
              {block.items.map((item) => (
                <li key={item}>{renderInlineBold(item)}</li>
              ))}
            </ol>
          );
        }

        return (
          <p className="assistant-paragraph" key={`${block.type}-${index}`}>
            {renderInlineBold(block.text)}
          </p>
        );
      })}
    </div>
  );
}

function SummaryDropdown({
  title,
  children,
  defaultOpen = true,
  delay = "0ms",
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <article
      className="info-section animated-rise dropdown-section"
      style={{ animationDelay: delay }}
    >
      <button
        type="button"
        className={`dropdown-toggle ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span>{title}</span>
        <span className="dropdown-icon" aria-hidden="true">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen ? <div className="dropdown-content">{children}</div> : null}
    </article>
  );
}

function ChatPage({
  messages,
  input,
  summary,
  isSending,
  error,
  onInputChange,
  onSendMessage,
  onPromptClick,
  onOpenSummaryPage,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isSending]);

  return (
    <section className="chat-page">
      <section className="chat-card chat-card-main" aria-label="Chat preview">
        <div className="chat-header">
          <div>
            <p className="chat-title">Conversation</p>
            <span className="chat-subtitle">
              Ask about NEC, Wattmonk, or general topics
            </span>
          </div>

          <button
            type="button"
            className="summary-button"
            onClick={onOpenSummaryPage}
          >
            Summarize Chat
          </button>
        </div>

        <div className="prompt-row">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="prompt-chip"
              onClick={() => onPromptClick(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="messages">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`message-row ${
                message.role === "user"
                  ? "message-user-row"
                  : "message-assistant-row"
              }`}
            >
              <div
                className={`message-bubble ${message.role === "user" ? "message-user" : "message-assistant"}`}
              >
                {message.role === "assistant" ? (
                  <AnimatedAssistantText
                    text={message.text}
                    shouldAnimate={
                      message.id === messages[messages.length - 1]?.id
                    }
                  />
                ) : (
                  <p>{message.text}</p>
                )}
                {message.source ? (
                  <small className="source-chip">{message.source}</small>
                ) : null}
              </div>
            </article>
          ))}

          {isSending ? (
            <article className="message-row message-assistant-row">
              <div className="message-bubble message-assistant">
                <div className="assistant-thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </article>
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        <div className="composer">
          <input
            type="text"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSendMessage();
              }
            }}
            placeholder="Ask about NEC, Wattmonk, or general topics..."
            disabled={isSending}
          />
          <button
            type="button"
            className="send-button"
            onClick={onSendMessage}
            disabled={isSending}
          >
            Send
          </button>
        </div>

        {error ? <div className="summary-panel">{error}</div> : null}
        {summary ? <div className="summary-panel">{summary}</div> : null}
      </section>
    </section>
  );
}

function ChatSummaryPage({ chatSummary, isLoading, error, onGenerateSummary }) {
  return (
    <section className="content-page">
      <div className="content-card about-document-card">
        <p className="eyebrow">Chat Summary</p>
        <h1 className="page-title">Conversation Summary</h1>
        <p className="page-intro">
          "A smarter summary built from the full conversation context."
        </p>

        <div className="summary-action-row">
          <button
            type="button"
            className="summary-button"
            onClick={onGenerateSummary}
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate Summary"}
          </button>
        </div>

        {error ? <div className="summary-panel">{error}</div> : null}

        {chatSummary ? (
          <div className="section-stack">
            <SummaryDropdown title="Topic" delay="0ms">
              <p>{chatSummary.topic || "No topic returned."}</p>
            </SummaryDropdown>

            <SummaryDropdown
              title="Important Questions or Problems"
              delay="90ms"
            >
              <div className="summary-list">
                {(chatSummary.questions_or_problems || []).map((item) => (
                  <article className="summary-item" key={item}>
                    <span className="summary-bullet" aria-hidden="true" />
                    <p>{item}</p>
                  </article>
                ))}
              </div>
            </SummaryDropdown>

            <SummaryDropdown title="Key Responses or Solutions" delay="160ms">
              <div className="summary-list">
                {(chatSummary.key_responses_or_solutions || []).map((item) => (
                  <article className="summary-item" key={item}>
                    <span className="summary-bullet" aria-hidden="true" />
                    <p>{item}</p>
                  </article>
                ))}
              </div>
            </SummaryDropdown>

            <SummaryDropdown title="Readable Summary" delay="230ms">
              <p>{chatSummary.summary || "No summary returned."}</p>
            </SummaryDropdown>
          </div>
        ) : (
          <div className="summary-panel">
            No summary generated yet. Click <strong>Generate Summary</strong> to
            send the prompt and chat history to the backend.
          </div>
        )}
      </div>
    </section>
  );
}

function AboutDocumentPage({ eyebrow, title, intro, highlights, sections }) {
  return (
    <section className="content-page">
      <div className="content-card about-document-card">
        <div className="about-hero">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="page-title">{title}</h1>
          <p className="page-intro">{intro}</p>
        </div>

        <div className="highlight-grid">
          {highlights.map((item, index) => (
            <article
              className="highlight-card animated-rise"
              key={item.label}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>

        <div className="section-stack">
          {sections.map((section, index) => (
            <article
              className="info-section animated-rise"
              key={section.title}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <h2>{section.title}</h2>
              {section.body ? <p>{section.body}</p> : null}
              {section.points ? (
                <div className="summary-list">
                  {section.points.map((point) => (
                    <article className="summary-item" key={point}>
                      <span className="summary-bullet" aria-hidden="true" />
                      <p>{point}</p>
                    </article>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <section className="content-page">
      <div className="content-card about-document-card">
        <div className="about-profile-hero">
          <div className="profile-photo-ring animated-rise">
            <img
              className="profile-photo"
              src={profilePhoto}
              alt="Rishabh Bisht"
            />
          </div>

          <div className="about-profile-copy">
            <p className="eyebrow">About Me</p>
            <h1 className="page-title">Rishabh Bisht</h1>
            <p className="page-intro">
              Computer Science Engineering student with strong experience in
              AI-powered applications, automation, and full-stack development. I
              build practical products with Python, JavaScript, React.js, modern
              LLM APIs, and real-world AI workflows.
            </p>

            <div
              className="link-row animated-rise"
              style={{ animationDelay: "90ms" }}
            >
              <a href="mailto:rishabhbisht.uk12@gmail.com">Email</a>
              <a href="https://github.com/" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="section-stack">
          <article
            className="info-section animated-rise"
            style={{ animationDelay: "120ms" }}
          >
            <h2>Professional Summary</h2>
            <p>
              I enjoy building AI systems that are useful, interactive, and
              technically clear. My work includes LLM-based apps, prompt
              engineering, retrieval-augmented workflows, automation tools, and
              responsive full-stack interfaces designed for real use cases.
            </p>
          </article>

          <article
            className="info-section animated-rise"
            style={{ animationDelay: "180ms" }}
          >
            <h2>Skills and Tools</h2>
            <div className="summary-list">
              <article className="summary-item">
                <span className="summary-bullet" aria-hidden="true" />
                <p>
                  <strong>Programming:</strong> Python, JavaScript (ES6+),
                  HTML5, CSS3
                </p>
              </article>
              <article className="summary-item">
                <span className="summary-bullet" aria-hidden="true" />
                <p>
                  <strong>AI and LLM:</strong> LangChain, OpenAI API, Google
                  Gemini API, RAG, prompt engineering, LLM agents
                </p>
              </article>
              <article className="summary-item">
                <span className="summary-bullet" aria-hidden="true" />
                <p>
                  <strong>Frameworks:</strong> React.js, Tailwind CSS, Django,
                  Flask, FastAPI, REST APIs
                </p>
              </article>
              <article className="summary-item">
                <span className="summary-bullet" aria-hidden="true" />
                <p>
                  <strong>Databases and Core:</strong> MongoDB, PostgreSQL,
                  Qdrant, DSA, OOP, debugging, responsive design, problem
                  solving
                </p>
              </article>
            </div>
          </article>

          <article
            className="info-section animated-rise"
            style={{ animationDelay: "240ms" }}
          >
            <h2>Projects</h2>
            <div className="summary-list">
              <article className="summary-item">
                <span className="summary-bullet" aria-hidden="true" />
                <p>
                  <strong>DSA Instructor using AI:</strong> Built a Flask-based
                  AI web app for interactive DSA learning with Gemini-powered
                  explanations and structured code responses.
                </p>
              </article>
              <article className="summary-item">
                <span className="summary-bullet" aria-hidden="true" />
                <p>
                  <strong>AI Command Execution Agent:</strong> Developed an AI
                  agent that plans tasks, executes terminal commands, and
                  generates or edits project files using structured outputs and
                  automation loops.
                </p>
              </article>
              <article className="summary-item">
                <span className="summary-bullet" aria-hidden="true" />
                <p>
                  <strong>Snake Game by AI Agent:</strong> Demonstrated
                  autonomous project generation by using a custom AI coding
                  agent to create a browser game with gameplay, scoring, and
                  collision handling.
                </p>
              </article>
            </div>
          </article>

          <article
            className="info-section animated-rise"
            style={{ animationDelay: "300ms" }}
          >
            <h2>Education</h2>
            <div className="summary-list">
              <article className="summary-item">
                <span className="summary-bullet" aria-hidden="true" />
                <p>
                  <strong>B.Tech in Computer Science and Engineering</strong>{" "}
                  (2023 - 2026), Invertis University, Bareilly
                </p>
              </article>
              <article className="summary-item">
                <span className="summary-bullet" aria-hidden="true" />
                <p>
                  <strong>Diploma in Computer Science and Engineering</strong>{" "}
                  (2020 - 2023), Invertis University, Bareilly
                </p>
              </article>
            </div>
          </article>

          <article
            className="info-section animated-rise"
            style={{ animationDelay: "360ms" }}
          >
            <h2>Work Style</h2>
            <p>
              I like combining engineering clarity with experimentation. My
              focus is on building tools that are not only technically solid,
              but also useful in real workflows, especially around AI agents,
              automation, and intelligent user interfaces.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function App() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatSummary, setChatSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  async function handleSendMessage() {
    const trimmedInput = input.trim();

    if (!trimmedInput || isSending) {
      return;
    }

    const newUserMessage = {
      id: Date.now(),
      role: "user",
      text: trimmedInput,
    };

    const nextMessages = [...messages, newUserMessage];
    const chatHistory = nextMessages.map((message) => ({
      role: message.role,
      text: message.text,
    }));

    setMessages(nextMessages);
    setInput("");
    setChatError("");
    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedInput,
          chat_history: chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const reply =
        data.reply ??
        data.response ??
        data.answer ??
        data.message ??
        "The backend returned a response, but no reply text was found.";
      const source = data.source ?? data.intent ?? "";

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: typeof reply === "string" ? reply : JSON.stringify(reply),
          source: source ? String(source) : undefined,
        },
      ]);
    } catch (requestError) {
      setChatError("Unable to reach the FastAPI chat endpoint right now.");
    } finally {
      setIsSending(false);
    }
  }

  function handleSummarizeChat() {
    setSummary(
      messages
        .filter((message) => message.role === "assistant")
        .slice(-2)
        .map((message) => message.text)
        .join(" "),
    );
  }

  function handleOpenSummaryPage() {
    navigate("/chat-summary");
  }

  async function handleGenerateChatSummary() {
    setIsSummaryLoading(true);
    setSummaryError("");

    try {
      const response = await fetch(`${API_BASE_URL}/chat-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: CHAT_SUMMARY_PROMPT,
          chat_history: messages.map((message) => ({
            role: message.role,
            text: message.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setChatSummary(data);
    } catch (requestError) {
      setSummaryError(
        "Unable to fetch chat summary from /chat-summary right now.",
      );
    } finally {
      setIsSummaryLoading(false);
    }
  }

  return (
    <Layout
      isDarkMode={isDarkMode}
      onToggleTheme={() => setIsDarkMode((currentValue) => !currentValue)}
    >
      <Routes>
        <Route
          path="/"
          element={
            <ChatPage
              messages={messages}
              input={input}
              summary={summary}
              isSending={isSending}
              error={chatError}
              onInputChange={setInput}
              onSendMessage={handleSendMessage}
              onPromptClick={setInput}
              onOpenSummaryPage={handleOpenSummaryPage}
            />
          }
        />
        <Route
          path="/chat-summary"
          element={
            <ChatSummaryPage
              chatSummary={chatSummary}
              isLoading={isSummaryLoading}
              error={summaryError}
              onGenerateSummary={handleGenerateChatSummary}
            />
          }
        />
        <Route
          path="/nec-about"
          element={
            <AboutDocumentPage
              eyebrow="NEC About"
              title="National Electrical Code (2017)"
              intro="A structured, safety-focused electrical standard that guides installation quality, protection practices, and code compliance across electrical systems."
              highlights={necHighlights}
              sections={necSections}
            />
          }
        />
        <Route
          path="/wattmonk-about"
          element={
            <AboutDocumentPage
              eyebrow="Wattmonk About"
              title="Wattmonk Information"
              intro="A modern solar engineering and technology company focused on accelerating solar project workflows through speed, automation, and operational clarity."
              highlights={wattmonkHighlights}
              sections={wattmonkSections}
            />
          }
        />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
