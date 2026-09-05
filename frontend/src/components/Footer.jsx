import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Footer() {
  const [showTerms, setShowTerms] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  return (
    <footer className="bg-primary text-white mt-auto border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2">FuelTrack</h3>
            <p className="text-white/70 text-sm">
              Real-time fuel availability in Bahir Dar, Ethiopia
            </p>
          </div>

         

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setShowHelp(!showHelp)
                    setShowTerms(false)
                  }}
                  className="text-white/70 hover:text-white text-sm transition text-left"
                >
                  ❓ Help
                </button>
                {showHelp && (
                  <div className="mt-2 p-3 bg-white/10 rounded-lg text-sm text-white/90 space-y-2">
                    <p><strong>📞 Contact:</strong> +251 912 345 678</p>
                    <p><strong>📧 Email:</strong> support@fueltrack.com</p>
                    <p><strong>⏰ Hours:</strong> Mon-Fri 8:00 AM - 6:00 PM</p>
                    <p><strong>📍 Location:</strong> Bahir Dar, Ethiopia</p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-white/70 hover:text-white">
                        Most Asked Questions
                      </summary>
                      <div className="mt-2 space-y-2 text-white/70">
                        <p><strong>How do I find fuel?</strong> - Use the dashboard to see all stations with real-time availability.</p>
                        <p><strong>How do I register my station?</strong> - Sign up as a Station Owner and go to "Add Station".</p>
                        <p><strong>How do I know if a station has fuel?</strong> - Check the status indicators on each station card.</p>
                      </div>
                    </details>
                  </div>
                )}
              </li>
              <li>
                <button
                  onClick={() => {
                    setShowTerms(!showTerms)
                    setShowHelp(false)
                  }}
                  className="text-white/70 hover:text-white text-sm transition text-left"
                >
                  📋 Terms & Conditions
                </button>
                {showTerms && (
                  <div className="mt-2 p-3 bg-white/10 rounded-lg text-sm text-white/90 space-y-2">
                    <p><strong>1. Acceptance of Terms</strong></p>
                    <p>By using FuelTrack, you agree to these terms.</p>
                    <p><strong>2. User Accounts</strong></p>
                    <p>You must provide accurate information when registering.</p>
                    <p><strong>3. Privacy</strong></p>
                    <p>Your data is protected and never shared with third parties.</p>
                    <p><strong>4. Accuracy</strong></p>
                    <p>Fuel availability is updated by station owners and may not be 100% accurate.</p>
                    <p><strong>5. Liability</strong></p>
                    <p>FuelTrack is not responsible for any losses incurred from using the platform.</p>
                    <p className="text-xs text-white/50 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} FuelTrack. All rights reserved.
          </p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}