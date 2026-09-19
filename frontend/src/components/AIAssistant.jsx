import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Welcome to **NEXORA Concierge**. I am your personal AI shopping stylist powered by autonomous catalog intelligence.\n\nHow can I curate your wardrobe or assist your shopping today?',
      suggestions: [
        '✨ Minimalist Autumn & Winter Edit',
        '🧥 Merino Wool Overshirt & Outerwear',
        '👟 Italian Leather Sneakers',
        '⌚ Luxury Chronographs & Accessories',
        '⚡ How does Crypto (ETH) payment work?'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const queryText = (textToSend || input).trim();
    if (!queryText) return;

    // Add user message
    const userMsg = { role: 'user', text: queryText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const lower = queryText.toLowerCase();

      if (lower.includes('crypto') || lower.includes('web3') || lower.includes('eth') || lower.includes('ethereum') || lower.includes('wallet')) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `### Seamless Web3 Checkout\n\nNEXORA enables verified on-chain payments:\n\n1. Add your selections to your shopping bag and proceed to **Checkout**.\n2. Under payment options, select **"Pay with Crypto (ETH)"**.\n3. Connect your **MetaMask** or EVM-compatible wallet.\n4. Authorize the transfer in Ethereum (Sepolia / Mainnet).\n5. Our system confirms the on-chain hash instantly with zero intermediary gateway fees.`
          }
        ]);
      } else if (lower.includes('order') || lower.includes('track') || lower.includes('status')) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `You can monitor live fulfillment and download PDF tax receipts directly from your **Profile & Order History**.\n\nAll orders over ₹5,000 qualify for complimentary insured express dispatch.`
          }
        ]);
      } else if (lower.includes('watch') || lower.includes('chronograph') || lower.includes('accessory') || lower.includes('accessories')) {
        const res = await api.getProducts({ category: 'accessories', limit: 3 });
        const items = res?.data?.products || [];
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `Here are handpicked luxury timepieces and leather accessories from our curated collection:`,
            products: items
          }
        ]);
      } else if (lower.includes('shirt') || lower.includes('overshirt') || lower.includes('coat') || lower.includes('trench') || lower.includes('jacket') || lower.includes('fashion') || lower.includes('cloth') || lower.includes('autumn') || lower.includes('winter')) {
        const res = await api.getProducts({ category: 'fashion', limit: 4 });
        const items = res?.data?.products || [];
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `Here are essential minimalist fashion pieces tailored for contemporary living:`,
            products: items
          }
        ]);
      } else if (lower.includes('sneaker') || lower.includes('shoe') || lower.includes('footwear')) {
        const res = await api.getProducts({ search: 'sneaker', limit: 3 });
        const items = res?.data?.products || [];
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `Found handcrafted footwear crafted with Italian Nappa leather:`,
            products: items
          }
        ]);
      } else if (lower.includes('headphone') || lower.includes('audio') || lower.includes('tech') || lower.includes('sound')) {
        const res = await api.getProducts({ search: 'headphone', limit: 3 });
        const items = res?.data?.products || [];
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `Here are our flagship acoustic devices and noise-cancelling equipment:`,
            products: items
          }
        ]);
      } else {
        // General catalog search
        const cleanQuery = queryText.replace(/^[✨🧥👟⌚⚡\s]+/, '').trim();
        const res = await api.getProducts({ search: cleanQuery, limit: 3 });
        const items = res?.data?.products || [];
        if (items.length > 0) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: `I discovered ${items.length} curated matches for "${queryText}":`,
              products: items
            }
          ]);
        } else {
          // Fallback: Show featured products
          const featuredRes = await api.getProducts({ featured: true, limit: 3 });
          const items = featuredRes?.data?.products || [];
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: `While I couldn't find an exact match for "${queryText}", you might appreciate these iconic pieces currently trending:`,
              products: items
            }
          ]);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `My apologies, I had trouble querying the catalog: ${err.message}`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ai-assistant-toggle shadow-lg"
        aria-label="Toggle NEXORA AI Concierge"
        title="NEXORA AI Stylist & Concierge"
      >
        <span className="ai-toggle-pulse"></span>
        <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-stars'} ai-toggle-icon`}></i>
        {!isOpen && <span className="ai-toggle-label d-none d-md-inline ms-2 fw-medium">AI Concierge</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <aside className="ai-chat-window animate__animated animate__fadeInUp" aria-label="NEXORA AI Stylist & Concierge">
          {/* Header */}
          <div className="ai-chat-header d-flex justify-content-between align-items-center p-3 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <div className="ai-header-avatar">
                <i className="bi bi-stars"></i>
              </div>
              <div>
                <h6 className="ai-header-title mb-0">NEXORA CONCIERGE</h6>
                <div className="ai-header-status d-flex align-items-center gap-1">
                  <span className="ai-status-dot"></span>
                  <span>Personal AI Stylist & Shopping Assistant</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-sm btn-link text-secondary p-1 border-0"
              aria-label="Close Concierge"
            >
              <i className="bi bi-dash-lg fs-5"></i>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="ai-chat-body flex-grow-1 p-3 overflow-y-auto d-flex flex-column gap-3">
            {messages.map((m, idx) => (
              <div key={idx} className={`d-flex flex-column ${m.role === 'user' ? 'align-items-end' : 'align-items-start'}`}>
                <div className={`ai-message-bubble ${m.role === 'user' ? 'ai-user-bubble' : 'ai-assistant-bubble'}`}>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.55' }}>
                    {m.text}
                  </div>

                  {/* Render Product Cards inside AI response if returned */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 d-flex flex-column gap-2">
                      {m.products.map((p) => (
                        <Link
                          key={p.id}
                          to={`/products/${p.slug || p.id}`}
                          onClick={() => setIsOpen(false)}
                          className="ai-product-card d-flex align-items-center gap-3 p-2 rounded text-decoration-none"
                        >
                          <div className="ai-product-thumb-wrap flex-shrink-0">
                            <img
                              src={p.primary_image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                              alt={p.name}
                              className="ai-product-thumb"
                            />
                          </div>
                          <div className="min-w-0 flex-grow-1">
                            <span className="ai-product-name text-truncate d-block">
                              {p.name}
                            </span>
                            <div className="d-flex align-items-center gap-2 mt-1">
                              <span className="ai-product-price">
                                ₹{Number(p.price).toLocaleString('en-IN')}
                              </span>
                              {p.eth_price && (
                                <span className="ai-product-eth text-secondary">
                                  {Number(p.eth_price).toFixed(3)} ETH
                                </span>
                              )}
                            </div>
                          </div>
                          <i className="bi bi-arrow-right text-secondary small me-1"></i>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggestions Pill Chips */}
                {m.suggestions && (
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {m.suggestions.map((s, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(s)}
                        className="ai-suggestion-chip"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="ai-typing-indicator d-flex align-items-center gap-2 p-2 text-secondary small">
                <div className="spinner-grow spinner-grow-sm text-dark" role="status" style={{ width: '0.6rem', height: '0.6rem' }}></div>
                <span>Curating recommendations from NEXORA catalog...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="ai-chat-footer p-3 border-top d-flex gap-2 align-items-center"
          >
            <input
              type="text"
              className="form-control ai-chat-input"
              placeholder="Ask for styling advice, pieces, or Web3 info..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="btn ai-send-button"
              aria-label="Send message"
            >
              <i className="bi bi-arrow-up"></i>
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
