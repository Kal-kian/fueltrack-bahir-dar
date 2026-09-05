import { useState } from 'react'

export default function SimpleFooter() {
  const [showTerms, setShowTerms] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-md mx-auto px-4 py-6 text-center">
        {/* Divider */}
        <div className="border-t border-gray-800 pt-3">
          {/* Copyright */}
          <p className="text-gray-500 text-xs mt-2">
              © {new Date().getFullYear()} FuelTrack. All rights reserved.
            </p>

<div>         {/* Links */}
          <div className="flex justify-center gap-4 text-xs">
            <button
              onClick={() => {
                setShowTerms(!showTerms)
                setShowHelp(false)
              }}
              className="text-gray-400 hover:text-white transition"
            >
              Terms
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => {
                setShowHelp(!showHelp)
                setShowTerms(false)
              }}
              className="text-gray-400 hover:text-white transition"
            >
              Help
            </button>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500">Version 1.0.0</span>
          </div></div>

          {/* Terms Content */}
          {showTerms && (
            <div className="mt-3 p-3 bg-gray-800 rounded-lg text-left text-sm text-gray-300 space-y-2">
              <p><strong>Terms & Conditions</strong></p>
              <p>By using FuelTrack, you agree to these terms.</p>
              <p>You must provide accurate information when registering.</p>
              <p>Your data is protected and never shared with third parties.</p>
              <p>Fuel availability is updated by station owners and may not be 100% accurate.</p>
              <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
              <button 
                onClick={() => setShowTerms(false)}
                className="text-primary hover:underline text-sm"
              >
                Close
              </button>
            </div>
          )}

          {/* Help Content */}
          {showHelp && (
            <div className="mt-3 p-3 bg-gray-800 rounded-lg text-left text-sm text-gray-300 space-y-2">
              <p><strong>📞 Contact:</strong> +251 912 345 678</p>
              <p><strong>📧 Email:</strong> support@fueltrack.com</p>
              <p><strong>⏰ Hours:</strong> Mon-Fri 8:00 AM - 6:00 PM</p>
              <p><strong>📍 Location:</strong> Bahir Dar, Ethiopia</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-gray-400 hover:text-white">
                  Most Asked Questions
                </summary>
                <div className="mt-2 space-y-2 text-gray-400 text-xs">
                  <p><strong>How do I find fuel?</strong> - Use the dashboard to see all stations with real-time availability.</p>
                  <p><strong>How do I get SMS alerts?</strong> - Click "SMS Alert" on any station card.</p>
                  <p><strong>How do I register my station?</strong> - Sign up as a Station Owner and go to "Add Station".</p>
                  <p><strong>What if I don't receive the SMS?</strong> - Check your phone number and ensure you have signal.</p>
                </div>
              </details>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-primary hover:underline text-sm"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}