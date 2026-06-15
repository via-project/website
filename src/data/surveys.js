// The four component surveys of the Via Survey, listed on src/pages/Survey.js.
// Colors match the footprint figure's legend.
export const surveys = [
  {
    title: 'Stream Perturbation',
    color: '#5aa9e6',
    description:
      'The Stream Perturbation Survey targets cold stellar streams in the Milky Way to measure the abundance, mass, and size of dark-matter subhalos below the threshold of galaxy formation, through the unique velocity signatures their impacts leave on streams. Via will have the velocity precision and sensitivity to detect ~10⁶ M⊙ subhalos — reaching the regime of completely dark subhalos — across the many streams needed to overcome the stochasticity of impacts and robustly measure the low-mass subhalo population. Stream targets follow an initial selection strategy that will be refined with Rubin/LSST observations.',
  },
  {
    title: 'Dwarf Galaxy',
    color: '#b07cd6',
    description:
      'The Dwarf Galaxy Survey targets Milky Way satellite galaxies down to the critical mass threshold of galaxy formation, providing a key spectroscopic complement to the scores of photometric discoveries anticipated from LSST, Euclid, and Roman. A key strength of Via\'s dwarf galaxy survey is homogeneity: all observations will be carried out with the same instrument, velocity and abundance pipelines, and a self-consistent targeting strategy. ',
  },
  {
    title: 'Cold Gas',
    color: '#e6c84f',
    description:
      "Using hundreds of thousands of Milky Way halo stars as backlights, the Cold Gas Survey maps the distribution of cold gas in the circumgalactic medium across three spatial dimensions and one velocity dimension. Via's high spectral resolution robustly separates interstellar absorption from stellar sodium features at most velocities — so rather than just bracketing the distance to large individual clouds, we reconstruct the entire distribution of gas density and velocity.",
  },
  {
    title: 'Transient Followup',
    color: '#e0685f',
    description:
      "The Vera Rubin Observatory's LSST will discover millions of astrophysical transients over its 10-year survey. Whenever Via is on-sky — at MMT or Magellan, nearly four months of the year — instantaneous follow-up is enabled. Boombox fibers are devoted to transients and their host galaxies in every Via pointing, driving targeted follow-up of the most interesting LSST transients, including gravitational-wave counterparts, young supernovae and precursor events, and unexpected phenomena flagged by machine learning.",
  },
];

// Smaller ancillary science cases that share the survey fibers.
export const ancillarySurveys = [
  'Quasars and the Lyα forest',
  'Host galaxies of fast radio bursts',
  'Gravitational lenses',
  'Integrated kinematics of low-mass galaxies',
  'White dwarfs',
  'Metal-poor stars',
  'Distant red giants',
  'Gaia astrometric binaries',
  'Convection, pulsation, and mass loss in evolved stars',
  'Bright exoplanet candidate host stars',
  'Comets',
];
