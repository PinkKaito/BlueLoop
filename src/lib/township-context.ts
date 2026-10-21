import type { TownshipId } from './simulation';

export const HACKATHON_CONTEXT = {
  name: 'Sime Darby Property University Hackathon',
  theme: 'Planet: water conservation, circular reuse & climate resilience',
  sourceUrl: 'https://www.simedarbyproperty.com/universityhackathon/',
};

// Public asset references explain the concept's setting. All hydraulic assets and
// dimensions in the simulation are invented demonstration infrastructure.
export const TOWNSHIP_CONTEXT: Record<TownshipId, {
  location: string;
  referenceAsset: string;
  referenceSummary: string;
  sourceUrl: string;
  proposedUse: string;
  pondLabel: string;
  tankLabel: string;
}> = {
  elmina: {
    location: 'Shah Alam, Selangor, Malaysia',
    referenceAsset: 'Elmina Central Park',
    referenceSummary: 'Sime Darby Property describes a 300-acre Central Park in City of Elmina, providing a relevant setting for a park water-reuse concept.',
    sourceUrl: 'https://www.simedarbyproperty.com/city-of-elmina/',
    proposedUse: 'Reuse retained stormwater for park landscaping and create pond headroom before a monsoon storm.',
    pondLabel: 'Elmina DEMO-01',
    tankLabel: 'Park reuse (demo)',
  },
};
