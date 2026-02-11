import { useState, useEffect } from 'react';

interface CulturalEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_type: 'holiday' | 'festival' | 'community' | 'marketplace';
  is_featured: boolean;
  related_products_category?: string;
}

export default function CulturalCalendar() {
  const [upcomingEvents, setUpcomingEvents] = useState<CulturalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in production this would come from Supabase
  useEffect(() => {
    const mockEvents: CulturalEvent[] = [
      {
        id: '1',
        title: 'Mashramani (Republic Day)',
        description: "Guyana's Republic Day celebration with parades and festivities",
        event_date: '2026-02-23',
        event_type: 'holiday',
        is_featured: true,
        related_products_category: 'Clothing'
      },
      {
        id: '2',
        title: 'Phagwah (Holi)',
        description: 'Hindu festival of colors celebrated with powder and water',
        event_date: '2026-03-14',
        event_type: 'holiday',
        is_featured: true,
        related_products_category: 'Party Supplies'
      },
      {
        id: '3',
        title: 'Emancipation Day',
        description: 'Celebration of the emancipation of enslaved Africans',
        event_date: '2026-08-01',
        event_type: 'holiday',
        is_featured: true,
        related_products_category: 'Clothing'
      },
      {
        id: '4',
        title: 'Caribana (Toronto)',
        description: 'Caribbean carnival festival in Toronto',
        event_date: '2026-08-01',
        event_type: 'festival',
        is_featured: true,
        related_products_category: 'Clothing'
      },
      {
        id: '5',
        title: 'West Indian American Day Carnival',
        description: "Brooklyn's Labor Day parade and carnival",
        event_date: '2026-09-07',
        event_type: 'festival',
        is_featured: true,
        related_products_category: 'Clothing'
      },
      {
        id: '6',
        title: 'Diwali',
        description: 'Festival of lights celebrated by Hindu and Sikh communities',
        event_date: '2026-10-21',
        event_type: 'holiday',
        is_featured: true,
        related_products_category: 'Home Decor'
      }
    ];

    // Filter to only show upcoming events (next 90 days)
    const today = new Date();
    const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    const upcoming = mockEvents.filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate >= today && eventDate <= ninetyDaysFromNow;
    }).slice(0, 3); // Show max 3 events

    setUpcomingEvents(upcoming);
    setLoading(false);
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'holiday': return '🎉';
      case 'festival': return '🎊';
      case 'community': return '🤝';
      case 'marketplace': return '🛍️';
      default: return '📅';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading || upcomingEvents.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50 border-2 border-purple-200 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗓️</span>
          <h3 className="text-lg font-bold text-gray-800">Upcoming Cultural Events</h3>
        </div>
        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
          Next 90 Days
        </span>
      </div>

      <div className="space-y-3">
        {upcomingEvents.map((event) => {
          const daysUntil = getDaysUntil(event.event_date);
          const isUrgent = daysUntil <= 7;

          return (
            <div
              key={event.id}
              className={`bg-white rounded-xl p-4 border-2 transition-all hover:shadow-md ${
                isUrgent ? 'border-orange-300 bg-orange-50' : 'border-purple-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${
                  isUrgent ? 'bg-orange-100' : 'bg-purple-100'
                }`}>
                  {getEventIcon(event.event_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">
                      {event.title}
                    </h4>
                    {isUrgent && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                        Soon!
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${
                      isUrgent ? 'text-orange-700' : 'text-purple-700'
                    }`}>
                      📅 {formatDate(event.event_date)}
                    </span>

                    {event.related_products_category && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        🛍️ Shop {event.related_products_category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-purple-200">
        <p className="text-xs text-gray-600 text-center">
          💡 <strong>Tip:</strong> Plan ahead! Many items for these events can be shipped to Guyana via cargo.
        </p>
      </div>
    </div>
  );
}
