// Fix: Import React to resolve 'Cannot find name 'React''.
import React from 'react';
// Fix: Import ReactDOM from 'react-dom/client' for the new createRoot API.
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// Fix: Declare showdown to resolve 'Cannot find name 'showdown''.
declare var showdown: any;

const App = () => {
    const [webpageContent, setWebpageContent] = React.useState('');
    const [generatedEmail, setGeneratedEmail] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [isThinkingMode, setIsThinkingMode] = React.useState(false);

    const handleGenerate = async () => {
        if (!webpageContent.trim()) {
            setError('Please paste the webpage content first.');
            return;
        }

        setIsLoading(true);
        setError('');
        setGeneratedEmail('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `
Act as a super creative, world-class Email Deliverability Architect, A/B Testing Content Specialist, and master direct response copywriter. I need you to think outside the box and generate truly unique and compelling copy.

I will strictly adhere to the following principles:

Sender Name: MUST be exactly two distinct words that are highly relevant to the core offer or benefit. This 2-word phrase must be creative, impactful, and followed by the brand/domain name. Avoid generic terms.
Subject Line: Intrigue/curiosity-driven, not sales-driven, max 50 chars, no spam words.
Content: Conversational, American market tone, AIDA structure, human-focused benefits, and under 150 words.
Spam-Proofing: Zero risky terms, excessive punctuation, or capitalization.

Your Structured Output MUST be in Markdown format as specified below:

### 1️⃣ Expert Technical & Content Analysis
| Section | Diagnosis |
|---|---|
| Spam Trigger Diagnosis | [List of risky/banned terms found or "None found."] |
| Technical Health Check | [Evaluation of image-to-text ratio, HTML bloat, link density.] |
| ISP Policy Red Flags | [Identification of deceptive urgency, hype, or domain inconsistency.] |
| A-to-B Gap Analysis | [Feature-to-Benefit transformation analysis.] |
| Clarity & Tone Audit | [Assessment of tone for American audience: conversational vs. corporate.] |

### 2️⃣ The Optimized Email Version
| Element | Optimization Goal | Output |
|---|---|---|
| Sender Name | Generate a primary sender name and 2 strong alternatives. Each must be exactly 2 distinct, offer-relevant words + Brand/Domain. | **Primary:** [Primary Suggestion]<br>*Rationale:* [Brief explanation of why it's strong]<br><br>**Alternatives:**<br>1. [Alternative 1]<br>2. [Alternative 2] |
| Subject Line (Primary) | Max 50 chars, 5–7 words. Intrigue/Curiosity-driven | [New Subject Line] |
| Preheader/Snippet | Reinforce SL, context/curiosity hook | [Optimized Preheader] |
| Body Copy | ≤150 words, 3–5 paras, AIDA, human-benefit focus | [Optimized Body Copy] |
| Call-to-Action (CTA) | Suggest 2-3 distinct, benefit-oriented options. | 1. [CTA Option 1 + Placeholder Link]<br>2. [CTA Option 2 + Placeholder Link]<br>3. [CTA Option 3 + Placeholder Link] |
| Closing & Signature | Conversational, warm sign-off from a real name | [Optimized Closing] |

### 3️⃣ Final Deliverability & Accessibility Checklist
- ✅ Mobile-First Scannability: Met
- ✅ Accessibility (A11Y) Ready: Met
- ✅ Spam-Proofing: Met
- ✅ Clear Value in 2 Sentences: Met

---
Here is the webpage content to analyze:

${webpageContent}
`;

            const config: { thinkingConfig?: { thinkingBudget: number } } = {};
            if (isThinkingMode) {
                config.thinkingConfig = { thinkingBudget: 32768 };
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config,
            });

            setGeneratedEmail(response.text);

        } catch (err) {
            console.error(err);
            setError('An error occurred while generating the email. Please check the console and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const ResultDisplay = ({ content }) => {
        if (!content) return null;
        
        const sections = content.split('### ').slice(1);

        const converter = new showdown.Converter({ tables: true, simpleLineBreaks: true, strikethrough: true });
        
        return (
            <div className="results-section">
                {sections.map((section, index) => {
                    const titleEndIndex = section.indexOf('\n');
                    const title = titleEndIndex !== -1 ? section.substring(0, titleEndIndex).trim() : `Section ${index + 1}`;
                    const body = titleEndIndex !== -1 ? section.substring(titleEndIndex + 1).trim() : section;
                    
                    const htmlContent = converter.makeHtml(body);

                    return (
                        <div key={index} className="result-card">
                            <h2>{title}</h2>
                            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                        </div>
                    );
                })}
            </div>
        );
    };


    return (
        <div className="container">
            <header className="header">
                 <div className="icon">📧</div>
                <h1>AI Email Expert</h1>
                <p>Paste your webpage content below and our AI will act as an Email Deliverability Architect and Content Specialist to craft the perfect email.</p>
            </header>

            <main>
                <div className="input-section">
                    <textarea
                        className="textarea"
                        value={webpageContent}
                        onChange={(e) => setWebpageContent(e.target.value)}
                        placeholder="Paste your product, service, or offer webpage content here..."
                        aria-label="Webpage content input"
                        disabled={isLoading}
                    />
                     <div className="thinking-mode-toggle">
                        <label htmlFor="thinking-mode">
                            <strong>Enable Deep Thinking Mode</strong>
                            <span>For highly complex content, our AI will take more time to perform a deeper, more creative analysis.</span>
                        </label>
                        <div className="toggle-switch">
                            <input
                                type="checkbox"
                                id="thinking-mode"
                                checked={isThinkingMode}
                                onChange={() => setIsThinkingMode(!isThinkingMode)}
                                disabled={isLoading}
                            />
                            <span className="slider"></span>
                        </div>
                    </div>
                    <div className="button-group">
                        <button className="btn" onClick={handleGenerate} disabled={isLoading}>
                            {isLoading ? 'Generating...' : 'Generate Email'}
                        </button>
                        {generatedEmail && (
                             <button className="btn" onClick={handleGenerate} disabled={isLoading}>
                                Regenerate
                            </button>
                        )}
                    </div>
                </div>
                
                {isLoading && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Analyzing content and crafting your email... This may take a moment.</p>
                    </div>
                )}

                {error && <div className="error">{error}</div>}
                
                <ResultDisplay content={generatedEmail} />
            </main>
            
            <footer className="footer">
                <p>Powered by Gemini</p>
            </footer>
        </div>
    );
};

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);