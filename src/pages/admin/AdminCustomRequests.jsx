import { useState, useEffect } from 'react'
import { customRequestService } from '../../services/customRequestService'
import '../styles/pages.css'

function AdminCustomRequests() {
  const [customRequests, setCustomRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [priceInput, setPriceInput] = useState({})
  const [priceMessage, setPriceMessage] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    loadCustomRequests()
  }, [])

  const loadCustomRequests = async () => {
    try {
      setLoading(true)
      const requests = await customRequestService.getAllCustomRequests()
      setCustomRequests(requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      setError(null)
    } catch (err) {
      setError('Failed to load custom requests')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await customRequestService.updateCustomRequestStatus(requestId, newStatus)
      setCustomRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      )
    } catch (err) {
      setError('Failed to update status')
      console.error(err)
    }
  }

  const handleArchiveToggle = async (requestId, isArchived) => {
    try {
      const newStatus = isArchived ? 'approved' : 'archived'
      await customRequestService.updateCustomRequestStatus(requestId, newStatus)
      setCustomRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      )
      setError(null)
    } catch (err) {
      setError('Failed to update request')
      console.error(err)
    }
  }

  const handleSetPrice = async (requestId, price) => {
    if (!price || isNaN(price) || parseFloat(price) < 0) {
      setError('Please enter a valid price')
      return
    }

    try {
      setPriceMessage('')
      await customRequestService.updateCustomRequestPrice(requestId, parseFloat(price))
      setCustomRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, price: parseFloat(price) } : req
        )
      )
      setPriceInput(prev => ({ ...prev, [requestId]: '' }))
      setPriceMessage(`Price set successfully for request ${requestId}`)
      setTimeout(() => setPriceMessage(''), 3000)
    } catch (err) {
      setError('Failed to set price')
      console.error(err)
    }
  }

  const filteredRequests = customRequests.filter(req => {
    const isArchived = req.status === 'archived'
    if (showArchived) {
      return isArchived
    }
    return filterStatus === 'all' ? !isArchived : (req.status === filterStatus && !isArchived)
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#fbbf24'
      case 'approved':
        return '#10b981'
      case 'rejected':
        return '#ef4444'
      case 'archived':
        return '#9ca3af'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="section-header">
          <h1>Custom Requests</h1>
        </div>

        <div className="filter-section">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${!showArchived && filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => { setFilterStatus('all'); setShowArchived(false); }}
            >
              All ({customRequests.filter(r => r.status !== 'archived').length})
            </button>
            <button
              className={`filter-btn ${!showArchived && filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => { setFilterStatus('pending'); setShowArchived(false); }}
            >
              Pending ({customRequests.filter(r => r.status === 'pending').length})
            </button>
            <button
              className={`filter-btn ${!showArchived && filterStatus === 'approved' ? 'active' : ''}`}
              onClick={() => { setFilterStatus('approved'); setShowArchived(false); }}
            >
              Approved ({customRequests.filter(r => r.status === 'approved').length})
            </button>
            <button
              className={`filter-btn ${!showArchived && filterStatus === 'rejected' ? 'active' : ''}`}
              onClick={() => { setFilterStatus('rejected'); setShowArchived(false); }}
            >
              Rejected ({customRequests.filter(r => r.status === 'rejected').length})
            </button>
          </div>
          <button
            className={`filter-btn archive-btn ${showArchived ? 'active' : ''}`}
            onClick={() => setShowArchived(!showArchived)}
          >
            📦 Archived ({customRequests.filter(r => r.status === 'archived').length})
          </button>
        </div>

        {loading && <div className="loading">Loading custom requests...</div>}
        {error && <div className="error">{error}</div>}
        {priceMessage && <div className="success" style={{ marginBottom: '1rem' }}>{priceMessage}</div>}

        {!loading && filteredRequests.length === 0 && (
          <div className="empty-state">
            <p>No custom requests found.</p>
          </div>
        )}

        {!loading && filteredRequests.length > 0 && (
          <div className="requests-grid">
            {filteredRequests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="request-title">
                    <h3>{request.customerName}</h3>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(request.status) }}
                    >
                      {request.status}
                    </span>
                  </div>
                  <button
                    className="expand-btn"
                    onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                  >
                    {expandedId === request.id ? '−' : '+'}
                  </button>
                </div>

                <div className="request-meta">
                  <p><strong>Email:</strong> {request.customerEmail}</p>
                  <p><strong>Phone:</strong> {request.customerPhone}</p>
                  <p><strong>Date:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                  {request.price && (
                    <p><strong>Price:</strong> {request.price} LE</p>
                  )}
                </div>

                {expandedId === request.id && (
                  <div className="request-details">
                    {request.description && (
                      <div className="detail-section">
                        <h4>Description</h4>
                        <p>{request.description}</p>
                      </div>
                    )}

                    {request.textToAdd && (
                      <div className="detail-section">
                        <h4>Text to Add</h4>
                        <p>{request.textToAdd}</p>
                      </div>
                    )}

                    {request.colors && (
                      <div className="detail-section">
                        <h4>Colors</h4>
                        <p>{request.colors}</p>
                      </div>
                    )}

                    {request.image && (
                      <div className="detail-section">
                        <h4>Uploaded Image</h4>
                        <img src={request.image} alt="Customer upload" className="request-image" />
                      </div>
                    )}

                    {request.status !== 'rejected' && request.status !== 'archived' && (
                      <div className={`price-section ${!request.price ? 'price-required' : 'price-set'}`}>
                        <h4>
                          Set Price
                          {!request.price && <span className="price-required-badge">Required to Approve</span>}
                          {request.price && <span className="price-set-badge">✓ Price Set</span>}
                        </h4>
                        {request.price && (
                          <p className="current-price">Current Price: <strong>{request.price} LE</strong></p>
                        )}
                        <div className="price-input-group">
                          <input
                            type="number"
                            placeholder="Enter price in LE"
                            value={priceInput[request.id] || ''}
                            onChange={(e) => setPriceInput(prev => ({ ...prev, [request.id]: e.target.value }))}
                            className="price-input"
                            min="0"
                            step="0.01"
                          />
                          <button
                            onClick={() => handleSetPrice(request.id, priceInput[request.id])}
                            className="btn-primary"
                            style={{ padding: '0.65rem 1.5rem' }}
                          >
                            Set Price
                          </button>
                        </div>
                      </div>
                    )}

                    {request.status === 'archived' ? (
                      <div className="request-actions">
                        <button
                          onClick={() => handleArchiveToggle(request.id, true)}
                          className="btn-unarchive"
                        >
                          Unarchive Request
                        </button>
                      </div>
                    ) : (
                      <div className="request-actions">
                        <select
                          value={request.status}
                          onChange={(e) => {
                            if (e.target.value === 'approved' && !request.price) {
                              setError('Please set a price before approving this request')
                              return
                            }
                            handleStatusChange(request.id, e.target.value)
                          }}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved" disabled={!request.price}>
                            {request.price ? 'Approved' : 'Approved (Set Price First)'}
                          </option>
                          <option value="rejected">Rejected</option>
                        </select>
                        {request.status === 'approved' && (
                          <button
                            onClick={() => handleArchiveToggle(request.id, false)}
                            className="btn-archive"
                          >
                            Archive Request
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCustomRequests
