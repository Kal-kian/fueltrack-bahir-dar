import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'
import SimpleFooter from '../components/SimpleFooter'

export default function Signup() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'USER',
    businessLicense: null,
    taxId: null,
    idDocument: null
  })

  const [previews, setPreviews] = useState({
    businessLicense: null,
    taxId: null,
    idDocument: null
  })

  const isStationOwner = formData.role === 'STATION_OWNER'

  const handleFileChange = (field, file) => {
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload PDF, JPG, or PNG files')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result.split(',')[1] }))
      setPreviews(prev => ({ ...prev, [field]: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleNext = () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (isStationOwner) {
      setStep(2)
    } else {
      // Drivers go directly to review (step 3)
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    } else if (step === 3) {
      if (isStationOwner) {
        setStep(2)
      } else {
        setStep(1)
      }
    }
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  
  if (!agreedToTerms) {
    toast.error('Please agree to the Terms & Policies')
    return
  }

  if (isStationOwner) {
    if (!formData.businessLicense) {
      toast.error('Please upload your Business License')
      return
    }
    if (!formData.idDocument) {
      toast.error('Please upload your Government ID')
      return
    }
  }

  setLoading(true)
  try {
    const response = await register(
      formData.fullName,
      formData.email || formData.phone,
      formData.phone,
      formData.password,
      formData.role,
      formData.businessLicense,
      formData.taxId,
      formData.idDocument,
      agreedToTerms
    )
    
    toast.success('Account created successfully!')
    
    if (isStationOwner) {
      // ✅ Fix: Use toast() or toast.success() instead of toast.info()
      toast.success('Your documents are being reviewed. You will be notified once approved.')
    }
    
    setTimeout(() => navigate('/login'), 2500)
    
  } catch (err) {
    console.error('Registration error:', err)
    toast.error(err.response?.data?.error || 'Registration failed. Please try again.')
  } finally {
    setLoading(false)
  }
}
  // ✅ RENDER DOCUMENT UPLOAD (Only for Station Owners)
  const renderDocumentUpload = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-lg text-sm">
        📄 Please upload your legal documents for verification. All documents are securely stored.
      </div>

      {/* Business License */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
          Business License *
        </label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition cursor-pointer"
          onClick={() => document.getElementById('businessLicense').click()}
        >
          <input
            id="businessLicense"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFileChange('businessLicense', e.target.files[0])}
          />
          {previews.businessLicense ? (
            <div>
              <p className="text-green-600">✓ File uploaded</p>
              <p className="text-sm text-gray-500 mt-1">Click to change</p>
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-1">📄</div>
              <p className="text-gray-500 text-sm">Click to upload Business License</p>
              <p className="text-gray-400 text-xs">PDF, JPG, PNG (max 5MB)</p>
            </div>
          )}
        </div>
      </div>

      {/* Tax ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
          Tax ID / TIN (Optional)
        </label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition cursor-pointer"
          onClick={() => document.getElementById('taxId').click()}
        >
          <input
            id="taxId"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFileChange('taxId', e.target.files[0])}
          />
          {previews.taxId ? (
            <div>
              <p className="text-green-600">✓ File uploaded</p>
              <p className="text-sm text-gray-500 mt-1">Click to change</p>
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-1">📊</div>
              <p className="text-gray-500 text-sm">Click to upload Tax ID</p>
              <p className="text-gray-400 text-xs">PDF, JPG, PNG (max 5MB)</p>
            </div>
          )}
        </div>
      </div>

      {/* Government ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
          Government ID *
        </label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition cursor-pointer"
          onClick={() => document.getElementById('idDocument').click()}
        >
          <input
            id="idDocument"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFileChange('idDocument', e.target.files[0])}
          />
          {previews.idDocument ? (
            <div>
              <p className="text-green-600">✓ File uploaded</p>
              <p className="text-sm text-gray-500 mt-1">Click to change</p>
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-1">🪪</div>
              <p className="text-gray-500 text-sm">Click to upload Government ID</p>
              <p className="text-gray-400 text-xs">PDF, JPG, PNG (max 5MB)</p>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setStep(3)}
        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-light transition"
      >
        Review & Submit
      </button>
    </div>
  )

  // ✅ RENDER REVIEW (For everyone - includes checkbox and submit)
  const renderReview = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Review Your Information</h3>
      
      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
        <p><span className="font-medium">Name:</span> {formData.fullName}</p>
        <p><span className="font-medium">Email:</span> {formData.email || formData.phone}</p>
        <p><span className="font-medium">Role:</span> {isStationOwner ? 'Station Owner' : 'Driver / Business'}</p>
        {isStationOwner && (
          <div className="mt-2 pt-2 border-t">
            <p className="font-medium text-primary">Documents:</p>
            {formData.businessLicense && <p className="text-green-600 text-xs">✓ Business License uploaded</p>}
            {formData.taxId && <p className="text-green-600 text-xs">✓ Tax ID uploaded</p>}
            {formData.idDocument && <p className="text-green-600 text-xs">✓ Government ID uploaded</p>}
          </div>
        )}
      </div>

      {/* ✅ Terms Checkbox */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-1 w-4 h-4 text-primary focus:ring-primary"
          required
        />
        <label htmlFor="terms" className="text-sm text-gray-600">
          I agree to the{' '}
          <button
  type="button"
  onClick={() => toast('Terms & Policies will be available soon')}
  className="text-primary hover:underline"
>
  Terms & Policies
</button>
          {' '}and confirm that all information provided is accurate.
        </label>
      </div>

      {/* ✅ Submit Button */}
      <button
        type="submit"
        disabled={loading || !agreedToTerms}
        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-light transition disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Logo size="lg" showText={true} textColor="text-black" textSize="text-3xl" layout="vertical" />
          </div>

          <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Create Account</h2>
          <p className="text-gray-500 text-sm text-center mb-6">
            {step === 1 && 'Create your account to get started.'}
            {step === 2 && 'Upload your legal documents.'}
            {step === 3 && 'Review and confirm your details.'}
          </p>

          {/* Step Indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {isStationOwner ? (
              [1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s === step
                      ? 'bg-primary text-white'
                      : s < step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
              ))
            ) : (
              <>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 1 ? 'bg-primary text-white' : step > 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > 1 ? '✓' : '1'}
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  2
                </div>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    placeholder="Amanuel Tesfaye"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
                    EMAIL OR PHONE NUMBER *
                  </label>
                  <input
                    type="text"
                    placeholder="ammanuel@example.com or 0912345678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">
                    PASSWORD *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                    I AM A... *
                  </label>
                  <div className="space-y-2">
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                      formData.role === 'USER' ? 'border-primary bg-primary/5' : ''
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="USER"
                        checked={formData.role === 'USER'}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Driver / Business</div>
                        <div className="text-sm text-gray-500">Find fuel near you</div>
                      </div>
                    </label>
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                      formData.role === 'STATION_OWNER' ? 'border-primary bg-primary/5' : ''
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="STATION_OWNER"
                        checked={formData.role === 'STATION_OWNER'}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Station Owner</div>
                        <div className="text-sm text-gray-500">Manage your stations</div>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-light transition"
                >
                  {isStationOwner ? 'Next: Documents →' : 'Review & Submit →'}
                </button>
              </div>
            )}

            {/* Step 2: Documents (Only for Station Owners) */}
            {step === 2 && isStationOwner && renderDocumentUpload()}

            {/* Step 3: Review (For everyone) */}
            {step === 3 && renderReview()}
          </form>

          <p className="text-center mt-4 text-sm text-gray-600">
            Already registered?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
          <SimpleFooter />
        </div>      
      </div>
           
    </div>
  )
}
 
