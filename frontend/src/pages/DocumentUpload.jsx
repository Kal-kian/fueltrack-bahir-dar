import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import OwnerHeader from '../components/OwnerHeader'
import Footer from '../components/Footer'

export default function DocumentUpload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [fetching, setFetching] = useState(true)
  const [documents, setDocuments] = useState({
    businessLicense: null,
    taxId: null,
    idDocument: null,
    verificationStatus: null,
    isVerified: false,
    rejectionReason: null
  })
  const [fullScreenImage, setFullScreenImage] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setFetching(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/users/verification-status`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setDocuments({
        businessLicense: res.data.businessLicense || null,
        taxId: res.data.taxId || null,
        idDocument: res.data.idDocument || null,
        verificationStatus: res.data.verificationStatus || null,
        isVerified: res.data.isVerified || false,
        rejectionReason: res.data.rejectionReason || null
      })
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setFetching(false)
    }
  }

  const hasDocument = (doc) => {
    if (!doc) return false
    if (doc === 'null' || doc === 'undefined') return false
    if (doc === '' || doc === '""') return false
    return true
  }

  const isBase64 = (data) => {
    if (!data) return false
    if (data.startsWith('/9j/')) return true
    if (data.length > 200 && !data.startsWith('/uploads')) return true
    return false
  }

  const getDocumentSrc = (data) => {
    if (!data) return null
    if (isBase64(data)) {
      return `data:image/png;base64,${data}`
    }
    if (data.startsWith('/uploads')) {
      const baseUrl = API_URL.replace('/api', '')
      return `${baseUrl}${data}`
    }
    if (data.startsWith('http://') || data.startsWith('https://')) {
      return data
    }
    return data
  }

  const DocumentViewer = ({ title, icon, imageData }) => {
    const [imgError, setImgError] = useState(false)
    const [imgLoading, setImgLoading] = useState(true)
    
    const docExists = hasDocument(imageData)
    const imageSrc = getDocumentSrc(imageData)

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-xl">{icon}</span> {title}
          </h3>
          <span className={`text-xs px-2 py-1 rounded ${
            docExists && !imgError 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-400'
          }`}>
            {docExists && !imgError ? '✅ Uploaded' : 'Not Uploaded'}
          </span>
        </div>
        
        <div className="p-4">
          {!docExists ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <span className="text-6xl mb-3 opacity-40">{icon}</span>
              <p className="text-sm font-medium text-gray-500">No {title} uploaded</p>
            </div>
          ) : imgError ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50 rounded-lg">
              <span className="text-4xl mb-2">⚠️</span>
              <p className="text-sm text-gray-500">Could not load document</p>
            </div>
          ) : (
            <div>
              {imgLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              <img 
                src={imageSrc}
                alt={title}
                className={`w-full max-h-64 object-contain rounded border ${imgLoading ? 'hidden' : 'block'}`}
                onLoad={() => setImgLoading(false)}
                onError={() => {
                  setImgError(true)
                  setImgLoading(false)
                }}
              />
              <div className="mt-3">
                <button
                  onClick={() => {
                    setFullScreenImage({ 
                      data: imageData, 
                      title: title,
                      isBase64: isBase64(imageData)
                    })
                  }}
                  className="text-sm bg-primary text-white px-4 py-1.5 rounded hover:bg-primary-light transition"
                >
                  🔍 View Full Screen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ✅ Header */}
      <OwnerHeader />

      {/* ✅ Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">📄 My Documents</h1>
              <p className="text-gray-500 text-sm">
                Your uploaded documents for station owner verification
              </p>
            </div>
            <div>
              {documents.isVerified ? (
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                  ✅ Verified
                </span>
              ) : documents.verificationStatus === 'PENDING' ? (
                <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                  ⏳ Pending Review
                </span>
              ) : documents.rejectionReason ? (
                <span className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                  ❌ Rejected
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium">
                  📋 Not Submitted
                </span>
              )}
            </div>
          </div>

          {documents.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                <strong>Rejection Reason:</strong> {documents.rejectionReason}
              </p>
            </div>
          )}

          {fetching ? (
            <div className="text-center py-10 text-gray-500">Loading documents...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DocumentViewer 
                title="Business License"
                icon="📄"
                imageData={documents.businessLicense}
              />

              <DocumentViewer 
                title="Tax ID / TIN"
                icon="📊"
                imageData={documents.taxId}
              />

              <div className="md:col-span-2 max-w-md mx-auto w-full">
                <DocumentViewer 
                  title="Government ID"
                  icon="🪪"
                  imageData={documents.idDocument}
                />
              </div>
            </div>
          )}

          {!fetching && (
            <div className="mt-8 bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-700 mb-3">📋 Verification Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <span className="text-xl">📄</span>
                  <div>
                    <p className="text-sm font-medium">Business License</p>
                    <p className={`text-xs ${hasDocument(documents.businessLicense) ? 'text-green-600' : 'text-gray-400'}`}>
                      {hasDocument(documents.businessLicense) ? '✅ Uploaded' : 'Not Uploaded'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <span className="text-xl">📊</span>
                  <div>
                    <p className="text-sm font-medium">Tax ID / TIN</p>
                    <p className={`text-xs ${hasDocument(documents.taxId) ? 'text-green-600' : 'text-gray-400'}`}>
                      {hasDocument(documents.taxId) ? '✅ Uploaded' : 'Not Uploaded'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <span className="text-xl">🪪</span>
                  <div>
                    <p className="text-sm font-medium">Government ID</p>
                    <p className={`text-xs ${hasDocument(documents.idDocument) ? 'text-green-600' : 'text-gray-400'}`}>
                      {hasDocument(documents.idDocument) ? '✅ Uploaded' : 'Not Uploaded'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ✅ Footer */}
      <Footer />
    </div>
  )
}