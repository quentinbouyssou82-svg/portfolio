const u = (id: string, w = 2400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** IDs vérifiés (HTTP 200) */
export const images = {
  bellaVista: {
    hero: u("photo-1414235077428-338989a2e8c0"),
    dish1: u("photo-1565299624946-b28f40a0ae38"),
    dish2: u("photo-1544025162-d76694265947"),
    dish3: u("photo-1567620905732-2d1ec7ab7445"),
    dish4: u("photo-1555939594-58d7cb561ad1"),
    dish5: u("photo-1504674900247-0877df9cc836"),
    dish6: u("photo-1540189549336-e6e99c3679fe"),
    interior: u("photo-1517248135467-4c7edcad34c4"),
    chef: u("photo-1551218808-94e220e084d2"),
    map: u("photo-1523906834658-6e24ef2386f9", 1600),
    gallery: [
      u("photo-1424847651672-bf20a4b0982b", 1600),
      u("photo-1504674900247-0877df9cc836", 1600),
      u("photo-1540189549336-e6e99c3679fe", 1600),
      u("photo-1517248135467-4c7edcad34c4", 1600),
      u("photo-1555939594-58d7cb561ad1", 1600),
      u("photo-1565299624946-b28f40a0ae38", 1600),
    ],
  },
  titanFitness: {
    hero: u("photo-1534438327276-14e5300c3a48"),
    program1: u("photo-1571019613454-1cb2f99b2d8b"),
    program2: u("photo-1517836357463-d25dfeac3438"),
    program3: u("photo-1518611012118-696072aa579a"),
    coach1: u("photo-1574680096145-d05b474e2155"),
    coach2: u("photo-1594381898411-846e7d193883"),
    coach3: u("photo-1506126613408-eca07ce68773"),
    transform1: u("photo-1534438327276-14e5300c3a48"),
    transform2: u("photo-1517836357463-d25dfeac3438"),
    transform3: u("photo-1571019613454-1cb2f99b2d8b"),
  },
  novaHabitat: {
    hero: u("photo-1600585154340-be6161a56a0c"),
    service1: u("photo-1600607687939-ce8a6c25118c"),
    service2: u("photo-1600566753190-17f0baa2a6c3"),
    service3: u("photo-1600210492493-0946911123ea"),
    before1: u("photo-1600585154526-990dced4db0d"),
    after1: u("photo-1600607687644-c7171b42498f"),
    before2: u("photo-1600585154340-be6161a56a0c"),
    after2: u("photo-1600566753190-17f0baa2a6c3"),
    before3: u("photo-1600607687939-ce8a6c25118c"),
    after3: u("photo-1600210492493-0946911123ea"),
  },
};
