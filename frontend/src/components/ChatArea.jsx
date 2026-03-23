import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

const OCSDataPanel = ({ ocsData }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    if (!ocsData || (!ocsData.ocs_input && !ocsData.ocs_output)) {
        return null;
    }

    return (
        <div className="mt-4 border border-blue-200 rounded-lg overflow-hidden bg-blue-50">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-2 flex items-center justify-between bg-blue-100 hover:bg-blue-150 transition-colors"
            >
                <span className="text-sm font-medium text-blue-900 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                    OCS Context Data
                </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isExpanded && (
                <div className="p-4 space-y-4">
                    {ocsData.ocs_input && (
                        <div>
                            <h4 className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 11 12 14 22 4" />
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                </svg>
                                OCS Input Context
                            </h4>
                            <pre className="text-xs bg-white p-3 rounded border border-blue-200 overflow-x-auto text-gray-700 whitespace-pre-wrap">
                                {typeof ocsData.ocs_input === 'string' ? ocsData.ocs_input : JSON.stringify(ocsData.ocs_input, null, 2)}
                            </pre>
                        </div>
                    )}

                    {ocsData.ocs_output && (
                        <div>
                            <h4 className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                                OCS Output Summary
                            </h4>
                            <pre className="text-xs bg-white p-3 rounded border border-blue-200 overflow-x-auto text-gray-700 whitespace-pre-wrap">
                                {typeof ocsData.ocs_output === 'string' ? ocsData.ocs_output : JSON.stringify(ocsData.ocs_output, null, 2)}
                            </pre>
                        </div>
                    )}

                    {ocsData.workflow && ocsData.workflow.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="2" x2="12" y2="6" />
                                    <line x1="12" y1="18" x2="12" y2="22" />
                                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                                    <line x1="2" y1="12" x2="6" y2="12" />
                                    <line x1="18" y1="12" x2="22" y2="12" />
                                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                                </svg>
                                Workflow Executed
                            </h4>
                            <pre className="text-xs bg-white p-3 rounded border border-blue-200 overflow-x-auto text-gray-700">
                                {JSON.stringify(ocsData.workflow, null, 2)}
                            </pre>
                        </div>
                    )}

                    {ocsData.results && ocsData.results.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                                Tool Results
                            </h4>
                            <pre className="text-xs bg-white p-3 rounded border border-blue-200 overflow-x-auto text-gray-700">
                                {JSON.stringify(ocsData.results, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const filterContent = (content) => {
    if (!content) return content;
    
    // Regex to remove SLA Violations and Topology Interpretation sections
    // Matches headers like "### SLA Violations", "**SLA Violations:**", "SLA Violations:", etc.
    // Stops at the next major section (double newline, another header, or end of string)
    let filtered = content;
    
    const sectionsToHide = [
        "SLA Violations",
        "Topology Interpretation"
    ];

    sectionsToHide.forEach(section => {
        // This regex looks for:
        // 1. Optional newline or start of string
        // 2. Optional markdown header symbols (#) or bold (**)
        // 3. The section name
        // 4. Optional colon or closing bold (**)
        // 5. Any content until a double newline, another header (### or **Header**), or end of string
        const regex = new RegExp(`(?:^|\\n)(?:#+\\s*|\\*\\*|)?${section}:?(\\*\\*)?[\\s\\S]*?(?=\\n\\n|\\n(?:#+|\\*\\*[A-Z])|\\s*$)`, 'gi');
        filtered = filtered.replace(regex, '');
    });

    return filtered.trim();
};

const Message = ({ message, botLogo }) => {
    const isBot = message.role === 'bot';
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayContent = isBot ? filterContent(message.content) : message.content;

    return (
        <div className={`flex gap-4 p-6 ${isBot ? 'bg-gray-50' : 'bg-white'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isBot ? 'bg-blue-100 border border-blue-200' : 'bg-gray-200'}`}>
                {isBot ? (
                    botLogo ? <img src={botLogo} alt="Bot" className="w-full h-full rounded-full object-cover" /> : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                            <path d="M12 8V4H8" />
                            <rect width="16" height="12" x="4" y="8" rx="2" />
                            <path d="M2 14h2" />
                            <path d="M20 14h2" />
                            <path d="M15 13v2" />
                            <path d="M9 13v2" />
                        </svg>
                    )
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                )}
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                        {isBot ? 'AI Agent' : 'You'}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isBot && (
                            <button
                                onClick={handleCopy}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy response"
                            >
                                {copied ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                    </svg>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="prose prose-blue max-w-none text-gray-800 text-sm leading-relaxed">
                    <ReactMarkdown>{displayContent}</ReactMarkdown>
                </div>

                {isBot && message.ocs_data && <OCSDataPanel ocsData={message.ocs_data} />}
            </div>
        </div>
    );
};

const ChatArea = ({ messages, loading, botLogo }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    return (
        <div className="flex-1 overflow-y-auto bg-white scroll-smooth">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                            <path d="M12 8V4H8" />
                            <rect width="16" height="12" x="4" y="8" rx="2" />
                            <path d="M2 14h2" />
                            <path d="M20 14h2" />
                            <path d="M15 13v2" />
                            <path d="M9 13v2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">How can I help you today?</h3>
                    <p className="max-w-md text-sm">
                        I'm your Time Series AI Agent. Ask me about your data, metrics, or help me analyze trends.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col min-h-full">
                    {messages.map((msg, idx) => (
                        <Message key={idx} message={msg} botLogo={botLogo} />
                    ))}

                    {loading && (
                        <div className="flex gap-4 p-6 bg-gray-50 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                    <path d="M12 8V4H8" />
                                    <rect width="16" height="12" x="4" y="8" rx="2" />
                                    <path d="M2 14h2" />
                                    <path d="M20 14h2" />
                                    <path d="M15 13v2" />
                                    <path d="M9 13v2" />
                                </svg>
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            )}
        </div>
    );
};

export default ChatArea;
