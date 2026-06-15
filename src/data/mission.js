// Mission overview + science-pillar sections, consumed by src/pages/Mission.js.
// The intro section is kept inline in the page since it has unique markup.

export const missionSections = [
  {
    bg: '../img/mission_cosmicweb.jpg',
    overlay: 'gradient',
    kicker: 'Overview',
    title: 'The Via Project',
    paragraphs: [
      'The Via Project is using the Milky Way galaxy as a laboratory to answer fundamental questions about the nature of the universe. Via will conduct an all-sky survey of stars using the 6.5-meter MMT (Arizona) and Magellan (Chile) telescopes. The survey will utilize the ViaSpec instruments, which will be built and deployed on each of the telescopes.',
      'The project is a collaboration between Carnegie Observatories and the Center for Astrophysics | Harvard & Smithsonian. Our team includes experts in conducting large-scale surveys and building astronomical instrumentation. We expect to begin the survey in early 2027 to immediately build on the enabling data released by Gaia DR4 and LSST.',
    ],
  },
  {
    bg: '../img/dm_models_shade.jpg',
    kicker: 'Science Pillar',
    title: 'The Nature of Dark Matter',
    paragraphs: [
      'Motions of stars and galaxies indicate that 85% of matter in the universe is invisible. This dark matter is likely a new type of a fundamental particle. However, it has eluded direct detection in our laboratory experiments, so we don’t know if this particle is massive or ultra-light, nor to what extent the particle interacts with itself or other fundamental particles.',
      'Fortunately, these different particle physics models can be distinguished by using the Milky Way as a laboratory. Within our Galaxy, models predict very different behavior of dark matter: it could be distributed smoothly, or in thousands of small clumps, or even be a sea of turbulent waves. The Via Project will use dozens of recently discovered stellar streams to precisely map the gravitational pull of dark matter, and ultimately reveal its nature.',
    ],
  },
  {
    bg: '../img/ufd.jpg',
    kicker: 'Science Pillar',
    title: 'The Edge of Galaxy Formation',
    paragraphs: [
      'Dwarf galaxy satellites orbiting the Milky Way are among the least massive, most dark-matter-dominated, oldest, and most pristine galaxies known. Insights into the nature of dark matter and the properties of first stars are encoded in the precise motions and detailed chemistry patterns of their stars.',
      'The Via Project will observe dozens of the known dwarf galaxy candidates, as well as hundreds expected to be discovered from the Vera Rubin Observatory. These data will discover how the extremely low-mass systems at the edge of galaxy formation are created.',
    ],
  },
  {
    bg: '../img/outflow_schneider.jpg',
    overlay: 'gradient',
    kicker: 'Science Pillar',
    title: 'The Cold Gas Feeding the Galaxy',
    paragraphs: [
      'Stars in the Milky Way are born from cold gas in a thin disk at a rate that exceeds the capacity of the gas-disk reservoir. Is the gas replenished by direct accretion from the intergalactic medium? Or perhaps via condensation in the hot gaseous halo? Possibly recycled through a Galactic fountain? Or stripped from infalling satellite galaxies?',
      'To disentangle the interplay between these processes, we need to observe the cold gas directly as it rains from the halo. The Via Project will resolve individual gas clouds and precisely measure the density and velocity structure of cold gas in the halo. This will provide the missing link in our understanding of how our galaxy connects to the cosmic web environment, and where we, and all the other stars and planets, come from.',
    ],
  },
];
