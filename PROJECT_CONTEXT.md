# SmartCommute Product Context

SmartCommute is a real-location commute optimizer and fare comparison website for Pune.

The user goal is not a bus-stop-only route finder. The goal is:

- Let users enter any real source and destination: address, area, landmark, current location, or map click.
- Geocode those places to coordinates. Bus stops and metro stations are internal routing data, not the primary search UX.
- Compare estimated fares and ETAs across multiple travel providers/modes:
  - Uber
  - Ola
  - Rapido
  - Auto/rickshaw
  - PMPML bus
  - Pune Metro
  - mixed public routes such as walk + bus + walk, walk + metro + walk, bus + metro.
- Use real road-network distance, ETA, traffic and route geometry where possible through Google Maps API or OpenRouteService. Haversine distance is only a fallback, never the desired primary route distance.
- Estimate prices when live provider APIs are unavailable using:
  - road distance
  - road ETA
  - traffic level
  - current time / peak hour
  - weekday/weekend/calendar context
  - weather/surge placeholder
  - provider fare rules
  - ML fare dataset/model where useful
- Show all route options on the map, not just a straight line:
  - cab/auto/bike road route
  - bus GTFS shape path
  - metro path
  - walking connectors
- Recommend best options:
  - cheapest
  - fastest
  - best overall
  - eco-friendly
  - least walking / comfort-oriented
- Each option should show fare breakdown:
  - base fare
  - distance charge
  - time charge
  - surge/traffic/weather adjustment
  - public transit ticket estimate
- Final UX should answer: “Should I take Uber/Ola/Rapido/auto, or save money with bus/metro, and what route should I follow?”

When continuing development, read this file before making product decisions.
