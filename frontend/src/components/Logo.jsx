import logo from '../assets/FuleTrack logo.png'

export default function Logo({ 
  size = 'md', 
  showText = true, 
  textColor = 'text-white',
  textSize = 'text-xl',
  layout = 'horizontal'
}) {
  const sizeClasses = {
    sm: 'w-10 h-10',      // 1x (original)
    md: 'w-14 h-14',      // 1.4x
    lg: 'w-20 h-20',      // 2x (this is the one we want)
    xl: 'w-24 h-24',      // 2.4x
    '2xl': 'w-28 h-28'    // 2.8x
  }

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',       // 2x text size
    xl: 'text-4xl',
    '2xl': 'text-5xl'
  }

  const subTextSizes = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
    '2xl': 'text-lg'
  }

  if (layout === 'horizontal') {
    return (
      <div className="flex items-center gap-3">
        <img 
          src={logo} 
          alt="FuelTrack Logo" 
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white/30 shadow-md`}
        />
        {showText && (
          <div className="flex flex-col">
            <span className={`font-bold ${textSizes[size]} ${textColor} drop-shadow-md`}>FuelTrack</span>
            <span className={`${subTextSizes[size]} ${textColor} opacity-80 -mt-1 drop-shadow-sm`}>BAHIR DAR</span>
          </div>
        )}
      </div>
    )
  }

  // Vertical: logo on top, text below (centered)
  return (
    <div className="flex flex-col items-center gap-2">
      <img 
        src={logo} 
        alt="FuelTrack Logo" 
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 shadow-lg`}
      />
      {showText && (
        <div className="flex flex-col items-center">
          <span className={`font-bold ${textSizes[size]} ${textColor} drop-shadow-sm`}>FuelTrack</span>
          <span className={`${subTextSizes[size]} ${textColor} opacity-80 -mt-1`}>BAHIR DAR</span>
        </div>
      )}
    </div>
  )
}