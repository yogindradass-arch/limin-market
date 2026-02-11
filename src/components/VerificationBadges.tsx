interface VerificationBadgesProps {
  phoneVerified?: boolean;
  emailVerified?: boolean;
  idVerified?: boolean;
  businessVerified?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  layout?: 'horizontal' | 'vertical' | 'compact';
}

export default function VerificationBadges({
  phoneVerified = false,
  emailVerified = false,
  idVerified = false,
  businessVerified = false,
  size = 'medium',
  showLabels = true,
  layout = 'horizontal'
}: VerificationBadgesProps) {

  const badges = [
    {
      key: 'phone',
      verified: phoneVerified,
      icon: '📱',
      label: 'Phone',
      color: 'green',
      description: 'Phone number verified'
    },
    {
      key: 'email',
      verified: emailVerified,
      icon: '✉️',
      label: 'Email',
      color: 'blue',
      description: 'Email address verified'
    },
    {
      key: 'id',
      verified: idVerified,
      icon: '🪪',
      label: 'ID',
      color: 'purple',
      description: 'Government ID verified'
    },
    {
      key: 'business',
      verified: businessVerified,
      icon: '🏢',
      label: 'Business',
      color: 'orange',
      description: 'Business account verified'
    }
  ];

  const activeBadges = badges.filter(badge => badge.verified);

  if (activeBadges.length === 0 && layout !== 'compact') {
    return (
      <div className="text-xs text-gray-400 italic">
        No verifications yet
      </div>
    );
  }

  if (activeBadges.length === 0) return null;

  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-2.5 py-1',
    large: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const getColorClasses = (color: string, verified: boolean) => {
    if (!verified) {
      return 'bg-gray-100 text-gray-400 border-gray-200';
    }

    const colors = {
      green: 'bg-green-50 text-green-700 border-green-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200'
    };

    return colors[color as keyof typeof colors] || colors.green;
  };

  // Compact layout - just show checkmark with count
  if (layout === 'compact') {
    return (
      <div className="inline-flex items-center gap-1">
        <span className="text-green-600 font-bold">✓</span>
        <span className="text-xs font-medium text-gray-700">
          {activeBadges.length} verified
        </span>
      </div>
    );
  }

  // Vertical layout
  if (layout === 'vertical') {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Verifications
        </h4>
        {badges.map(badge => (
          <div
            key={badge.key}
            className={`flex items-center gap-2 p-2 rounded-lg border ${
              badge.verified
                ? getColorClasses(badge.color, true)
                : 'bg-gray-50 border-gray-200'
            }`}
            title={badge.verified ? badge.description : `${badge.label} not verified`}
          >
            <span className={iconSizes[size]}>{badge.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${badge.verified ? 'text-gray-900' : 'text-gray-400'}`}>
                {badge.label}
              </p>
            </div>
            {badge.verified ? (
              <span className="text-green-600 font-bold text-sm">✓</span>
            ) : (
              <span className="text-gray-300 text-sm">○</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Horizontal layout (default)
  return (
    <div className="flex flex-wrap gap-2">
      {showLabels && activeBadges.length > 0 && (
        <span className="text-xs font-semibold text-gray-600 self-center mr-1">
          Verified:
        </span>
      )}
      {badges.map(badge => {
        if (!badge.verified) return null;

        return (
          <div
            key={badge.key}
            className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses[size]} ${getColorClasses(badge.color, badge.verified)}`}
            title={badge.description}
          >
            <span className={iconSizes[size]}>{badge.icon}</span>
            {showLabels && (
              <span>{badge.label}</span>
            )}
            <span className="font-bold">✓</span>
          </div>
        );
      })}
    </div>
  );
}

// Separate component for displaying verification status inline
export function VerificationStatus({
  phoneVerified = false,
  emailVerified = false,
  idVerified = false,
  businessVerified = false
}: Omit<VerificationBadgesProps, 'size' | 'showLabels' | 'layout'>) {
  const verificationCount = [phoneVerified, emailVerified, idVerified, businessVerified].filter(Boolean).length;

  if (verificationCount === 0) {
    return (
      <span className="text-xs text-gray-400">
        Unverified
      </span>
    );
  }

  const level = verificationCount === 4 ? 'Fully Verified' :
                verificationCount === 3 ? 'Highly Verified' :
                verificationCount === 2 ? 'Verified' : 'Partially Verified';

  const colorClass = verificationCount >= 3 ? 'text-green-600' :
                     verificationCount === 2 ? 'text-blue-600' : 'text-yellow-600';

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`text-sm font-semibold ${colorClass}`}>
        ✓ {level}
      </span>
      <span className="text-xs text-gray-500">
        ({verificationCount}/4)
      </span>
    </div>
  );
}

// Component for verification prompt (encourage users to verify)
export function VerificationPrompt() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
          🛡️
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-1">Build Trust with Verification</h4>
          <p className="text-sm text-gray-600 mb-3">
            Verified sellers get 3x more inquiries and sell faster!
          </p>
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">○</span>
              <span className="text-gray-600">📱 Verify your phone number</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">○</span>
              <span className="text-gray-600">✉️ Verify your email address</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">○</span>
              <span className="text-gray-600">🪪 Upload government ID (optional)</span>
            </div>
          </div>
          <button className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
            Start Verification
          </button>
        </div>
      </div>
    </div>
  );
}
